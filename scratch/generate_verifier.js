const { UltraHonkBackend, Barretenberg } = require('@aztec/bb.js');
const fs = require('fs');
const path = require('path');

async function main() {
    try {
        const circuitPath = path.join(__dirname, '../frontend/src/dao.json');
        const circuit = JSON.parse(fs.readFileSync(circuitPath, 'utf8'));
        
        console.log("Initializing Barretenberg...");
        const bb = await Barretenberg.new({ threads: 1 });
        
        console.log("Creating UltraHonkBackend...");
        const backend = new UltraHonkBackend(circuit.bytecode, bb);
        
        console.log("Generating Verification Key...");
        const vk = await backend.getVerificationKey();
        
        console.log("Generating Solidity Verifier...");
        // Use evm-no-zk to match the expected gas usage and simplicity
        const verifier = await backend.getSolidityVerifier(vk, { verifierTarget: 'evm-no-zk' });
        
        const outputPath = path.join(__dirname, '../on-chain/contracts/src/Verifier.sol');
        fs.writeFileSync(outputPath, verifier);
        console.log(`Success! Verifier written to ${outputPath}`);
        
        await bb.destroy();
    } catch (error) {
        console.error("Error generating verifier:", error);
        process.exit(1);
    }
}

main();
