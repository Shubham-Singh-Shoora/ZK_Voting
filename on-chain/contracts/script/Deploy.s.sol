// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "../src/Verifier.sol";
import "../src/EligibilityRegistry.sol";
import "../src/ZKVotingDAO.sol";

contract DeployZKVotingDAO is Script {
    uint256 internal constant VOTER_ROUND = 1;
    uint256 internal constant PROPOSER_ROUND = 999;
    bytes32 internal constant VOTER_ROOT =
        bytes32(
            uint256(
                3614319550864035092781089326320589412563999089249957225900027735163541348097
            )
        );
    bytes32 internal constant PROPOSER_ROOT =
        bytes32(
            uint256(
                2825419045464851556517518825892689629227218731946179245357738551218234204147
            )
        );

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the Verifier contract first
        HonkVerifier verifier = new HonkVerifier();
        console.log("Verifier deployed at:", address(verifier));

        // Deploy the EligibilityRegistry with deployer ownership
        EligibilityRegistry registry = new EligibilityRegistry(
            vm.addr(deployerPrivateKey)
        );
        console.log("EligibilityRegistry deployed at:", address(registry));

        // Publish known roots for round 1 (voters) and round 999 (proposers)
        registry.publishRoot(VOTER_ROUND, VOTER_ROOT);
        registry.publishRoot(PROPOSER_ROUND, PROPOSER_ROOT);
        console.log("Roots published for rounds 1 and 999");

        // Deploy the ZKVotingDAO with verifier and registry addresses
        ZKVotingDAO dao = new ZKVotingDAO(address(verifier), address(registry));
        console.log("ZKVotingDAO deployed at:", address(dao));

        // Ensure proposer registration uses the intended cohort round.
        dao.setProposerEligibilityRound(PROPOSER_ROUND);
        require(
            dao.proposerEligibilityRound() == PROPOSER_ROUND,
            "Proposer round config failed"
        );
        console.log(
            "Monitor configured proposer round:",
            dao.proposerEligibilityRound()
        );
        console.log("DAO monitor address:", dao.monitor());

        vm.stopBroadcast();
    }
}

contract DeployLocal is Script {
    uint256 internal constant VOTER_ROUND = 1;
    uint256 internal constant PROPOSER_ROUND = 999;
    bytes32 internal constant VOTER_ROOT =
        bytes32(
            uint256(
                3614319550864035092781089326320589412563999089249957225900027735163541348097
            )
        );
    bytes32 internal constant PROPOSER_ROOT =
        bytes32(
            uint256(
                2825419045464851556517518825892689629227218731946179245357738551218234204147
            )
        );

    function run() external {
        // For local testing without private key
        vm.startBroadcast();

        HonkVerifier verifier = new HonkVerifier();
        console.log("Verifier deployed at:", address(verifier));

        EligibilityRegistry registry = new EligibilityRegistry(msg.sender);
        console.log("EligibilityRegistry deployed at:", address(registry));

        registry.publishRoot(VOTER_ROUND, VOTER_ROOT);
        registry.publishRoot(PROPOSER_ROUND, PROPOSER_ROOT);
        console.log("Roots published for rounds 1 and 999");

        ZKVotingDAO dao = new ZKVotingDAO(address(verifier), address(registry));
        console.log("ZKVotingDAO deployed at:", address(dao));

        dao.setProposerEligibilityRound(PROPOSER_ROUND);
        require(
            dao.proposerEligibilityRound() == PROPOSER_ROUND,
            "Proposer round config failed"
        );
        console.log(
            "Monitor configured proposer round:",
            dao.proposerEligibilityRound()
        );
        console.log("DAO monitor address:", dao.monitor());

        vm.stopBroadcast();
    }
}
