import { RefreshCcw } from "lucide-react";
import type { Proposal, ProposalStage } from "../types";
import { PageHeader, ProposalCard } from "../components";

interface HubPageProps {
    isProposerRole: boolean;
    isLoading: boolean;
    newProposalDesc: string;
    setNewProposalDesc: (value: string) => void;
    newProposalRound: number;
    setNewProposalRound: (value: number) => void;
    newProposalDurationMinutes: number;
    setNewProposalDurationMinutes: (value: number) => void;
    onCreateProposal: () => void;
    onRefresh: () => void;
    proposals: Proposal[];
    getProposalStage: (proposal: Proposal) => ProposalStage;
    formatAddress: (address: string) => string;
    onOpenProposal: (proposalId: number) => void;
}

export function HubPage(props: HubPageProps) {
    return (
        <section className="page reveal">
            <PageHeader
                title="DAO Hub"
                subtitle="Create proposals, inspect rounds, and open voting rooms."
                actions={(
                    <button className="ghost-btn" onClick={props.onRefresh}>
                        <RefreshCcw size={16} /> Refresh
                    </button>
                )}
            />

            {props.isProposerRole && (
                <div className="panel reveal-delay-1">
                    <h3>Create New Proposal</h3>
                    <p className="muted-copy">Only registered proposer wallets can create governance items.</p>
                    <textarea
                        className="input text-area"
                        placeholder="Describe the proposal outcome and rationale..."
                        value={props.newProposalDesc}
                        onChange={(event) => props.setNewProposalDesc(event.target.value)}
                    />
                    <div className="field-row" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "flex-end" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                            <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Eligibility Round ID</label>
                            <input
                                className="input"
                                type="number"
                                min={1}
                                value={props.newProposalRound}
                                onChange={(event) => props.setNewProposalRound(Number(event.target.value))}
                                placeholder="Round ID"
                                style={{ width: "100%" }}
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
                            <label style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)" }}>Voting Period (minutes)</label>
                            <input
                                className="input"
                                type="number"
                                min={1}
                                value={props.newProposalDurationMinutes}
                                onChange={(event) => props.setNewProposalDurationMinutes(Number(event.target.value))}
                                placeholder="Duration (minutes)"
                                style={{ width: "100%" }}
                            />
                        </div>
                        <button className="primary-btn" disabled={props.isLoading} onClick={props.onCreateProposal} style={{ height: "42px", padding: "0 1.5rem" }}>
                            Submit Proposal
                        </button>
                    </div>
                </div>
            )}

            <div className="proposal-grid">
                {props.proposals.length === 0 && (
                    <article className="panel empty-state">
                        <h3>No proposals yet</h3>
                        <p className="muted-copy">Create one from a proposer wallet to start voting.</p>
                    </article>
                )}

                {props.proposals.map((proposal) => {
                    const stage = props.getProposalStage(proposal);

                    return (
                        <ProposalCard
                            key={proposal.id}
                            proposal={proposal}
                            stage={stage}
                            formatAddress={props.formatAddress}
                            onOpen={props.onOpenProposal}
                        />
                    );
                })}
            </div>
        </section>
    );
}
