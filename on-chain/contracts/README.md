## ZKVotingDAO Contracts

This folder contains the Foundry project for the DAO, verifier, and eligibility registry.

## Prerequisites

- Foundry installed: https://book.getfoundry.sh/
- A `.env` file with at least:
	- `PRIVATE_KEY=0x...`
	- `RPC_URL=https://...`

## Common Commands

### Build

```shell
forge build
```

### Test

```shell
forge test
```

## Deploy (Arbitrum Sepolia)

The deploy script now performs all required configuration for proposer registration:

- Deploys `HonkVerifier`
- Deploys `EligibilityRegistry`
- Publishes voter root for round `1`
- Publishes proposer root for round `999`
- Deploys `ZKVotingDAO`
- Sets `proposerEligibilityRound` to `999`

Run (Bash):

```shell
set -a; source .env; set +a
forge script script/Deploy.s.sol:DeployZKVotingDAO --rpc-url $RPC_URL --broadcast
```

Run (PowerShell):

```powershell
$env:PRIVATE_KEY = "0x..."
$env:RPC_URL = "https://..."
forge script script/Deploy.s.sol:DeployZKVotingDAO --rpc-url $env:RPC_URL --broadcast
```

After deployment, record the DAO address from logs and update frontend config/env accordingly.

## One-Time Fix for Existing DAO (Round Was 0)

If an already-deployed DAO has `proposerEligibilityRound == 0`, run the remediation script.

Required env vars:

- `PRIVATE_KEY=0x...` (must be the DAO monitor key)
- `DAO_ADDRESS=0x...`
- Optional: `PROPOSER_ROUND=999` (defaults to `999`)

Run (Bash):

```shell
set -a; source .env; set +a
forge script script/SetProposerRound.s.sol:SetProposerRound --rpc-url $RPC_URL --broadcast
```

Run (PowerShell):

```powershell
$env:PRIVATE_KEY = "0x..."
$env:DAO_ADDRESS = "0x..."
$env:PROPOSER_ROUND = "999"
$env:RPC_URL = "https://..."
forge script script/SetProposerRound.s.sol:SetProposerRound --rpc-url $env:RPC_URL --broadcast
```

The script verifies:

- signer is DAO monitor
- round is updated to the requested proposer round

## Quick Verification (Cast)

```shell
cast call <DAO_ADDRESS> "proposerEligibilityRound()(uint256)" --rpc-url $RPC_URL
cast call <DAO_ADDRESS> "monitor()(address)" --rpc-url $RPC_URL
cast call <DAO_ADDRESS> "eligibilityRegistry()(address)" --rpc-url $RPC_URL
```

PowerShell users can replace `$RPC_URL` with `$env:RPC_URL`.

Expected proposer round is `999` unless you intentionally configured another round.
