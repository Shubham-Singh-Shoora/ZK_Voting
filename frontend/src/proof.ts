import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@noir-lang/backend_barretenberg";
import circuit from "./dao.json";

const MAX_MERKLE_DEPTH = 6;

let backend: UltraHonkBackend | null = null;
let noir: Noir | null = null;

async function initNoir() {
    if (!backend || !noir) {
        // @ts-expect-error - circuit JSON type
        backend = new UltraHonkBackend(circuit);
        // @ts-expect-error - circuit JSON type
        noir = new Noir(circuit);
    }
    return { backend, noir };
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

export async function generateProof(inputs: ProofInputs): Promise<ProofResult> {
    const { backend, noir } = await initNoir();

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

    // Generate proof
    const proof = await backend!.generateProof(witness);

    return {
        proof: proof.proof,
        publicInputs: proof.publicInputs,
    };
}
