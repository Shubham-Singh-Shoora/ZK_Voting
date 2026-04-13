const { ethers } = require("ethers");

const errors = [
    "PublicInputsLengthWrong()",
    "ProofLengthWrong()",
    "InvalidProof()",
    "RootMismatch()",
    "ProposalIdMismatch()",
    "ValueGeLimbMax()",
    "ValueGeGroupOrder()",
    "ValueGeFieldOrder()",
    "InvertOfZero()",
    "NotPowerOfTwo()",
    "ModExpFailed()",
    "SumcheckFailed()",
    "ShpleminiFailed()",
    "PointAtInfinity()",
    "ConsistencyCheckFailed()",
    "GeminiChallengeInSubgroup()"
];

console.log("Error Selectors:");
errors.forEach(e => {
    console.log(`${e}: ${ethers.id(e).slice(0, 10)}`);
});

const SNARK_SCALAR_FIELD = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const MAX_UINT256 = (BigInt(1) << BigInt(256)) - BigInt(1);
console.log("\nProposer Registration ID Field:");
console.log("Hex:", (MAX_UINT256 % SNARK_SCALAR_FIELD).toString(16));
