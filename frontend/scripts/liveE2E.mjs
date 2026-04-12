import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ethers } from "ethers";
import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@noir-lang/backend_barretenberg";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAX_MERKLE_DEPTH = 6;
const PROPOSER_ROUND = 999;
const VOTER_ROUND = 1;
const BN254_FIELD_MODULUS =
    21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const PROPOSER_REGISTRATION_ID_FIELD = ethers.MaxUint256 % BN254_FIELD_MODULUS;

const DAO_ABI = [
    "function proposalCount() external view returns (uint256)",
    "function proposerEligibilityRound() external view returns (uint256)",
    "function monitor() external view returns (address)",
    "function eligibilityRegistry() external view returns (address)",
    "function createProposal(string calldata _description, uint256 _eligibilityRound, uint256 _duration) external returns (uint256)",
    "function registerProposer(bytes calldata _proof, bytes32[] calldata _publicInputs) external",
    "function vote(uint256 _proposalId, bool _support, bytes calldata _proof, bytes32[] calldata _publicInputs) external",
    "function getProposal(uint256 _proposalId) external view returns (string memory description, uint256 yesVotes, uint256 noVotes, uint256 startTime, uint256 endTime, uint256 eligibilityRound, bytes32 merkleRoot, bool executed, bool cancelled, address proposer)",
    "function isProposer(address _candidate) external view returns (bool)",
];

const REGISTRY_ABI = [
    "function getRoot(uint256 _roundId) external view returns (bytes32)",
    "function rootExists(uint256 _roundId) external view returns (bool)",
];

function loadEnvFile(filePath) {
    const values = {};
    const lines = readFileSync(filePath, "utf8").split(/\r?\n/);
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) {
            continue;
        }
        const [key, ...rest] = trimmed.split("=");
        values[key.trim()] = rest.join("=").trim();
    }
    return values;
}

function loadJson(filePath) {
    return JSON.parse(readFileSync(filePath, "utf8"));
}

function normalizeCredential(raw) {
    return {
        secret: BigInt(raw.secret),
        pathElements: raw.pathElements.map((value) => BigInt(value)),
        pathIndices: raw.pathIndices,
    };
}

function toBytes32Inputs(publicInputs) {
    return publicInputs.map((input) =>
        ethers.zeroPadValue(ethers.toBeHex(BigInt(input)), 32),
    );
}

function padMerklePath(pathElements, pathIndices) {
    const paddedElements = [...pathElements];
    const paddedIndices = [...pathIndices];

    while (paddedElements.length < MAX_MERKLE_DEPTH) {
        paddedElements.push(0n);
        paddedIndices.push(false);
    }

    return {
        paddedElements,
        paddedIndices,
    };
}

async function generateProof(noir, backend, inputs) {
    if (inputs.pathElements.length !== inputs.pathIndices.length) {
        throw new Error("Merkle path elements and indices length mismatch.");
    }
    if (inputs.pathElements.length > MAX_MERKLE_DEPTH) {
        throw new Error(`Unsupported Merkle path length: ${inputs.pathElements.length}`);
    }

    const { paddedElements, paddedIndices } = padMerklePath(
        inputs.pathElements,
        inputs.pathIndices,
    );

    const circuitInputs = {
        secret: inputs.secret.toString(),
        path_elements: paddedElements.map((value) => value.toString()),
        path_indices: paddedIndices,
        proposal_id: inputs.proposalId.toString(),
        root: inputs.root.toString(),
    };

    const { witness } = await noir.execute(circuitInputs);
    return backend.generateProof(witness);
}

function isNullifierUsedError(error) {
    const message = String(error?.shortMessage || error?.message || "");
    return message.includes("NullifierAlreadyUsed");
}

async function waitForProposalActivation(provider, startTime) {
    for (; ;) {
        const latestBlock = await provider.getBlock("latest");
        if (!latestBlock) {
            throw new Error("Failed to fetch latest block.");
        }

        if (latestBlock.timestamp >= startTime) {
            return latestBlock.timestamp;
        }

        const eta = startTime - latestBlock.timestamp;
        console.log(`Waiting for proposal start. ETA: ~${eta}s`);
        await new Promise((resolve) => {
            provider.once("block", () => resolve(undefined));
        });
    }
}

async function main() {
    const repoRoot = path.resolve(__dirname, "..", "..");
    const onChainEnvPath = path.join(repoRoot, "on-chain", "contracts", ".env");
    const frontendEnvPath = path.join(repoRoot, "frontend", ".env");

    const onChainEnv = loadEnvFile(onChainEnvPath);
    const frontendEnv = loadEnvFile(frontendEnvPath);

    const privateKey = onChainEnv.PRIVATE_KEY;
    const rpcUrl = onChainEnv.RPC_URL || frontendEnv.VITE_RPC_URL;
    const daoAddress = onChainEnv.DAO_ADDRESS || frontendEnv.VITE_DAO_CONTRACT_ADDRESS;

    if (!privateKey || !rpcUrl || !daoAddress) {
        throw new Error("Missing PRIVATE_KEY, RPC_URL, or DAO_ADDRESS in .env.");
    }

    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const dao = new ethers.Contract(daoAddress, DAO_ABI, signer);

    const monitor = await dao.monitor();
    const registryAddress = await dao.eligibilityRegistry();
    const proposerRound = Number(await dao.proposerEligibilityRound());
    const isSignerProposerBefore = await dao.isProposer(await signer.getAddress());

    console.log(`DAO: ${daoAddress}`);
    console.log(`Monitor: ${monitor}`);
    console.log(`Signer: ${await signer.getAddress()}`);
    console.log(`Proposer round: ${proposerRound}`);
    console.log(`Signer proposer before: ${isSignerProposerBefore}`);

    if (proposerRound !== PROPOSER_ROUND) {
        throw new Error(`Unexpected proposer round ${proposerRound}. Expected ${PROPOSER_ROUND}.`);
    }

    const registry = new ethers.Contract(registryAddress, REGISTRY_ABI, provider);
    const proposerRootHex = await registry.getRoot(PROPOSER_ROUND);
    const voterRootHex = await registry.getRoot(VOTER_ROUND);

    const proposalCountBefore = Number(await dao.proposalCount());
    const createTx = await dao.createProposal("E2E live sanity proposal", VOTER_ROUND, 3600);
    await createTx.wait();
    const proposalId = proposalCountBefore;
    console.log(`Created proposal #${proposalId}`);

    const circuitPath = path.join(repoRoot, "frontend", "src", "dao.json");
    const proposerCredsPath = path.join(repoRoot, "frontend", "src", "proposer_credentials_999.json");
    const voterCredsPath = path.join(repoRoot, "frontend", "src", "voter_credentials_1.json");

    const circuit = loadJson(circuitPath);
    const proposerCreds = loadJson(proposerCredsPath).voters.map(normalizeCredential);
    const voterCreds = loadJson(voterCredsPath).voters.map(normalizeCredential);

    const backend = new UltraHonkBackend(circuit);
    const noir = new Noir(circuit);

    let proposerRegistered = false;
    for (const credential of proposerCreds) {
        try {
            const proposerProof = await generateProof(noir, backend, {
                secret: credential.secret,
                pathElements: credential.pathElements,
                pathIndices: credential.pathIndices,
                proposalId: PROPOSER_REGISTRATION_ID_FIELD,
                root: BigInt(proposerRootHex),
            });

            const proposerPublicInputs = toBytes32Inputs(proposerProof.publicInputs);

            const tx = await dao.registerProposer(proposerProof.proof, proposerPublicInputs);
            await tx.wait();
            proposerRegistered = true;
            console.log("Proposer registration tx succeeded.");
            break;
        } catch (error) {
            if (isNullifierUsedError(error)) {
                continue;
            }
            throw error;
        }
    }

    if (!proposerRegistered) {
        throw new Error("Could not register proposer: all proposer credentials have used nullifiers.");
    }

    const proposal = await dao.getProposal(proposalId);
    const startTime = Number(proposal.startTime);
    const endTime = Number(proposal.endTime);
    console.log(`Proposal window: start=${startTime}, end=${endTime}`);

    await waitForProposalActivation(provider, startTime);

    let voteCast = false;
    for (const credential of voterCreds) {
        try {
            const voteProof = await generateProof(noir, backend, {
                secret: credential.secret,
                pathElements: credential.pathElements,
                pathIndices: credential.pathIndices,
                proposalId: BigInt(proposalId),
                root: BigInt(voterRootHex),
            });

            const votePublicInputs = toBytes32Inputs(voteProof.publicInputs);
            const tx = await dao.vote(proposalId, true, voteProof.proof, votePublicInputs);
            await tx.wait();
            voteCast = true;
            console.log("Vote tx succeeded.");
            break;
        } catch (error) {
            if (isNullifierUsedError(error)) {
                continue;
            }
            throw error;
        }
    }

    if (!voteCast) {
        throw new Error("Could not cast vote: all voter credentials have used nullifiers.");
    }

    const updatedProposal = await dao.getProposal(proposalId);
    console.log(`Final tally for #${proposalId}: yes=${updatedProposal.yesVotes}, no=${updatedProposal.noVotes}`);
}

main().catch((error) => {
    console.error("E2E live check failed:", error);
    process.exitCode = 1;
});
