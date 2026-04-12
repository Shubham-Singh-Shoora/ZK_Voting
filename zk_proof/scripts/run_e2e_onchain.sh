#!/usr/bin/env bash
set -euo pipefail

source /mnt/d/BlockDev/ZK_proof/DAOs/on-chain/contracts/.env

# 1) Create proposal #0 on the fresh DAO
/home/shubham/.foundry/bin/cast send "$DAO_ADDRESS" \
  'createProposal(string,uint256,uint256)' \
  'E2E keccak verifier proposal' \
  1 \
  3600 \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL"

# 2) Register proposer using freshly generated proposer proof
cd /mnt/d/BlockDev/ZK_proof/DAOs/zk_proof/target/proof_proposer_new
pub=$(xxd -p public_inputs | tr -d '\n')
p0="0x${pub:0:64}"
p1="0x${pub:64:64}"
p2="0x${pub:128:64}"
proof="0x$(xxd -p proof | tr -d '\n')"

/home/shubham/.foundry/bin/cast send "$DAO_ADDRESS" \
  'registerProposer(bytes,bytes32[])' \
  "$proof" \
  "[$p0,$p1,$p2]" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL"

# 3) Vote YES on proposal 0 with freshly generated voter proof
cd /mnt/d/BlockDev/ZK_proof/DAOs/zk_proof/target/proof_vote0_new
pub=$(xxd -p public_inputs | tr -d '\n')
p0="0x${pub:0:64}"
p1="0x${pub:64:64}"
p2="0x${pub:128:64}"
proof="0x$(xxd -p proof | tr -d '\n')"

/home/shubham/.foundry/bin/cast send "$DAO_ADDRESS" \
  'vote(uint256,bool,bytes,bytes32[])' \
  0 \
  true \
  "$proof" \
  "[$p0,$p1,$p2]" \
  --private-key "$PRIVATE_KEY" \
  --rpc-url "$RPC_URL"

# 4) Print final tally
/home/shubham/.foundry/bin/cast call "$DAO_ADDRESS" \
  'getProposal(uint256)(string,uint256,uint256,uint256,uint256,uint256,bytes32,bool,bool,address)' \
  0 \
  --rpc-url "$RPC_URL"
