# Off-chain Eligibility Builder

This package builds Merkle-tree eligibility artifacts from a CSV of official emails.

## Input format

Provide a CSV with an `email` header (or one email per line):

```csv
email
student1@iiitsonepat.ac.in
student2@iiitsonepat.ac.in
```

## Generate artifacts

```bash
npm install
npm run build:tree -- --input ./data/eligible.sample.csv --out ./artifacts --round 1 --salt "dept-2026"
```

## Outputs

- `artifacts/eligibility_round_<round>.json`
  - root, depth, padded leaf count
- `artifacts/voter_credentials_round_<round>.json`
  - per-voter credential material for proving
- `artifacts/debug_tree_round_<round>.json`
  - full debug artifact with leaves and paths

## Notes

- Emails are normalized to lowercase and deduplicated.
- Secrets are derived as `sha256(email|salt) mod field`.
- Leaves are computed as `poseidon(secret)`.
- Tree is padded to next power of two with `poseidon(0)`.
