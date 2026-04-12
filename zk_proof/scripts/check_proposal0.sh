#!/usr/bin/env bash
set -euo pipefail

source /mnt/d/BlockDev/ZK_proof/DAOs/on-chain/contracts/.env

/home/shubham/.foundry/bin/cast call "$DAO_ADDRESS" 'getProposal(uint256)(string,uint256,uint256,uint256,uint256,uint256,bytes32,bool,bool,address)' 0 --rpc-url "$RPC_URL"
/home/shubham/.foundry/bin/cast block latest --rpc-url "$RPC_URL" | grep -i timestamp
