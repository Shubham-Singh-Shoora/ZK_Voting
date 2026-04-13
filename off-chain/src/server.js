require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { ethers } = require('ethers');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(cors());
app.use(express.json());

// Set up rate limiting: max 5 requests per 15 minutes per IP
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,
    message: { success: false, error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/relay/vote', limiter);

const DAO_CONTRACT_ADDRESS = process.env.DAO_CONTRACT_ADDRESS || "0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496";
const DAO_ABI = [
    "function vote(uint256 _proposalId, bool _support, bytes calldata _proof, bytes32[] calldata _publicInputs) external"
];
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:8545";
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY || "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

app.post('/api/relay/vote', async (req, res) => {
    try {
        const { proposalId, support, proof, publicInputs } = req.body;
        
        console.log(`Relaying vote for Proposal ${proposalId}...`);

        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const wallet = new ethers.Wallet(RELAYER_PRIVATE_KEY, provider);
        const contract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, wallet);

        // Convert the string array to bytes32, exactly like front-end does
        const publicInputsBytes32 = publicInputs.map((input) =>
            ethers.zeroPadValue(ethers.toBeHex(BigInt(input)), 32)
        );

        // Submit the transaction autonomously 
        const tx = await contract.vote(proposalId, support, proof, publicInputsBytes32);
        console.log(`Waiting for TX Hash: ${tx.hash}`);
        const receipt = await tx.wait();
        
        console.log(`Vote Success in Block ${receipt.blockNumber}!`);
        res.json({ success: true, txHash: receipt.hash });
    } catch (error) {
        console.error("Relay error:", error);
        // Extract reason if it exists in ethers error
        let errorMsg = error.message;
        if(error.reason) errorMsg = error.reason;
        res.status(500).json({ success: false, error: errorMsg });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Relayer server running on port ${PORT}`);
    console.log(`Funded Relayer address configured to pay for Gas.`);
});
