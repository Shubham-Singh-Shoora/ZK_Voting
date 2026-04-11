// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "./Verifier.sol";
import "./EligibilityRegistry.sol";

/**
 * @title ZKVotingDAO
 * @notice A privacy-preserving DAO voting system using ZK proofs
 * @dev Uses Noir circuits with UltraHonk proofs verified on-chain
 */
contract ZKVotingDAO {
    // ============ State Variables ============

    IVerifier public immutable verifier;
    EligibilityRegistry public immutable eligibilityRegistry;
    address public monitor;
    uint256 public constant PROPOSAL_START_DELAY = 5 minutes;

    mapping(address => bool) public isProposer;

    // Proposal structure
    struct Proposal {
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 startTime;
        uint256 endTime;
        uint256 eligibilityRound;
        bytes32 merkleRoot; // Root of eligible voters tree
        bool executed;
        bool cancelled;
        address proposer;
    }

    // Proposal ID => Proposal
    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalCount;

    // Nullifier tracking to prevent double voting
    // proposalId => nullifier => used
    mapping(uint256 => mapping(bytes32 => bool)) public nullifierUsed;

    uint256 public proposerEligibilityRound;
    uint256 public constant PROPOSER_REGISTRATION_ID = type(uint256).max;
    mapping(bytes32 => bool) public proposerNullifierUsed;

    // ============ Events ============

    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed proposer,
        string description,
        uint256 eligibilityRound,
        bytes32 merkleRoot,
        uint256 startTime,
        uint256 endTime
    );

    event VoteCast(
        uint256 indexed proposalId,
        bytes32 indexed nullifier,
        bool support
    );

    event ProposerRegistered(address indexed proposer, bytes32 indexed nullifier);

    event ProposalExecuted(uint256 indexed proposalId, bool passed);
    event ProposalCancelled(
        uint256 indexed proposalId,
        address indexed cancelledBy
    );
    event MonitorTransferred(
        address indexed oldMonitor,
        address indexed newMonitor
    );
    event ProposerUpdated(address indexed proposer, bool allowed);

    // ============ Errors ============

    error OnlyMonitor();
    error OnlyProposer();
    error InvalidAddress();
    error ProposalNotFound();
    error ProposalNotActive();
    error ProposalAlreadyExecuted();
    error ProposalCancelledError();
    error VotingAlreadyStarted();
    error NullifierAlreadyUsed();
    error InvalidProof();
    error VotingNotEnded();
    error InvalidTimeRange();
    error UnknownEligibilityRound();
    error InvalidPublicInputsLength();
    error RootMismatch();
    error ProposalIdMismatch();

    // ============ Modifiers ============

    modifier onlyMonitor() {
        if (msg.sender != monitor) revert OnlyMonitor();
        _;
    }

    modifier onlyProposerRole() {
        if (!isProposer[msg.sender]) revert OnlyProposer();
        _;
    }

    // ============ Constructor ============

    constructor(address _verifier, address _eligibilityRegistry) {
        verifier = IVerifier(_verifier);
        eligibilityRegistry = EligibilityRegistry(_eligibilityRegistry);
        monitor = msg.sender;
        isProposer[msg.sender] = true;
    }

    // ============ Admin Functions ============

    /**
     * @notice Create a new proposal
     * @param _description Description of the proposal
     * @param _eligibilityRound Eligibility round ID from the registry
     * @param _duration Voting duration in seconds
     */
    function createProposal(
        string calldata _description,
        uint256 _eligibilityRound,
        uint256 _duration
    ) external onlyProposerRole returns (uint256) {
        if (_duration == 0) revert InvalidTimeRange();
        if (!eligibilityRegistry.rootExists(_eligibilityRound)) {
            revert UnknownEligibilityRound();
        }

        bytes32 merkleRoot = eligibilityRegistry.getRoot(_eligibilityRound);

        uint256 proposalId = proposalCount++;

        proposals[proposalId] = Proposal({
            description: _description,
            yesVotes: 0,
            noVotes: 0,
            startTime: block.timestamp + PROPOSAL_START_DELAY,
            endTime: block.timestamp + PROPOSAL_START_DELAY + _duration,
            eligibilityRound: _eligibilityRound,
            merkleRoot: merkleRoot,
            executed: false,
            cancelled: false,
            proposer: msg.sender
        });

        emit ProposalCreated(
            proposalId,
            msg.sender,
            _description,
            _eligibilityRound,
            merkleRoot,
            block.timestamp + PROPOSAL_START_DELAY,
            block.timestamp + PROPOSAL_START_DELAY + _duration
        );

        return proposalId;
    }

    /**
     * @notice Transfer monitor role
     * @param _newMonitor Address of the new monitor
     */
    function transferMonitor(address _newMonitor) external onlyMonitor {
        if (_newMonitor == address(0)) revert InvalidAddress();
        address oldMonitor = monitor;
        monitor = _newMonitor;
        emit MonitorTransferred(oldMonitor, _newMonitor);
    }

    /**
     * @notice Allow or revoke proposer access
     */
    function setProposer(
        address _proposer,
        bool _allowed
    ) external onlyMonitor {
        if (_proposer == address(0)) revert InvalidAddress();
        isProposer[_proposer] = _allowed;
        emit ProposerUpdated(_proposer, _allowed);
    }

    /**
     * @notice Set the eligibility round ID for proposers
     */
    function setProposerEligibilityRound(uint256 _round) external onlyMonitor {
        proposerEligibilityRound = _round;
    }

    /**
     * @notice Cancel a proposal before voting starts
     */
    function cancelProposal(uint256 _proposalId) external onlyMonitor {
        if (_proposalId >= proposalCount) revert ProposalNotFound();

        Proposal storage proposal = proposals[_proposalId];
        if (proposal.cancelled) revert ProposalCancelledError();
        if (block.timestamp >= proposal.startTime)
            revert VotingAlreadyStarted();

        proposal.cancelled = true;
        emit ProposalCancelled(_proposalId, msg.sender);
    }

    // ============ Voting Functions ============

    /**
     * @notice Cast a vote with ZK proof
     * @param _proposalId ID of the proposal to vote on
     * @param _support True for yes, false for no
     * @param _proof The ZK proof bytes
     * @param _publicInputs Public inputs: [root, proposalId, nullifier, ...]
     *
     * The proof verifies:
     * 1. Voter knows a secret that hashes to a leaf in the Merkle tree
     * 2. The Merkle path from leaf to root is valid
     * 3. The nullifier is correctly computed from secret + proposalId
     */
    function vote(
        uint256 _proposalId,
        bool _support,
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external {
        if (_proposalId >= proposalCount) revert ProposalNotFound();

        Proposal storage proposal = proposals[_proposalId];
        if (proposal.cancelled) revert ProposalCancelledError();

        // Check proposal is active
        if (
            block.timestamp < proposal.startTime ||
            block.timestamp > proposal.endTime
        ) {
            revert ProposalNotActive();
        }

        if (_publicInputs.length != 3) revert InvalidPublicInputsLength();

        // Extract nullifier from public inputs
        bytes32 nullifier = _publicInputs[2];

        // Check nullifier hasn't been used
        if (nullifierUsed[_proposalId][nullifier]) {
            revert NullifierAlreadyUsed();
        }

        // Verify the ZK proof
        // Public inputs should include: root, proposalId, and the nullifier
        if (!verifier.verify(_proof, _publicInputs)) {
            revert InvalidProof();
        }

        // Verify the root matches the proposal's merkle root
        if (_publicInputs[0] != proposal.merkleRoot) revert RootMismatch();

        // Verify proposal ID matches
        if (uint256(_publicInputs[1]) != _proposalId) {
            revert ProposalIdMismatch();
        }

        // Mark nullifier as used
        nullifierUsed[_proposalId][nullifier] = true;

        // Record vote
        if (_support) {
            proposal.yesVotes++;
        } else {
            proposal.noVotes++;
        }

        emit VoteCast(_proposalId, nullifier, _support);
    }

    /**
     * @notice Register as a proposer using a ZK proof
     * @param _proof The ZK proof bytes
     * @param _publicInputs Public inputs: [root, proposalId, nullifier]
     */
    function registerProposer(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external {
        if (!eligibilityRegistry.rootExists(proposerEligibilityRound)) {
            revert UnknownEligibilityRound();
        }
        bytes32 merkleRoot = eligibilityRegistry.getRoot(proposerEligibilityRound);

        if (_publicInputs.length != 3) revert InvalidPublicInputsLength();
        if (_publicInputs[0] != merkleRoot) revert RootMismatch();
        if (uint256(_publicInputs[1]) != PROPOSER_REGISTRATION_ID) revert ProposalIdMismatch();

        bytes32 nullifier = _publicInputs[2];
        if (proposerNullifierUsed[nullifier]) revert NullifierAlreadyUsed();

        if (!verifier.verify(_proof, _publicInputs)) {
            revert InvalidProof();
        }

        proposerNullifierUsed[nullifier] = true;
        isProposer[msg.sender] = true;

        emit ProposerRegistered(msg.sender, nullifier);
        emit ProposerUpdated(msg.sender, true);
    }

    // ============ Execution Functions ============

    /**
     * @notice Execute a proposal after voting ends
     * @param _proposalId ID of the proposal to execute
     */
    function executeProposal(uint256 _proposalId) external {
        if (_proposalId >= proposalCount) revert ProposalNotFound();

        Proposal storage proposal = proposals[_proposalId];
        if (proposal.cancelled) revert ProposalCancelledError();

        if (block.timestamp <= proposal.endTime) {
            revert VotingNotEnded();
        }

        if (proposal.executed) {
            revert ProposalAlreadyExecuted();
        }

        proposal.executed = true;
        bool passed = proposal.yesVotes > proposal.noVotes;

        emit ProposalExecuted(_proposalId, passed);

        // Add execution logic here (e.g., treasury transfers, parameter changes)
    }

    // ============ View Functions ============

    /**
     * @notice Get proposal details
     */
    function getProposal(
        uint256 _proposalId
    )
        external
        view
        returns (
            string memory description,
            uint256 yesVotes,
            uint256 noVotes,
            uint256 startTime,
            uint256 endTime,
            uint256 eligibilityRound,
            bytes32 merkleRoot,
            bool executed,
            bool cancelled,
            address proposer
        )
    {
        Proposal storage p = proposals[_proposalId];
        return (
            p.description,
            p.yesVotes,
            p.noVotes,
            p.startTime,
            p.endTime,
            p.eligibilityRound,
            p.merkleRoot,
            p.executed,
            p.cancelled,
            p.proposer
        );
    }

    /**
     * @notice Check if a nullifier has been used for a proposal
     */
    function isNullifierUsed(
        uint256 _proposalId,
        bytes32 _nullifier
    ) external view returns (bool) {
        return nullifierUsed[_proposalId][_nullifier];
    }

    /**
     * @notice Check if proposal is currently active for voting
     */
    function isProposalActive(
        uint256 _proposalId
    ) external view returns (bool) {
        if (_proposalId >= proposalCount) return false;
        Proposal storage p = proposals[_proposalId];
        if (p.cancelled) return false;
        return block.timestamp >= p.startTime && block.timestamp <= p.endTime;
    }

    /**
     * @notice Get the current result of a proposal
     */
    function getProposalResult(
        uint256 _proposalId
    )
        external
        view
        returns (uint256 yesVotes, uint256 noVotes, bool wouldPass)
    {
        Proposal storage p = proposals[_proposalId];
        return (p.yesVotes, p.noVotes, p.yesVotes > p.noVotes);
    }
}
