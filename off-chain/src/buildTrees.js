const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const circomlibjs = require("circomlibjs");
const xlsx = require("xlsx");

const BN254_FIELD = BigInt(
    "21888242871839275222246405745257275088548364400416034343698204186575808495617"
);

let poseidon;

async function initPoseidon() {
    if (!poseidon) {
        poseidon = await circomlibjs.buildPoseidon();
    }
}

async function poseidonHash(inputs) {
    await initPoseidon();
    const hash = poseidon(inputs);
    return BigInt(poseidon.F.toObject(hash));
}

function parseArgs(argv) {
    const args = {
        input: "./data/eligible.csv",
        out: "./artifacts",
        round: 1,
        salt: "department-default-salt",
        depth: 6
    };

    let positionalIndex = 0;
    for (let i = 0; i < argv.length; i++) {
        const current = argv[i];
        if (current === "--input") args.input = argv[++i];
        if (current === "--out") args.out = argv[++i];
        if (current === "--round") args.round = Number(argv[++i]);
        if (current === "--salt") args.salt = argv[++i];
        if (current === "--depth") args.depth = Number(argv[++i]);

        // Positional fallback: input out round salt depth
        if (!current.startsWith("--")) {
            if (positionalIndex === 0) args.input = current;
            if (positionalIndex === 1) args.out = current;
            if (positionalIndex === 2) args.round = Number(current);
            if (positionalIndex === 3) args.salt = current;
            if (positionalIndex === 4) args.depth = Number(current);
            positionalIndex++;
        }
    }

    if (!Number.isInteger(args.round) || args.round < 0) {
        throw new Error("--round must be a non-negative integer");
    }

    if (!Number.isInteger(args.depth) || args.depth < 1) {
        throw new Error("--depth must be a positive integer");
    }

    return args;
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

function sha256ToField(input) {
    const digest = crypto.createHash("sha256").update(input).digest("hex");
    return BigInt(`0x${digest}`) % BN254_FIELD;
}

function nextPowerOfTwo(n) {
    let p = 1;
    while (p < n) p <<= 1;
    return p;
}

function toMerklePath(levels, leafIndex) {
    const pathElements = [];
    const pathIndices = [];

    let index = leafIndex;
    for (let level = 0; level < levels.length - 1; level++) {
        const isRightNode = index % 2 === 1;
        const siblingIndex = isRightNode ? index - 1 : index + 1;
        pathElements.push(levels[level][siblingIndex]);
        pathIndices.push(!isRightNode);
        index = Math.floor(index / 2);
    }

    return { pathElements, pathIndices };
}

async function parseEligibleEmails(inputPath) {
    const workbook = xlsx.readFile(inputPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // Convert to array of objects
    const data = xlsx.utils.sheet_to_json(sheet);
    if (!data || data.length === 0) {
        throw new Error("Eligibility file is empty or invalid format");
    }

    let emailKey;
    for (let row of data) {
        const keys = Object.keys(row);
        emailKey = keys.find((k) => k.toLowerCase().includes("email"));
        if (emailKey) break;
    }

    let emails = [];
    if (emailKey) {
        emails = data
            .map((row) => row[emailKey])
            .filter((val) => typeof val === "string" && val.trim().length > 0)
            .map((val) => normalizeEmail(val));
    } else {
        throw new Error("Could not find 'email' column header in file");
    }

    const deduped = [...new Set(emails)];
    if (deduped.length === 0) {
        throw new Error("No valid emails found in eligibility file");
    }

    return deduped;
}

async function buildTreeFromEmails(emails, salt, targetDepth) {
    const zeroLeaf = await poseidonHash([0n]);

    const voterRecords = [];
    const leaves = [];

    for (const email of emails) {
        const secret = sha256ToField(`${email}|${salt}`);
        const emailHash = sha256ToField(email);
        const leaf = await poseidonHash([secret]);
        leaves.push(leaf);
        voterRecords.push({ email, emailHash, secret, leaf });
    }

    const maxLeavesAtDepth = 1 << targetDepth;
    if (leaves.length > maxLeavesAtDepth) {
        throw new Error(
            `Configured depth ${targetDepth} supports at most ${maxLeavesAtDepth} leaves, got ${leaves.length}`
        );
    }

    const targetLeafCount = maxLeavesAtDepth;
    while (leaves.length < targetLeafCount) {
        leaves.push(zeroLeaf);
    }

    const levels = [leaves.slice()];
    while (levels[levels.length - 1].length > 1) {
        const current = levels[levels.length - 1];
        const next = [];
        for (let i = 0; i < current.length; i += 2) {
            next.push(await poseidonHash([current[i], current[i + 1]]));
        }
        levels.push(next);
    }

    const root = levels[levels.length - 1][0];
    const depth = levels.length - 1;

    for (let i = 0; i < voterRecords.length; i++) {
        const proof = toMerklePath(levels, i);
        voterRecords[i].index = i;
        voterRecords[i].pathElements = proof.pathElements;
        voterRecords[i].pathIndices = proof.pathIndices;
    }

    return {
        root,
        depth,
        paddedLeafCount: targetLeafCount,
        leaves: levels[0],
        voterRecords
    };
}

function stringifyBigInt(value) {
    if (typeof value === "bigint") return value.toString();
    if (Array.isArray(value)) return value.map(stringifyBigInt);
    if (value && typeof value === "object") {
        return Object.fromEntries(
            Object.entries(value).map(([k, v]) => [k, stringifyBigInt(v)])
        );
    }
    return value;
}

function writeArtifacts(outDir, roundId, treeResult) {
    fs.mkdirSync(outDir, { recursive: true });

    const rootArtifact = {
        roundId,
        root: treeResult.root,
        depth: treeResult.depth,
        paddedLeafCount: treeResult.paddedLeafCount,
        generatedAt: new Date().toISOString()
    };

    const voterArtifact = {
        roundId,
        voters: treeResult.voterRecords.map((v) => ({
            emailHash: v.emailHash,
            index: v.index,
            secret: v.secret,
            leaf: v.leaf,
            pathElements: v.pathElements,
            pathIndices: v.pathIndices
        }))
    };

    const fullArtifact = {
        roundId,
        root: treeResult.root,
        depth: treeResult.depth,
        leaves: treeResult.leaves,
        voters: treeResult.voterRecords
    };

    fs.writeFileSync(
        path.join(outDir, `eligibility_round_${roundId}.json`),
        JSON.stringify(stringifyBigInt(rootArtifact), null, 2),
        "utf8"
    );

    fs.writeFileSync(
        path.join(outDir, `voter_credentials_round_${roundId}.json`),
        JSON.stringify(stringifyBigInt(voterArtifact), null, 2),
        "utf8"
    );

    fs.writeFileSync(
        path.join(outDir, `debug_tree_round_${roundId}.json`),
        JSON.stringify(stringifyBigInt(fullArtifact), null, 2),
        "utf8"
    );
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const inputPath = path.resolve(args.input);
    const outDir = path.resolve(args.out);

    const emails = await parseEligibleEmails(inputPath);
    const tree = await buildTreeFromEmails(emails, args.salt, args.depth);
    writeArtifacts(outDir, args.round, tree);

    console.log("Eligibility tree artifacts generated");
    console.log(`Round: ${args.round}`);
    console.log(`Eligible users: ${emails.length}`);
    console.log(`Configured depth: ${args.depth}`);
    console.log(`Tree depth: ${tree.depth}`);
    console.log(`Root: ${tree.root.toString()}`);
    console.log(`Output directory: ${outDir}`);
}

main().catch((err) => {
    console.error("Failed to build eligibility tree:", err.message);
    process.exit(1);
});