#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <proof_dir>"
  exit 1
fi

proof_dir="$1"

source /mnt/d/BlockDev/ZK_proof/DAOs/on-chain/contracts/.env

VERIFIER=$(/home/shubham/.foundry/bin/cast call "$DAO_ADDRESS" 'verifier()(address)' --rpc-url "$RPC_URL")
echo "Verifier: $VERIFIER"

cd "$proof_dir"
pub=$(xxd -p public_inputs | tr -d '\n')
p0="0x${pub:0:64}"
p1="0x${pub:64:64}"
p2="0x${pub:128:64}"
proof="0x$(xxd -p proof | tr -d '\n')"

/home/shubham/.foundry/bin/cast call "$VERIFIER" \
  'verify(bytes,bytes32[])(bool)' \
  "$proof" \
  "[$p0,$p1,$p2]" \
  --rpc-url "$RPC_URL"
