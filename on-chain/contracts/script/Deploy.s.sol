// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "../src/Verifier.sol";
import "../src/EligibilityRegistry.sol";
import "../src/ZKVotingDAO.sol";

contract DeployZKVotingDAO is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the Verifier contract first
        HonkVerifier verifier = new HonkVerifier();
        console.log("Verifier deployed at:", address(verifier));

        // Deploy the EligibilityRegistry with deployer ownership
        EligibilityRegistry registry = new EligibilityRegistry(vm.addr(deployerPrivateKey));
        console.log("EligibilityRegistry deployed at:", address(registry));

        // Publish known roots for round 1 (voters) and round 999 (proposers)
        registry.publishRoot(1, bytes32(uint256(3614319550864035092781089326320589412563999089249957225900027735163541348097)));
        registry.publishRoot(999, bytes32(uint256(10650886115161615272060186012247996571419783596854168222173584613293921799956)));
        console.log("Roots published for rounds 1 and 999");

        // Deploy the ZKVotingDAO with verifier and registry addresses
        ZKVotingDAO dao = new ZKVotingDAO(address(verifier), address(registry));
        console.log("ZKVotingDAO deployed at:", address(dao));

        vm.stopBroadcast();
    }
}

contract DeployLocal is Script {
    function run() external {
        // For local testing without private key
        vm.startBroadcast();

        HonkVerifier verifier = new HonkVerifier();
        console.log("Verifier deployed at:", address(verifier));

        EligibilityRegistry registry = new EligibilityRegistry(msg.sender);
        console.log("EligibilityRegistry deployed at:", address(registry));

        ZKVotingDAO dao = new ZKVotingDAO(address(verifier), address(registry));
        console.log("ZKVotingDAO deployed at:", address(dao));

        vm.stopBroadcast();
    }
}
