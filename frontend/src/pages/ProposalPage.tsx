import { Vote } from "lucide-react";
import type { Proposal, ProposalStage } from "../types";

interface ProposalPageProps {
    selectedProposal: Proposal;
    stage: ProposalStage;
    yesShare: number;
    mySecret: bigint | null;
    isLoading: boolean;
    onVoteYes: () => void;
    onVoteNo: () => void;
    onExecute: () => void;
    onBackToHub: () => void;
}

export function ProposalPage(props: ProposalPageProps) {
    return (
        <section className="page reveal">
            <div className="page-head split">
                <div>
                    <h2>Proposal Room #{props.selectedProposal.id}</h2>
                    <p>{props.selectedProposal.description}</p>
                </div>
                <button className="ghost-btn" onClick={props.onBackToHub}>Back to Hub</button>
            </div>

            <div className="panel">
                <div className="proposal-top">
                    <span className={`badge ${props.stage.tone}`}>
                        {props.stage.label}
                    </span>
                    <span className="badge subtle">Round {props.selectedProposal.eligibilityRound.toString()}</span>
                </div>
                <p className="muted-copy stage-copy">{props.stage.summary}</p>

                <div className="result-bar-wrap">
                    <div className="result-bar">
                        <div className="yes-bar" style={{ width: `${props.yesShare}%` }} />
                    </div>
                    <div className="votes-inline">
                        <span>YES {props.selectedProposal.yesVotes.toString()}</span>
                        <span>NO {props.selectedProposal.noVotes.toString()}</span>
                    </div>
                </div>

                {props.stage.canVote ? (
                    <div className="vote-panel">
                        <h3>Cast Anonymous Vote</h3>
                        <p className="muted-copy">
                            Proofs are generated in-browser, then sent through the relayer for gasless execution.
                        </p>
                        {props.mySecret ? (
                            <div className="button-row">
                                <button className="primary-btn vote-btn" disabled={props.isLoading} onClick={props.onVoteYes}>
                                    <Vote size={16} /> Vote Yes
                                </button>
                                <button className="danger-btn vote-btn" disabled={props.isLoading} onClick={props.onVoteNo}>
                                    <Vote size={16} /> Vote No
                                </button>
                            </div>
                        ) : (
                            <p className="muted-copy">Verify your identity first to unlock your secret witness.</p>
                        )}
                    </div>
                ) : (
                    <p className="muted-copy">Voting is not currently open for this proposal.</p>
                )}

                {props.stage.canExecute && (
                    <div className="vote-panel execution-panel">
                        <h3>Finalize Governance Result</h3>
                        <p className="muted-copy">
                            Execute this proposal on-chain to settle the final governance state.
                        </p>
                        <button className="primary-btn" disabled={props.isLoading} onClick={props.onExecute}>
                            Finalize Execution
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
