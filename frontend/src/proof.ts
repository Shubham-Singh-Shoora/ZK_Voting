import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend, Barretenberg } from "@aztec/bb.js";
import circuit from "./dao.json";

const MAX_MERKLE_DEPTH = 6;
const BACKEND_OPTIONS = {
    // Keep prover runtime conservative in browsers to reduce WASM worker crashes.
    threads: 1,
};

let backend: UltraHonkBackend | null = null;
let noir: Noir | null = null;
let bbApi: Barretenberg | null = null;

async function initNoir() {
    if (!backend || !noir) {
        bbApi = await Barretenberg.new(BACKEND_OPTIONS);
        backend = new UltraHonkBackend(circuit.bytecode, bbApi);
        noir = new Noir(circuit as any);
    }
    return { backend, noir };
}

function isWasmRuntimeTrap(error: unknown) {
    const message = String((error as { message?: string })?.message ?? error ?? "").toLowerCase();
    return message.includes("runtimeerror") || message.includes("unreachable");
}

async function resetNoirBackend() {
    if (bbApi) {
        try {
            await bbApi.destroy();
        } catch {
            // Ignore destroy failures and continue with clean re-init.
        }
    }
    bbApi = null;
    backend = null;
    noir = null;
}

export interface ProofInputs {
    secret: bigint;
    pathElements: bigint[];
    pathIndices: boolean[];
    proposalId: bigint;
    root: bigint;
}

export interface ProofResult {
    proof: Uint8Array;
    publicInputs: string[];
}

export async function getCurrentVerifier(target: "evm" | "evm-no-zk" = "evm-no-zk") {
    const { backend } = await initNoir();
    const vk = await backend.getVerificationKey({ verifierTarget: target });
    return await backend.getSolidityVerifier(vk, { verifierTarget: target });
}

export async function generateProof(inputs: ProofInputs): Promise<ProofResult> {
    let { backend, noir } = await initNoir();

    if (inputs.pathElements.length !== inputs.pathIndices.length) {
        throw new Error("Merkle path elements and indices length mismatch.");
    }

    if (inputs.pathElements.length > MAX_MERKLE_DEPTH) {
        throw new Error(
            `Merkle path length ${inputs.pathElements.length} is unsupported. Expected <=${MAX_MERKLE_DEPTH}.`,
        );
    }

    const paddedPathElements = [...inputs.pathElements];
    const paddedPathIndices = [...inputs.pathIndices];

    while (paddedPathElements.length < MAX_MERKLE_DEPTH) {
        paddedPathElements.push(0n);
        paddedPathIndices.push(false);
    }

    // Format inputs for Noir circuit
    const circuitInputs = {
        secret: inputs.secret.toString(),
        path_elements: paddedPathElements.map((e) => e.toString()),
        path_indices: paddedPathIndices,
        proposal_id: inputs.proposalId.toString(),
        root: inputs.root.toString(),
    };

    // Generate witness
    const { witness } = await noir!.execute(circuitInputs);

    let proof;
    try {
        // Generate proof with 'evm-no-zk' to match Solidity verifier's 229-field expectation.
        proof = await backend!.generateProof(witness, { verifierTarget: 'evm-no-zk' });
    } catch (error) {
        if (!isWasmRuntimeTrap(error)) {
            throw error;
        }

        console.warn("Noir backend trapped. Reinitializing and retrying non-ZK proof generation...");
        // Retry once after reinitializing WASM worker state.
        await resetNoirBackend();
        ({ backend, noir } = await initNoir());
        const { witness: retryWitness } = await noir!.execute(circuitInputs);

        try {
            proof = await backend!.generateProof(retryWitness, { verifierTarget: 'evm-no-zk' });
        } catch (retryError) {
            throw new Error(
                "Proof runtime crashed in browser WASM even after retry. Restart the dev server, hard-refresh the page, and try proposer registration again.",
                { cause: retryError },
            );
        }
    }

    return {
        proof: proof.proof,
        publicInputs: proof.publicInputs,
    };
}
