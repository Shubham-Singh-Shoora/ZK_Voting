// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

/**
 * @title EligibilityRegistry
 * @notice Publishes immutable eligibility roots by round ID.
 * @dev DAO proposal admins do not control voter eligibility; this registry does.
 */
contract EligibilityRegistry {
    address public owner;

    mapping(uint256 => bytes32) private roots;
    mapping(uint256 => bool) public rootExists;

    event RootPublished(uint256 indexed roundId, bytes32 indexed root);
    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);

    error OnlyOwner();
    error InvalidOwner();
    error InvalidRoot();
    error RootAlreadyPublished();
    error RootNotFound();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor(address _owner) {
        if (_owner == address(0)) revert InvalidOwner();
        owner = _owner;
    }

    function publishRoot(uint256 _roundId, bytes32 _root) external onlyOwner {
        if (_root == bytes32(0)) revert InvalidRoot();
        if (rootExists[_roundId]) revert RootAlreadyPublished();

        roots[_roundId] = _root;
        rootExists[_roundId] = true;

        emit RootPublished(_roundId, _root);
    }

    function getRoot(uint256 _roundId) external view returns (bytes32) {
        if (!rootExists[_roundId]) revert RootNotFound();
        return roots[_roundId];
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        if (_newOwner == address(0)) revert InvalidOwner();
        address oldOwner = owner;
        owner = _newOwner;
        emit OwnerTransferred(oldOwner, _newOwner);
    }
}
