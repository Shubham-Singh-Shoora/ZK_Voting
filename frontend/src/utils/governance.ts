import type { Proposal, ProposalStage } from "../types";

export function formatTimeFromUnix(seconds: bigint): string {
    const unix = Number(seconds);
    if (Number.isNaN(unix) || unix <= 0) {
        return "Unknown time";
    }

    return new Date(unix * 1000).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatAddress(address: string): string {
    if (!address) {
        return "Not connected";
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getChainLabel(chainId: number): string {
    switch (chainId) {
        case 421614:
            return "Arbitrum Sepolia";
        case 84532:
            return "Base Sepolia";
        case 11155111:
            return "Ethereum Sepolia";
        case 31337:
            return "Anvil 31337";
        default:
            return `Chain ${chainId}`;
    }
}

export function getProposalStage(proposal: Proposal, currentTimestamp: number): ProposalStage {
    if (proposal.cancelled) {
        return {
            label: "Cancelled",
            tone: "warn",
            summary: "Cancelled by monitor before finalization.",
            canVote: false,
            canExecute: false,
        };
    }

    if (proposal.executed) {
        const passed = Number(proposal.yesVotes) > Number(proposal.noVotes);
        return {
            label: "Executed",
            tone: "success",
            summary: passed ? "Finalized as passed." : "Finalized as defeated.",
            canVote: false,
            canExecute: false,
        };
    }

    const startsAt = Number(proposal.startTime);
    const endsAt = Number(proposal.endTime);

    if (currentTimestamp < startsAt) {
        return {
            label: "Pending",
            tone: "subtle",
            summary: `Voting opens ${formatTimeFromUnix(proposal.startTime)}.`,
            canVote: false,
            canExecute: false,
        };
    }

    if (currentTimestamp <= endsAt) {
        return {
            label: "Voting",
            tone: "active",
            summary: `Voting ends ${formatTimeFromUnix(proposal.endTime)}.`,
            canVote: true,
            canExecute: false,
        };
    }

    const passed = Number(proposal.yesVotes) > Number(proposal.noVotes);
    return {
        label: passed ? "Succeeded" : "Defeated",
        tone: passed ? "success" : "closed",
        summary: "Voting closed. Ready for on-chain execution finalization.",
        canVote: false,
        canExecute: true,
    };
}
