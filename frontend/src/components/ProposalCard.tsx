import type { Proposal, ProposalStage } from "../types";

interface ProposalCardProps {
    proposal: Proposal;
    stage: ProposalStage;
    formatAddress: (address: string) => string;
    onOpen: (proposalId: number) => void;
}

export function ProposalCard(props: ProposalCardProps) {
    const { proposal, stage } = props;

    return (
        <article key={proposal.id} className="panel proposal-card" onClick={() => props.onOpen(proposal.id)}>
            <div className="proposal-top">
                <span className={`badge ${stage.tone}`}>
                    {stage.label}
                </span>
                <span className="badge subtle">Round {proposal.eligibilityRound.toString()}</span>
            </div>
            <h3>#{proposal.id} {proposal.description}</h3>
            <p className="muted-copy">Proposer {props.formatAddress(proposal.proposer)}</p>
            <p className="muted-copy stage-copy">{stage.summary}</p>
            <div className="votes-inline">
                <span>YES {proposal.yesVotes.toString()}</span>
                <span>NO {proposal.noVotes.toString()}</span>
            </div>
        </article>
    );
}
