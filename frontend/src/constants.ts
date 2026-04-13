// Contract addresses deployed on Anvil or Testnet
export const VERIFIER_ADDRESS = import.meta.env.VITE_VERIFIER_ADDRESS || "0x5b73C5498c1E3b4dbA84de0F1833c4a029d90519";
export const ELIGIBILITY_REGISTRY_ADDRESS = import.meta.env.VITE_ELIGIBILITY_REGISTRY_ADDRESS || "0x0000000000000000000000000000000000000000";
export const DAO_CONTRACT_ADDRESS = import.meta.env.VITE_DAO_CONTRACT_ADDRESS || "0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496";

// Local RPC or Testnet RPC
export const RPC_URL = import.meta.env.VITE_RPC_URL || "http://127.0.0.1:8545";

// Chain ID for Network
export const CHAIN_ID = import.meta.env.VITE_CHAIN_ID ? parseInt(import.meta.env.VITE_CHAIN_ID) : 31337;

// Contract ABI for ZKVotingDAO
export const DAO_ABI = [
    // Monitor/Proposer functions
    "function createProposal(string calldata _description, uint256 _eligibilityRound, uint256 _duration) external returns (uint256)",
    "function cancelProposal(uint256 _proposalId) external",
    "function transferMonitor(address _newMonitor) external",
    "function setProposer(address _proposer, bool _allowed) external",
    "function setProposerEligibilityRound(uint256 _round) external",
    "function registerProposer(bytes calldata _proof, bytes32[] calldata _publicInputs) external",

    // Voting function
    "function vote(uint256 _proposalId, bool _support, bytes calldata _proof, bytes32[] calldata _publicInputs) external",
    "function executeProposal(uint256 _proposalId) external",

    // View functions
    "function getProposal(uint256 _proposalId) external view returns (string memory description, uint256 yesVotes, uint256 noVotes, uint256 startTime, uint256 endTime, uint256 eligibilityRound, bytes32 merkleRoot, bool executed, bool cancelled, address proposer)",
    "function isNullifierUsed(uint256 _proposalId, bytes32 _nullifier) external view returns (bool)",
    "function isProposalActive(uint256 _proposalId) external view returns (bool)",
    "function getProposalResult(uint256 _proposalId) external view returns (uint256 yesVotes, uint256 noVotes, bool wouldPass)",
    "function proposalCount() external view returns (uint256)",
    "function proposerEligibilityRound() external view returns (uint256)",
    "function monitor() external view returns (address)",
    "function isProposer(address _candidate) external view returns (bool)",
    "function eligibilityRegistry() external view returns (address)",
    "function proposerNullifierUsed(bytes32) external view returns (bool)",

    // Events
    "event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description, uint256 eligibilityRound, bytes32 merkleRoot, uint256 startTime, uint256 endTime)",
    "event VoteCast(uint256 indexed proposalId, bytes32 indexed nullifier, bool support)",
    "event ProposalExecuted(uint256 indexed proposalId, bool passed)",
    "event ProposalCancelled(uint256 indexed proposalId, address indexed cancelledBy)",
];

export const ELIGIBILITY_REGISTRY_ABI = [
    "function rootExists(uint256 _roundId) external view returns (bool)",
    "function getRoot(uint256 _roundId) external view returns (bytes32)",
    "function owner() external view returns (address)",
];

