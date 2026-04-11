import { Bell, BookOpen, CheckCircle2, Compass, LayoutDashboard, Orbit, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { FaqItem, ViewState } from "../types";

export interface DockItem {
    key: Exclude<ViewState, "PROPOSAL">;
    label: string;
    icon: LucideIcon;
    requiresWallet?: boolean;
}

export const DOCK_ITEMS: DockItem[] = [
    { key: "LANDING", label: "Home", icon: Orbit },
    { key: "VERIFY", label: "Verify", icon: ShieldCheck, requiresWallet: true },
    { key: "HUB", label: "DAO Hub", icon: LayoutDashboard, requiresWallet: true },
    { key: "ACTIVITY", label: "My Activity", icon: CheckCircle2, requiresWallet: true },
    { key: "EXPLORER", label: "Explorer", icon: Compass, requiresWallet: true },
    { key: "NOTIFICATIONS", label: "Alerts", icon: Bell, requiresWallet: true },
    { key: "SUPPORT", label: "Help", icon: BookOpen },
    { key: "DOCS", label: "Docs", icon: BookOpen },
    { key: "RESOURCES", label: "Resources", icon: Compass },
];

export const FAQ_ITEMS: FaqItem[] = [
    {
        id: "wallet",
        question: "Why is wallet connection required?",
        answer: "Wallet identity is needed for proposer permissions and relayer transaction context.",
    },
    {
        id: "verify",
        question: "Does email verification expose my identity on-chain?",
        answer: "No. Email input is hashed locally and only a proof-backed witness is used for eligibility.",
    },
    {
        id: "relayer",
        question: "What if gasless vote relay fails?",
        answer: "Check that the off-chain relayer server is running at localhost:3000 and retry the vote.",
    },
];
