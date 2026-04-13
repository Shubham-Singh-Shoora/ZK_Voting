const { ethers } = require("ethers");

const errors = [
    "OnlyMonitor()",
    "OnlyProposer()",
    "InvalidAddress()",
    "ProposalNotFound()",
    "ProposalNotActive()",
    "ProposalAlreadyExecuted()",
    "ProposalCancelledError()",
    "VotingAlreadyStarted()",
    "VotingNotEnded()",
    "InvalidTimeRange()",
    "UnknownEligibilityRound()",
    "InvalidAddress()",
    "NullifierAlreadyUsed()",
    "InvalidProof()",
    "InvalidPublicInputsLength()",
    "RootMismatch()",
    "ProposalIdMismatch()"
];

console.log("Error Selectors:");
errors.forEach(err => {
    const selector = ethers.id(err).substring(0, 10);
    console.log(`${err}: ${selector}`);
});
