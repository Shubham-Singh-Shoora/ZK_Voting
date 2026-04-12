#!/usr/bin/env bash
set -u

versions=(
  3.0.0-nightly.20251228
  3.0.0-nightly.20251220
  3.0.0-nightly.20251210
  3.0.0-nightly.20251201
  3.0.0-nightly.20251125
  3.0.0-nightly.20251115
  3.0.0-nightly.20251104
  3.0.0-nightly.20260102
)

repo_root="/mnt/d/BlockDev/ZK_proof/DAOs"
zk_dir="$repo_root/zk_proof"
check_script="$zk_dir/scripts/check_proof_against_verifier.sh"

for v in "${versions[@]}"; do
  echo "===== TRY $v ====="

  if ! /home/shubham/.bb/bbup -v "$v" >/tmp/bbup.log 2>&1; then
    echo "bbup failed for $v"
    tail -n 2 /tmp/bbup.log
    continue
  fi

  /home/shubham/.bb/bb --version || true

  cd "$zk_dir" || exit 1
  rm -rf ./target/proof_vote0_probe

  if /home/shubham/.bb/bb prove \
      -b ./target/dao.json \
      -w ./target/witness_vote0.gz \
      -k ./target/vk_keccak \
      -o ./target/proof_vote0_probe \
      -t evm-no-zk >/tmp/probe.log 2>&1; then
    :
  elif /home/shubham/.bb/bb prove \
      -s ultra_honk \
      -b ./target/dao.json \
      -w ./target/witness_vote0.gz \
      -k ./target/vk_keccak \
      --vk_policy default \
      --oracle_hash keccak \
      --disable_zk \
      -o ./target/proof_vote0_probe >/tmp/probe.log 2>&1; then
    :
  elif /home/shubham/.bb/bb prove \
      -s ultra_honk \
      -b ./target/dao.json \
      -w ./target/witness_vote0.gz \
      -k ./target/vk_keccak \
      --vk_policy default \
      --oracle_hash keccak \
      --zk=false \
      -o ./target/proof_vote0_probe >/tmp/probe.log 2>&1; then
    :
  else
    echo "prove failed for $v"
    tail -n 3 /tmp/probe.log
    continue
  fi

  if "$check_script" "$zk_dir/target/proof_vote0_probe" >/tmp/check.log 2>&1; then
    echo "SUCCESS_VERSION=$v"
    cat /tmp/check.log
    exit 0
  fi

  echo "verify failed for $v"
  tail -n 2 /tmp/check.log
done

exit 1
