import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..", "..");

if (process.argv.length < 7) {
    console.error("Usage: node writeProverFromCredential.mjs <credentialJsonPath> <index> <proposalIdField> <root> <outPath>");
    process.exit(1);
}

const [credentialJsonPath, indexRaw, proposalIdField, root, outPath] = process.argv.slice(2);
const index = Number(indexRaw);

const credentialFile = JSON.parse(readFileSync(path.resolve(repoRoot, credentialJsonPath), "utf8"));
const credential = credentialFile.voters?.[index];

if (!credential) {
    console.error(`Credential at index ${index} not found in ${credentialJsonPath}`);
    process.exit(1);
}

const lines = [];
lines.push(`secret = \"${credential.secret}\"`);
lines.push("");
lines.push("path_elements = [");
for (const value of credential.pathElements) {
    lines.push(`    \"${value}\",`);
}
lines.push("]");
lines.push(`path_indices = [${credential.pathIndices.join(", ")}]`);
lines.push(`proposal_id = \"${proposalIdField}\"`);
lines.push(`root = \"${root}\"`);

writeFileSync(path.resolve(repoRoot, outPath), lines.join("\n") + "\n");
console.log(`Wrote ${outPath}`);
