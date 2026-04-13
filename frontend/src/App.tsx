import { useCallback, useEffect, useMemo, useState } from "react";
import { ethers } from "ethers";
import { generateProof } from "./proof";
import {
    getCredentialsForRound,
    getMerklePath,
    getSecretIndexForRound,
    findRoundAndIndexForSecret,
} from "./merkleTree";
import {
    CHAIN_ID,
    DAO_ABI,
    DAO_CONTRACT_ADDRESS,
    ELIGIBILITY_REGISTRY_ABI,
} from "./constants";
import type {
    ActivityEntry,
    NotificationItem,
    Proposal,
    ViewState,
} from "./types";
import { DOCK_ITEMS, FAQ_ITEMS } from "./config/appConfig";
import {
    formatAddress,
    formatTimeFromUnix,
    getChainLabel,
    getProposalStage,
} from "./utils/governance";
import { UtilityStrip } from "./components/layout/UtilityStrip";
import { CommandDock } from "./components/layout/CommandDock";
import { StatusToast } from "./components/feedback/StatusToast";
import { LandingPage } from "./pages/LandingPage";
import { VerifyPage } from "./pages/VerifyPage";
import { HubPage } from "./pages/HubPage";
import { ProposalPage } from "./pages/ProposalPage";
import { ActivityPage } from "./pages/ActivityPage";
import { ExplorerPage } from "./pages/ExplorerPage";
import { SupportPage } from "./pages/SupportPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { DocsPage } from "./pages/DocsPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import "./App.css";

const BN254_FIELD_MODULUS = 21888242871839275222246405745257275088548364400416034343698204186575808495617n;
const PROPOSER_REGISTRATION_ID_FIELD = ethers.MaxUint256 % BN254_FIELD_MODULUS;

function App() {
    const [view, setView] = useState<ViewState>("LANDING");
    const [status, setStatus] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [walletConnected, setWalletConnected] = useState(false);
    const [userAddress, setUserAddress] = useState("");

    const [verifyEmail, setVerifyEmail] = useState("");
    const [mySecret, setMySecret] = useState<bigint | null>(null);
    const [myRole, setMyRole] = useState("");

    const [proposals, setProposals] = useState<Proposal[]>([]);
    const [selectedProposalId, setSelectedProposalId] = useState<number | null>(null);
    const [isProposerRole, setIsProposerRole] = useState(false);

    const [newProposalDesc, setNewProposalDesc] = useState("");
    const [newProposalRound, setNewProposalRound] = useState(1);
    const [newProposalDurationMinutes, setNewProposalDurationMinutes] = useState(60);
    const [currentTimestamp, setCurrentTimestamp] = useState(() => Math.floor(Date.now() / 1000));

    const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
    const [explorerQuery, setExplorerQuery] = useState("");
    const [explorerStatus, setExplorerStatus] = useState<"ALL" | "ACTIVE" | "CLOSED">("ALL");
    const [explorerRound, setExplorerRound] = useState("ALL");
    const [openFaqId, setOpenFaqId] = useState<string>(FAQ_ITEMS[0].id);
    const [notifications, setNotifications] = useState<NotificationItem[]>([
        {
            id: "system-welcome",
            title: "Notification center initialized",
            detail: "Proposal and activity alerts will appear here in real-time.",
            category: "System",
            priority: "info",
            isRead: false,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
    ]);

    const selectedProposal = useMemo(
        () => proposals.find((proposal) => proposal.id === selectedProposalId) ?? null,
        [proposals, selectedProposalId],
    );

    const chainLabel = useMemo(() => getChainLabel(CHAIN_ID), []);

    function getEthereumProvider() {
        return window.ethereum;
    }

    function getExpectedChainHex() {
        return `0x${CHAIN_ID.toString(16)}`;
    }

    async function ensureExpectedChain(providerSource: EthereumProvider) {
        const chainIdHex = await providerSource.request({ method: "eth_chainId" });
        const activeChainId =
            typeof chainIdHex === "string" ? Number.parseInt(chainIdHex, 16) : Number.NaN;

        if (activeChainId === CHAIN_ID) {
            return true;
        }

        try {
            await providerSource.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: getExpectedChainHex() }],
            });
            return true;
        } catch (error) {
            console.error(error);
            showStatus(`Wrong network. Switch wallet to ${chainLabel} (chain ${CHAIN_ID}).`);
            recordActivity("Network mismatch", `Wallet is not connected to ${chainLabel}.`, "warn");
            return false;
        }
    }

    async function getDaoReadContext() {
        const providerSource = getEthereumProvider();
        if (!providerSource) {
            throw new Error("Wallet provider unavailable.");
        }

        const onExpectedChain = await ensureExpectedChain(providerSource);
        if (!onExpectedChain) {
            throw new Error(`Please switch to ${chainLabel}.`);
        }

        const provider = new ethers.BrowserProvider(providerSource);
        const bytecode = await provider.getCode(DAO_CONTRACT_ADDRESS);

        if (!bytecode || bytecode === "0x") {
            throw new Error(
                `No ZKVotingDAO contract found at ${DAO_CONTRACT_ADDRESS} on ${chainLabel}.`,
            );
        }

        const contract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, provider);
        return { provider, contract };
    }

    async function getDaoWriteContract() {
        const { provider } = await getDaoReadContext();
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, signer);
        return { provider, signer, contract };
    }

    async function getGasOverrides() {
        try {
            const providerSource = getEthereumProvider();
            if (!providerSource) return {};
            const provider = new ethers.BrowserProvider(providerSource);
            const feeData = await provider.getFeeData();
            
            // Check if the provider actually supports EIP-1559 methods
            const hasEip1559 = !!feeData.maxPriorityFeePerGas && !!feeData.maxFeePerGas;

            if (!hasEip1559) {
                // If EIP-1559 fails, fallback to standard gasPrice with a buffer
                const gasPrice = feeData.gasPrice ?? ethers.parseUnits("1.5", "gwei");
                return {
                    gasPrice: (gasPrice * 120n) / 100n
                };
            }

            return {
                maxPriorityFeePerGas: (feeData.maxPriorityFeePerGas * 120n) / 100n,
                maxFeePerGas: (feeData.maxFeePerGas * 120n) / 100n,
            };
        } catch (e) {
            console.warn("Failed to fetch gas fees, falling back to defaults:", e);
            return {};
        }
    }

    function recordActivity(
        title: string,
        detail: string,
        tone: ActivityEntry["tone"] = "info",
    ) {
        const entry: ActivityEntry = {
            id: Date.now(),
            title,
            detail,
            tone,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setActivityLog((previous) => [entry, ...previous].slice(0, 20));
    }

    function markNotificationRead(id: string, readState: boolean) {
        setNotifications((previous) =>
            previous.map((notification) =>
                notification.id === id
                    ? { ...notification, isRead: readState }
                    : notification,
            ),
        );
    }

    function markAllNotificationsRead() {
        setNotifications((previous) =>
            previous.map((notification) => ({ ...notification, isRead: true })),
        );
    }

    function clearReadNotifications() {
        setNotifications((previous) => previous.filter((notification) => !notification.isRead));
    }

    async function connectWallet() {
        try {
            const providerSource = getEthereumProvider();
            if (!providerSource) {
                showStatus("Please install MetaMask to continue.");
                return;
            }

            await providerSource.request({ method: "eth_requestAccounts" });
            const { provider, contract } = await getDaoReadContext();
            const signer = await provider.getSigner();
            const address = await signer.getAddress();

            setUserAddress(address);
            setWalletConnected(true);
            setView("VERIFY");

            await loadProposals();

            const proposerFlag = await contract.isProposer(address);
            setIsProposerRole(Boolean(proposerFlag));

            showStatus("Wallet connected. Welcome to the DAO console.");
            recordActivity("Wallet connected", `Signed in as ${formatAddress(address)}`, "success");
        } catch (error) {
            console.error(error);
            showStatus("Failed to connect wallet.");
            recordActivity("Wallet connection failed", "MetaMask connection attempt did not complete.", "warn");
        }
    }

    const loadProposals = useCallback(async () => {
        try {
            const providerSource = getEthereumProvider();
            if (!providerSource) {
                return;
            }

            const { contract } = await getDaoReadContext();
            const count = await contract.proposalCount();
            const total = Number(count);

            const loaded: Proposal[] = [];
            for (let index = 0; index < total; index += 1) {
                const proposalTuple = await contract.getProposal(index);
                const isActive = await contract.isProposalActive(index);

                loaded.push({
                    id: index,
                    description: proposalTuple[0],
                    yesVotes: proposalTuple[1],
                    noVotes: proposalTuple[2],
                    startTime: proposalTuple[3],
                    endTime: proposalTuple[4],
                    eligibilityRound: proposalTuple[5],
                    merkleRoot: proposalTuple[6],
                    executed: proposalTuple[7],
                    cancelled: proposalTuple[8],
                    proposer: proposalTuple[9],
                    isActive,
                });
            }

            setProposals(loaded.reverse());
        } catch (error) {
            console.error(error);
            const message = getErrorMessage(error);
            if (message.includes("No ZKVotingDAO contract found")) {
                setStatus(message);
            } else {
                setStatus("Could not load proposals.");
            }
            window.setTimeout(() => setStatus(""), 4500);
        }
    }, [chainLabel]);

    function handleVerifyEligibility() {
        if (!verifyEmail.trim()) {
            showStatus("Enter your registered email first.");
            return;
        }

        const normalized = verifyEmail.trim().toLowerCase();
        const emailHash = ethers.sha256(ethers.toUtf8Bytes(normalized));
        const field = BigInt(
            "21888242871839275222246405745257275088548364400416034343698204186575808495617",
        );
        const fieldHash = BigInt(emailHash) % field;

        const proposerCredential = getCredentialsForRound(999).find(
            (credential) => credential.emailHash === fieldHash,
        );

        if (proposerCredential) {
            setMyRole("Faculty proposer cohort (Round 999)");
            setMySecret(proposerCredential.secret);
            showStatus(`Faculty verified! Secret: ${proposerCredential.secret.toString().substring(0, 12)}...`);
            recordActivity("Eligibility verified", "Matched proposer credential in round 999.", "success");
            return;
        }

        const voterCredential = getCredentialsForRound(1).find(
            (credential) => credential.emailHash === fieldHash,
        );

        if (voterCredential) {
            setMyRole("Student voter cohort (Round 1)");
            setMySecret(voterCredential.secret);
            showStatus(`Student verified! Secret: ${voterCredential.secret.toString().substring(0, 12)}...`);
            recordActivity("Eligibility verified", "Matched student voter credential in round 1.", "success");
            return;
        }

        setMyRole("Not Found");
        setMySecret(null);
        showStatus("No eligibility record found for this email.");
        recordActivity("Eligibility check failed", "No matching record found for supplied email hash.", "warn");
    }

    async function registerAsProposer() {
        if (!mySecret) {
            return;
        }

        try {
            setIsLoading(true);
            showStatus("Generating proposer proof...");

            const roundId = 999;
            const secretIndex = getSecretIndexForRound(mySecret, roundId);
            const { pathElements, pathIndices } = getMerklePath(secretIndex, roundId);

            const { provider, signer, contract: signerContract } = await getDaoWriteContract();
            const contract = new ethers.Contract(DAO_CONTRACT_ADDRESS, DAO_ABI, provider);
            let configuredRound = Number(await contract.proposerEligibilityRound());
            if (configuredRound !== roundId) {
                const monitorAddress = String(await contract.monitor()).toLowerCase();
                const signerAddress = String(await signer.getAddress()).toLowerCase();

                if (signerAddress !== monitorAddress) {
                    throw new Error(
                        `DAO proposer round is ${configuredRound}. Monitor (${monitorAddress}) must set proposer round to ${roundId}.`,
                    );
                }

                showStatus(`Configuring proposer round to ${roundId}...`);
                const overrides = await getGasOverrides();
                const setRoundTx = await signerContract.setProposerEligibilityRound(roundId, overrides);
                await setRoundTx.wait();
                configuredRound = Number(await contract.proposerEligibilityRound());

                if (configuredRound !== roundId) {
                    throw new Error(`Failed to set proposer round to ${roundId}.`);
                }
            }

            const registryAddress = await contract.eligibilityRegistry();
            const registry = new ethers.Contract(registryAddress, ELIGIBILITY_REGISTRY_ABI, provider);
            const proposerRoot = await registry.getRoot(roundId);

            // Pre-flight check: Is the user already a proposer?
            const alreadyProposer = await contract.isProposer(userAddress);
            if (alreadyProposer) {
                showStatus("You are already registered as a proposer.");
                setIsProposerRole(true);
                return;
            }

            // Merkle Sync Check: Does local credential match on-chain root?
            // Since the JSON doesn't store the root, we check if the path is valid for our on-chain root
            // (Verification happens during proof generation, but we log the attempt)
            
            console.log("Generating proposer ZK proof with inputs:", {
                secretIndex,
                pathElements: pathElements.map((e) => e.toString()),
                pathIndices,
                root: proposerRoot.toString(),
                proposalId: PROPOSER_REGISTRATION_ID_FIELD.toString(),
            });

            const { proof, publicInputs } = await generateProof({
                secret: mySecret,
                pathElements,
                pathIndices,
                proposalId: PROPOSER_REGISTRATION_ID_FIELD,
                root: BigInt(proposerRoot),
            });

            console.log("ZK proof generated successfully.");
            console.log("Proof length (bytes):", proof.length);
            console.log("Proof length (fields):", proof.length / 32);
            console.log("Public inputs (ordered):", publicInputs);


            // Debug check: compare against expected root and registration ID
            // Note: Noir 1.0 public input ordering can vary; we log all for inspection.
            if (!publicInputs.includes(proposerRoot.toString().toLowerCase())) {
                console.warn("WARNING: The contract's Merkle root is not present in the proof's public inputs.");
            }
            const regIdHex = ethers.toBeHex(PROPOSER_REGISTRATION_ID_FIELD).toLowerCase();
            if (!publicInputs.some(input => input.toLowerCase() === regIdHex)) {
                console.warn("WARNING: The PROPOSER_REGISTRATION_ID_FIELD is not present in the proof's public inputs.");
            }

            const publicInputsBytes32 = publicInputs.map((input: string) =>
                ethers.zeroPadValue(ethers.toBeHex(BigInt(input)), 32),
            );

            // Nullifier Check: Has this specific secret/identity already been used to register?
            const nullifierUsed = await contract.proposerNullifierUsed(publicInputsBytes32[2]);
            if (nullifierUsed) {
                throw new Error("This proposer identity (nullifier) has already been registered on-chain.");
            }

            const overrides = await getGasOverrides();
            showStatus("Validating proof with blockchain (Dry Run)...");
            
            // Perform a Dry Run (staticCall) to catch the actual revert reason
            try {
                await contract.registerProposer.staticCall(proof, publicInputsBytes32);
                console.log("Dry run successful! Proof is valid.");
            } catch (dryRunError: any) {
                console.error("Dry run failed:", dryRunError);
                // Attempt to extract revert reason from ethers error
                const reason = dryRunError.reason || dryRunError.message || "";
                if (reason.includes("RootMismatch")) throw new Error("On-chain Merkle root has changed since you verified your email. Please re-verify.");
                if (reason.includes("InvalidProof")) throw new Error("The ZK proof is cryptographically invalid for this circuit. Try refreshing.");
                if (reason.includes("NullifierAlreadyUsed")) throw new Error("This identity has already been registered.");
                throw dryRunError; // Rethrow if we can't identify a specific reason
            }

            showStatus("Submitting registration transaction...");
            
            // Add a generous gas limit since estimateGas is failing
            const tx = await signerContract.registerProposer(proof, publicInputsBytes32, {
                ...overrides,
                gasLimit: 8000000n, // Large enough for Noir proof verification + calldata
            });
            await tx.wait();

            setIsProposerRole(true);
            showStatus("You are now registered as proposer.");
            recordActivity("Proposer registered", "ZK proposer registration completed.", "success");
        } catch (error: any) {
            console.error(error);
            let message = getErrorMessage(error);
            
            if (message.includes("RootMismatch")) {
                message = "The on-chain Merkle root has changed. Please refresh and re-verify your email.";
            } else if (message.includes("NullifierAlreadyUsed")) {
                message = "This identity has already been registered as a proposer.";
            } else if (message.includes("InvalidProof")) {
                message = "The ZK proof was rejected by the contract verifier. Check circuit/verifier sync.";
            } else if (message.includes("action=\"estimateGas\"")) {
                message = "Blockchain rejected the transaction. This usually means the ZK proof is invalid or root is stale.";
            }

            showStatus(`Registration failed: ${message}`);
            recordActivity("Registration failed", message, "error");
        } finally {
            setIsLoading(false);
        }
    }

    async function createProposal() {
        if (!newProposalDesc.trim()) {
            showStatus("Proposal description cannot be empty.");
            return;
        }

        if (newProposalDurationMinutes < 1) {
            showStatus("Duration must be at least 1 minute.");
            return;
        }

        try {
            setIsLoading(true);
            showStatus("Submitting proposal...");

            const providerSource = getEthereumProvider();
            if (!providerSource) {
                showStatus("Wallet provider unavailable.");
                return;
            }

            const { contract } = await getDaoWriteContract();
            const durationSeconds = Math.floor(newProposalDurationMinutes * 60);

            const overrides = await getGasOverrides();
            const tx = await contract.createProposal(newProposalDesc, newProposalRound, durationSeconds, overrides);
            await tx.wait();

            setNewProposalDesc("");
            setNewProposalRound(1);
            setNewProposalDurationMinutes(60);
            showStatus("Proposal created successfully.");
            recordActivity("Proposal created", `Submitted proposal for round ${newProposalRound}.`, "success");
            await loadProposals();
        } catch (error) {
            console.error(error);
            const message = getErrorMessage(error);
            if (message.includes("No ZKVotingDAO contract found")) {
                showStatus(message);
            } else {
                showStatus("Failed to create proposal.");
            }
            recordActivity("Proposal creation failed", "Transaction failed before confirmation.", "warn");
        } finally {
            setIsLoading(false);
        }
    }

    async function voteGasless(support: boolean, manualSecret?: string) {
        let secretToUse = mySecret;
        
        if (manualSecret && manualSecret.trim()) {
            try {
                secretToUse = BigInt(manualSecret.trim());
            } catch (e) {
                showStatus("Invalid secret format. Must be a numeric string.");
                return;
            }
        }

        if (!secretToUse || selectedProposalId === null) {
            showStatus("Please verify your identity or enter your secret first.");
            return;
        }

        const proposal = proposals.find((item) => item.id === selectedProposalId);
        if (!proposal) {
            return;
        }

        try {
            setIsLoading(true);
            showStatus("Checking identity round...");

            // Use the new helper to find which round this secret actually belongs to
            let secretRound: number;
            let secretIndex: number;
            
            try {
                const lookup = findRoundAndIndexForSecret(secretToUse);
                secretRound = lookup.roundId;
                secretIndex = lookup.index;
            } catch (e: any) {
                throw new Error(e.message || "Secret not recognized in current eligibility rounds.");
            }

            const proposalRound = Number(proposal.eligibilityRound);
            
            if (secretRound !== proposalRound) {
                console.warn(`Round mismatch: Secret is from round ${secretRound}, but proposal requires round ${proposalRound}. Trying anyway if Merkle roots match...`);
            }

            const { pathElements, pathIndices } = getMerklePath(secretIndex, secretRound);

            showStatus("Generating anonymous proof...");

            const { proof, publicInputs } = await generateProof({
                secret: secretToUse,
                pathElements,
                pathIndices,
                proposalId: BigInt(selectedProposalId),
                root: BigInt(proposal.merkleRoot),
            });

            showStatus("Relaying gasless transaction...");

            const relayUrl = import.meta.env.VITE_RELAY_URL || "http://localhost:3000";
            const response = await fetch(`${relayUrl}/api/relay/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    proposalId: selectedProposalId,
                    support,
                    proof: ethers.hexlify(proof),
                    publicInputs,
                }),
            });

            const payload = await response.json();

            if (!payload.success) {
                throw new Error(payload.error);
            }

            showStatus("Vote relayed and recorded.");
            recordActivity(
                "Vote cast",
                `${support ? "YES" : "NO"} vote relayed for proposal #${selectedProposalId}.`,
                "success",
            );
            await loadProposals();
        } catch (error: unknown) {
            console.error(error);
            const message = getErrorMessage(error);
            if (message.includes("NullifierAlreadyUsed")) {
                showStatus("You already voted on this proposal.");
                recordActivity("Vote rejected", "Nullifier already used for this proposal.", "warn");
            } else {
                showStatus("Vote failed. Ensure relayer is running.");
                recordActivity("Vote failed", "Relayer or proof execution failed.", "warn");
            }
        } finally {
            setIsLoading(false);
        }
    }

    async function executeProposal(proposalId: number) {
        try {
            setIsLoading(true);
            showStatus(`Executing proposal #${proposalId}...`);

            const providerSource = getEthereumProvider();
            if (!providerSource) {
                showStatus("Wallet provider unavailable.");
                return;
            }

            const { contract } = await getDaoWriteContract();

            const overrides = await getGasOverrides();
            const tx = await contract.executeProposal(proposalId, overrides);
            await tx.wait();

            showStatus(`Proposal #${proposalId} executed successfully.`);
            recordActivity("Proposal executed", `Finalized proposal #${proposalId} on-chain.`, "success");
            await loadProposals();
        } catch (error) {
            console.error(error);
            const message = getErrorMessage(error);
            if (message.includes("No ZKVotingDAO contract found")) {
                showStatus(message);
            } else {
                showStatus("Execution failed. Check proposal state and signer wallet.");
            }
            recordActivity("Execution failed", `Could not execute proposal #${proposalId}.`, "warn");
        } finally {
            setIsLoading(false);
        }
    }

    function showStatus(message: string) {
        setStatus(message);
        window.setTimeout(() => setStatus(""), 4500);
    }

    function getErrorMessage(error: unknown) {
        if (error instanceof Error) {
            return error.message;
        }

        if (typeof error === "string") {
            return error;
        }

        return "Unknown error";
    }

    function goToProposal(proposalId: number) {
        setSelectedProposalId(proposalId);
        setView("PROPOSAL");
    }

    useEffect(() => {
        // Check for Cross-Origin Isolation (critical for stable ZK proving in browser)
        console.log("Cross-Origin Isolated:", window.crossOriginIsolated);
        if (!window.crossOriginIsolated) {
            console.warn("WARNING: Page is NOT cross-origin isolated. Prover may be unstable. Ensure headers are correctly set in vite.config.ts.");
        }
    }, []);

    useEffect(() => {
        if (walletConnected) {
            void loadProposals();
        }
    }, [walletConnected, loadProposals]);

    useEffect(() => {
        const timer = window.setInterval(() => {
            setCurrentTimestamp(Math.floor(Date.now() / 1000));
        }, 30_000);

        return () => window.clearInterval(timer);
    }, []);

    useEffect(() => {
        if (view === "PROPOSAL" && !selectedProposal) {
            setView("HUB");
        }
    }, [selectedProposal, view]);

    useEffect(() => {
        const latest = activityLog[0];
        if (!latest) {
            return;
        }

        const nextNotification: NotificationItem = {
            id: `activity-${latest.id}`,
            title: latest.title,
            detail: latest.detail,
            category: "Activity",
            priority: latest.tone,
            isRead: false,
            timestamp: latest.timestamp,
        };

        setNotifications((previous) => {
            if (previous.some((item) => item.id === nextNotification.id)) {
                return previous;
            }
            return [nextNotification, ...previous].slice(0, 60);
        });
    }, [activityLog]);

    useEffect(() => {
        if (proposals.length === 0) {
            return;
        }

        const nowSeconds = Math.floor(Date.now() / 1000);

        setNotifications((previous) => {
            const existingIds = new Set(previous.map((item) => item.id));
            const discovered: NotificationItem[] = [];

            proposals.forEach((proposal) => {
                const stage = getProposalStage(proposal, nowSeconds);
                const discoveredId = `proposal-discovered-${proposal.id}`;
                if (!existingIds.has(discoveredId)) {
                    discovered.push({
                        id: discoveredId,
                        title: `Proposal #${proposal.id} discovered`,
                        detail: proposal.description,
                        category: "Proposal",
                        priority: "info",
                        isRead: false,
                        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                        proposalId: proposal.id,
                    });
                    existingIds.add(discoveredId);
                }

                const endSeconds = Number(proposal.endTime);
                const remaining = endSeconds - nowSeconds;

                if (stage.canVote && remaining > 0 && remaining <= 15 * 60) {
                    const endingSoonId = `proposal-ending-${proposal.id}`;
                    if (!existingIds.has(endingSoonId)) {
                        discovered.push({
                            id: endingSoonId,
                            title: `Proposal #${proposal.id} ending soon`,
                            detail: `Voting window closes around ${formatTimeFromUnix(proposal.endTime)}.`,
                            category: "Proposal",
                            priority: "warn",
                            isRead: false,
                            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            proposalId: proposal.id,
                        });
                        existingIds.add(endingSoonId);
                    }
                }

                if (!stage.canVote) {
                    const closedId = `proposal-closed-${proposal.id}`;
                    if (!existingIds.has(closedId)) {
                        const yes = Number(proposal.yesVotes);
                        const no = Number(proposal.noVotes);
                        const result = yes >= no ? "passed" : "rejected";

                        discovered.push({
                            id: closedId,
                            title: `Proposal #${proposal.id} voting concluded`,
                            detail: `Outcome: ${result} (${yes} yes / ${no} no).`,
                            category: "Proposal",
                            priority: "success",
                            isRead: false,
                            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                            proposalId: proposal.id,
                        });
                        existingIds.add(closedId);
                    }
                }
            });

            if (discovered.length === 0) {
                return previous;
            }

            return [...discovered, ...previous].slice(0, 60);
        });
    }, [proposals, currentTimestamp]);

    const totalVotes = selectedProposal
        ? Number(selectedProposal.yesVotes + selectedProposal.noVotes)
        : 0;
    const yesShare = selectedProposal
        ? totalVotes === 0
            ? 0
            : (Number(selectedProposal.yesVotes) / totalVotes) * 100
        : 0;

    const roundOptions = useMemo(
        () => Array.from(new Set(proposals.map((proposal) => proposal.eligibilityRound.toString()))),
        [proposals],
    );

    const filteredProposals = useMemo(() => {
        const normalizedQuery = explorerQuery.trim().toLowerCase();

        return proposals.filter((proposal) => {
            const stage = getProposalStage(proposal, currentTimestamp);
            const statusMatch =
                explorerStatus === "ALL"
                || (explorerStatus === "ACTIVE" && stage.canVote)
                || (explorerStatus === "CLOSED" && !stage.canVote);

            const roundMatch =
                explorerRound === "ALL" || proposal.eligibilityRound.toString() === explorerRound;

            const queryMatch =
                normalizedQuery.length === 0
                || proposal.description.toLowerCase().includes(normalizedQuery)
                || proposal.id.toString().includes(normalizedQuery)
                || proposal.proposer.toLowerCase().includes(normalizedQuery);

            return statusMatch && roundMatch && queryMatch;
        });
    }, [currentTimestamp, explorerQuery, explorerRound, explorerStatus, proposals]);

    const myProposals = useMemo(() => {
        const normalizedAddress = userAddress.toLowerCase();
        if (!normalizedAddress) {
            return [];
        }
        return proposals.filter((proposal) => proposal.proposer.toLowerCase() === normalizedAddress);
    }, [proposals, userAddress]);

    const activeCount = useMemo(
        () => proposals.filter((proposal) => getProposalStage(proposal, currentTimestamp).canVote).length,
        [currentTimestamp, proposals],
    );

    const endingSoonCount = useMemo(() => {
        return proposals.filter((proposal) => {
            const endSeconds = Number(proposal.endTime);
            const remaining = endSeconds - currentTimestamp;
            return getProposalStage(proposal, currentTimestamp).canVote && remaining > 0 && remaining <= 15 * 60;
        }).length;
    }, [currentTimestamp, proposals]);

    const passedCount = useMemo(
        () => proposals.filter((proposal) => getProposalStage(proposal, currentTimestamp).label === "Succeeded").length,
        [currentTimestamp, proposals],
    );

    const unreadNotifications = useMemo(
        () => notifications.filter((notification) => !notification.isRead).length,
        [notifications],
    );

    return (
        <div className={`shell ${view === "LANDING" ? "landing-shell" : ""}`}>
            <div className="mars-veil" aria-hidden="true" />
            <div className="ambient-layer" aria-hidden="true" />
            <div className="grid-noise" aria-hidden="true" />

            {view !== "LANDING" && (
                <UtilityStrip
                    walletConnected={walletConnected}
                    walletLabel={walletConnected ? formatAddress(userAddress) : "Connect Wallet"}
                    onWalletClick={walletConnected ? () => setView("VERIFY") : connectWallet}
                />
            )}

            <main className={`content-area ${view === "LANDING" ? "landing-mode" : ""}`}>
                {view === "LANDING" && (
                    <LandingPage
                        walletConnected={walletConnected}
                        walletLabel={walletConnected ? formatAddress(userAddress) : "Connect Wallet"}
                        chainLabel={chainLabel}
                        unreadNotifications={unreadNotifications}
                        proposalsLength={proposals.length}
                        activeCount={activeCount}
                        endingSoonCount={endingSoonCount}
                        passedCount={passedCount}
                        onConnectWallet={connectWallet}
                        onGoVerify={() => setView("VERIFY")}
                        onGoDocs={() => setView("DOCS")}
                        onGoResources={() => setView("RESOURCES")}
                        onGoExplorer={() => setView("EXPLORER")}
                        onGoNotifications={() => setView("NOTIFICATIONS")}
                        onGoHub={() => setView("HUB")}
                        onGoSupport={() => setView("SUPPORT")}
                    />
                )}

                {view === "VERIFY" && (
                    <VerifyPage
                        verifyEmail={verifyEmail}
                        setVerifyEmail={setVerifyEmail}
                        myRole={myRole}
                        mySecret={mySecret}
                        isProposerRole={isProposerRole}
                        isLoading={isLoading}
                        onVerifyEligibility={handleVerifyEligibility}
                        onRegisterAsProposer={registerAsProposer}
                        onGoHub={() => setView("HUB")}
                    />
                )}

                {view === "HUB" && (
                    <HubPage
                        isProposerRole={isProposerRole}
                        isLoading={isLoading}
                        newProposalDesc={newProposalDesc}
                        setNewProposalDesc={setNewProposalDesc}
                        newProposalRound={newProposalRound}
                        setNewProposalRound={setNewProposalRound}
                        newProposalDurationMinutes={newProposalDurationMinutes}
                        setNewProposalDurationMinutes={setNewProposalDurationMinutes}
                        onCreateProposal={createProposal}
                        onRefresh={loadProposals}
                        proposals={proposals}
                        getProposalStage={(proposal) => getProposalStage(proposal, currentTimestamp)}
                        formatAddress={formatAddress}
                        onOpenProposal={goToProposal}
                    />
                )}

                {view === "PROPOSAL" && selectedProposal && (
                    <ProposalPage
                        selectedProposal={selectedProposal}
                        stage={getProposalStage(selectedProposal, currentTimestamp)}
                        yesShare={yesShare}
                        mySecret={mySecret}
                        isLoading={isLoading}
                        onVoteYes={(manualSecret) => void voteGasless(true, manualSecret)}
                        onVoteNo={(manualSecret) => void voteGasless(false, manualSecret)}
                        onExecute={() => void executeProposal(selectedProposal.id)}
                        onBackToHub={() => setView("HUB")}
                    />
                )}

                {view === "ACTIVITY" && (
                    <ActivityPage
                        walletConnected={walletConnected}
                        userAddress={userAddress}
                        myRole={myRole}
                        myProposalsLength={myProposals.length}
                        activeCount={activeCount}
                        activityLog={activityLog}
                        formatAddress={formatAddress}
                        onGoHub={() => setView("HUB")}
                    />
                )}

                {view === "EXPLORER" && (
                    <ExplorerPage
                        explorerQuery={explorerQuery}
                        setExplorerQuery={setExplorerQuery}
                        explorerStatus={explorerStatus}
                        setExplorerStatus={setExplorerStatus}
                        explorerRound={explorerRound}
                        setExplorerRound={setExplorerRound}
                        roundOptions={roundOptions}
                        filteredProposals={filteredProposals}
                        getProposalStage={(proposal) => getProposalStage(proposal, currentTimestamp)}
                        formatAddress={formatAddress}
                        onRefresh={loadProposals}
                        onOpenProposal={goToProposal}
                    />
                )}

                {view === "SUPPORT" && (
                    <SupportPage
                        walletConnected={walletConnected}
                        onConnectWallet={connectWallet}
                        onGoVerify={() => setView("VERIFY")}
                        onGoExplorer={() => setView("EXPLORER")}
                        faqItems={FAQ_ITEMS}
                        openFaqId={openFaqId}
                        setOpenFaqId={setOpenFaqId}
                    />
                )}

                {view === "NOTIFICATIONS" && (
                    <NotificationsPage
                        unreadNotifications={unreadNotifications}
                        notifications={notifications}
                        activeCount={activeCount}
                        activityLogLength={activityLog.length}
                        onMarkAllRead={markAllNotificationsRead}
                        onClearRead={clearReadNotifications}
                        onOpenProposal={goToProposal}
                        onToggleRead={markNotificationRead}
                    />
                )}

                {view === "DOCS" && <DocsPage />}

                {view === "RESOURCES" && <ResourcesPage chainLabel={chainLabel} />}
            </main>

            {view !== "LANDING" && (
                <CommandDock
                    view={view}
                    items={DOCK_ITEMS}
                    walletConnected={walletConnected}
                    unreadNotifications={unreadNotifications}
                    onSetView={setView}
                />
            )}

            <StatusToast status={status} isLoading={isLoading} />
        </div>
    );
}

declare global {
    interface EthereumProvider {
        request: (args: { method: string; params?: unknown[] | Record<string, unknown> }) => Promise<unknown>;
    }

    interface Window {
        ethereum?: EthereumProvider;
    }
}

export default App;
