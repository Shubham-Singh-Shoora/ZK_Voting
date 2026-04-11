import { RefreshCcw } from "lucide-react";
import type { Proposal, ProposalStage } from "../types";
import { PageHeader, ProposalCard } from "../components";

interface ExplorerPageProps {
    explorerQuery: string;
    setExplorerQuery: (value: string) => void;
    explorerStatus: "ALL" | "ACTIVE" | "CLOSED";
    setExplorerStatus: (value: "ALL" | "ACTIVE" | "CLOSED") => void;
    explorerRound: string;
    setExplorerRound: (value: string) => void;
    roundOptions: string[];
    filteredProposals: Proposal[];
    getProposalStage: (proposal: Proposal) => ProposalStage;
    formatAddress: (address: string) => string;
    onRefresh: () => void;
    onOpenProposal: (proposalId: number) => void;
}

export function ExplorerPage(props: ExplorerPageProps) {
    return (
        <section className="page reveal">
            <PageHeader
                title="Proposal Explorer"
                subtitle="Search and filter governance proposals by status, round, and proposer."
                actions={(
                    <button className="ghost-btn" onClick={props.onRefresh}>
                        <RefreshCcw size={16} /> Refresh
                    </button>
                )}
            />

            <div className="panel filter-panel">
                <div className="field-row filter-row">
                    <input
                        className="input"
                        placeholder="Search by proposal id, description, or address"
                        value={props.explorerQuery}
                        onChange={(event) => props.setExplorerQuery(event.target.value)}
                    />
                    <select
                        className="input select-input"
                        value={props.explorerStatus}
                        onChange={(event) => props.setExplorerStatus(event.target.value as "ALL" | "ACTIVE" | "CLOSED")}
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active</option>
                        <option value="CLOSED">Closed</option>
                    </select>
                    <select
                        className="input select-input"
                        value={props.explorerRound}
                        onChange={(event) => props.setExplorerRound(event.target.value)}
                    >
                        <option value="ALL">All Rounds</option>
                        {props.roundOptions.map((round) => (
                            <option key={round} value={round}>Round {round}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="proposal-grid">
                {props.filteredProposals.length === 0 ? (
                    <article className="panel empty-state">
                        <h3>No proposals match</h3>
                        <p className="muted-copy">Adjust filters or refresh on-chain state.</p>
                    </article>
                ) : (
                    props.filteredProposals.map((proposal) => {
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
                    })
                )}
            </div>
        </section>
    );
}
