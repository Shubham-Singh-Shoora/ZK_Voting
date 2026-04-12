#!/usr/bin/env bash
set -euo pipefail

source /mnt/d/BlockDev/ZK_proof/DAOs/on-chain/contracts/.env
cd /mnt/d/BlockDev/ZK_proof/DAOs/zk_proof/target/proof_vote0_new

pub=$(xxd -p public_inputs | tr -d '\n')
p0="0x${pub:0:64}"
p1="0x${pub:64:64}"
p2="0x${pub:128:64}"
proof="0x$(xxd -p proof | tr -d '\n')"

/home/shubham/.foundry/bin/cast call "$DAO_ADDRESS" \
  'isProposalActive(uint256)(bool)' \
  0 \
  --rpc-url "$RPC_URL"

/home/shubham/.foundry/bin/cast send "$DAO_ADDRESS" \
  'vote(uint256,bool,bytes,bytes32[])' \
  0 \
  true \
  "$proof" \
  "[$p0,$p1,$p2]" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL"

/home/shubham/.foundry/bin/cast call "$DAO_ADDRESS" \
  'getProposalResult(uint256)(uint256,uint256,bool)' \
  0 \
  --rpc-url "$RPC_URL"
