// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Script.sol";
import "../src/ZKVotingDAO.sol";

contract SetProposerRound is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address daoAddress = vm.envAddress("DAO_ADDRESS");
        uint256 proposerRound = vm.envOr("PROPOSER_ROUND", uint256(999));

        address signer = vm.addr(deployerPrivateKey);
        ZKVotingDAO dao = ZKVotingDAO(daoAddress);

        uint256 beforeRound = dao.proposerEligibilityRound();
        address monitorAddress = dao.monitor();

        console.log("DAO address:", daoAddress);
        console.log("Monitor address:", monitorAddress);
        console.log("Signer address:", signer);
        console.log("Proposer round before:", beforeRound);

        require(signer == monitorAddress, "Signer is not DAO monitor");

        if (beforeRound == proposerRound) {
            console.log("Proposer round already configured.");
            return;
        }

        vm.startBroadcast(deployerPrivateKey);
        dao.setProposerEligibilityRound(proposerRound);
        vm.stopBroadcast();

        uint256 afterRound = dao.proposerEligibilityRound();
        console.log("Proposer round after:", afterRound);

        require(afterRound == proposerRound, "Failed to update proposer round");
    }
}
