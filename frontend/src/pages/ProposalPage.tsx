import { Vote } from "lucide-react";
import { useState } from "react";
import type { Proposal, ProposalStage } from "../types";

interface ProposalPageProps {
    selectedProposal: Proposal;
    stage: ProposalStage;
    yesShare: number;
    mySecret: bigint | null;
    isLoading: boolean;
    onVoteYes: (manualSecret?: string) => void;
    onVoteNo: (manualSecret?: string) => void;
    onExecute: () => void;
    onBackToHub: () => void;
}

export function ProposalPage(props: ProposalPageProps) {
    const [manualSecret, setManualSecret] = useState(props.mySecret?.toString() || "");

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
                        
                        <div className="secret-input-row" style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--tg-text-muted)' }}>
                                Your ZK Secret (Numeric string from verification)
                            </label>
                            <input 
                                type="text"
                                className="page-input"
                                style={{ width: '100%', fontFamily: 'monospace', letterSpacing: '0.05em' }}
                                placeholder="Paste your secret numeric string here..."
                                value={manualSecret}
                                onChange={(e) => setManualSecret(e.target.value)}
                            />
                        </div>

                        <div className="button-row">
                            <button className="primary-btn vote-btn" disabled={props.isLoading} onClick={() => props.onVoteYes(manualSecret)}>
                                <Vote size={16} /> Vote Yes
                            </button>
                            <button className="danger-btn vote-btn" disabled={props.isLoading} onClick={() => props.onVoteNo(manualSecret)}>
                                <Vote size={16} /> Vote No
                            </button>
                        </div>
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
