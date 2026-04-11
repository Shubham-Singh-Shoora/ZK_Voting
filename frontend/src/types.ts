export interface Proposal {
    id: number;
    description: string;
    yesVotes: bigint;
    noVotes: bigint;
    startTime: bigint;
    endTime: bigint;
    eligibilityRound: bigint;
    merkleRoot: string;
    executed: boolean;
    cancelled: boolean;
    proposer: string;
    isActive: boolean;
}

export type ViewState =
    | "LANDING"
    | "VERIFY"
    | "HUB"
    | "PROPOSAL"
    | "ACTIVITY"
    | "EXPLORER"
    | "NOTIFICATIONS"
    | "SUPPORT"
    | "DOCS"
    | "RESOURCES";

export interface ActivityEntry {
    id: number;
    title: string;
    detail: string;
    tone: "info" | "success" | "warn";
    timestamp: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface NotificationItem {
    id: string;
    title: string;
    detail: string;
    category: "System" | "Proposal" | "Activity";
    priority: "info" | "success" | "warn";
    isRead: boolean;
    timestamp: string;
    proposalId?: number;
}

export interface ProposalStage {
    label: string;
    tone: "active" | "closed" | "success" | "warn" | "subtle";
    summary: string;
    canVote: boolean;
    canExecute: boolean;
}
