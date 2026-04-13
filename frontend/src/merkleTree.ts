/**
 * Hardcoded Merkle tree for demo with 4 voters
 * Secrets: 11, 22, 33, 44
 * 
 * Tree structure:
 *          root
 *         /    \
 *     level1[0]  level1[1]
 *       /  \       /  \
 *    leaf0 leaf1 leaf2 leaf3
 *    (11)  (22)  (33)  (44)
 */

// Precomputed leaves: hash(secret) using Poseidon
export const LEAVES = [
    1979475358490882782695234604362398132934050455360496620085373760138828661113n,  // hash(11)
    14936247605330213026011687832628508934951818973849811228532214613326116743574n, // hash(22)
    6089164006278979997064988404053639565226149319626268946296635412467235768175n,  // hash(33)
    944210591924524960699367252385025357816569597760145946972314960597502103370n,   // hash(44)
];

// Level 1 nodes: hash(leaf0, leaf1) and hash(leaf2, leaf3)
export const LEVEL1 = [
    506952089557660611143169613371890445783724292566211651668393617728459486427n,   // hash(leaf0, leaf1)
    21312574488032746558311893775055745729676585734954201789511270653659935130789n, // hash(leaf2, leaf3)
];

// Merkle root: hash(level1[0], level1[1])
export const ROOT = 9631428795162404395753140309810294961871348072720705774743129922969822967654n;

// Available secrets for the demo
export const DEMO_SECRETS = [11n, 22n, 33n, 44n];

export interface VoterCredential {
    emailHash: bigint;
    secret: bigint;
    pathElements: bigint[];
    pathIndices: boolean[];
}

import voterRound1 from "./voter_credentials_1.json";
import proposerRound999 from "./proposer_credentials_999.json";

interface RoundCredentialEntry {
    emailHash: string;
    secret: string;
    pathElements: string[];
    pathIndices: boolean[];
}

interface RoundCredentialFile {
    voters: RoundCredentialEntry[];
}

// Round-based demo credentials generated from off-chain artifacts.
function parseJSONCredentials(data: RoundCredentialFile): VoterCredential[] {
    return data.voters.map((v) => ({
        emailHash: BigInt(v.emailHash),
        secret: BigInt(v.secret),
        pathElements: v.pathElements.map(BigInt),
        pathIndices: v.pathIndices
    }));
}

const ROUND_CREDENTIALS: Record<number, VoterCredential[]> = {
    1: parseJSONCredentials(voterRound1 as RoundCredentialFile),
    999: parseJSONCredentials(proposerRound999 as RoundCredentialFile),
};

export interface MerklePath {
    pathElements: bigint[];
    pathIndices: boolean[];
}

export function getCredentialsForRound(roundId: number): VoterCredential[] {
    return ROUND_CREDENTIALS[roundId] ?? [];
}

export function getDemoSecretsForRound(roundId: number): bigint[] {
    const roundCredentials = getCredentialsForRound(roundId);
    if (roundCredentials.length > 0) {
        return roundCredentials.map((credential) => credential.secret);
    }
    return DEMO_SECRETS;
}

/**
 * Get Merkle proof path for a given secret index (0-3)
 * pathIndices: true = current node is on the LEFT, false = current node is on the RIGHT
 */
export function getMerklePath(secretIndex: number, roundId = 1): MerklePath {
    const roundCredentials = getCredentialsForRound(roundId);
    if (roundCredentials.length > 0) {
        if (secretIndex < 0 || secretIndex >= roundCredentials.length) {
            throw new Error(`Invalid secret index ${secretIndex} for round ${roundId}`);
        }
        return {
            pathElements: roundCredentials[secretIndex].pathElements,
            pathIndices: roundCredentials[secretIndex].pathIndices,
        };
    }

    switch (secretIndex) {
        case 0: // Secret: 11 (leaf0 - leftmost)
            return {
                pathElements: [LEAVES[1], LEVEL1[1]],  // sibling leaf1, sibling level1[1]
                pathIndices: [false, false],            // leaf0 is LEFT, level1[0] is LEFT
            };
        case 1: // Secret: 22 (leaf1)
            return {
                pathElements: [LEAVES[0], LEVEL1[1]],  // sibling leaf0, sibling level1[1]
                pathIndices: [true, false],             // leaf1 is RIGHT, level1[0] is LEFT
            };
        case 2: // Secret: 33 (leaf2)
            return {
                pathElements: [LEAVES[3], LEVEL1[0]],  // sibling leaf3, sibling level1[0]
                pathIndices: [false, true],             // leaf2 is LEFT, level1[1] is RIGHT
            };
        case 3: // Secret: 44 (leaf3 - rightmost)
            return {
                pathElements: [LEAVES[2], LEVEL1[0]],  // sibling leaf2, sibling level1[0]
                pathIndices: [true, true],              // leaf3 is RIGHT, level1[1] is RIGHT
            };
        default:
            throw new Error(`Invalid secret index: ${secretIndex}`);
    }
}

/**
 * Get the index of a secret in the demo secrets array
 */
export function getSecretIndex(secret: bigint): number {
    const index = DEMO_SECRETS.findIndex((s) => s === secret);
    if (index === -1) {
        throw new Error(`Secret ${secret} not found in demo secrets`);
    }
    return index;
}

export function getSecretIndexForRound(secret: bigint, roundId = 1): number {
    const roundCredentials = getCredentialsForRound(roundId);
    if (roundCredentials.length > 0) {
        const index = roundCredentials.findIndex((credential) => credential.secret === secret);
        if (index === -1) {
            throw new Error(`Secret ${secret} not found for round ${roundId}`);
        }
        return index;
    }
    return getSecretIndex(secret);
}

/**
 * Searches for a secret across common rounds (e.g. 1 and 999) 
 * Returns the roundId and index if found, otherwise throws.
 */
export function findRoundAndIndexForSecret(secret: bigint) {
    const rounds = [1, 999];
    for (const roundId of rounds) {
        const credentials = getCredentialsForRound(roundId);
        const index = credentials.findIndex(c => c.secret === secret);
        if (index !== -1) {
            return { roundId, index };
        }
    }
    
    // Fallback to legacy demo secrets
    const demoIndex = DEMO_SECRETS.findIndex(s => s === secret);
    if (demoIndex !== -1) return { roundId: 1, index: demoIndex };

    throw new Error(`Secret ${secret.toString().substring(0, 10)}... not recognized in any active eligibility rounds.`);
}
