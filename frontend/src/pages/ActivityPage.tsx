import type { ActivityEntry } from "../types";
import { PageHeader, StatPanel } from "../components";

interface ActivityPageProps {
    walletConnected: boolean;
    userAddress: string;
    myRole: string;
    myProposalsLength: number;
    activeCount: number;
    activityLog: ActivityEntry[];
    formatAddress: (address: string) => string;
    onGoHub: () => void;
}

export function ActivityPage(props: ActivityPageProps) {
    return (
        <section className="page reveal">
            <PageHeader
                title="My Activity"
                subtitle="Track your current session actions and governance footprint."
                actions={<button className="ghost-btn" onClick={props.onGoHub}>Go to DAO Hub</button>}
            />

            <div className="insight-grid">
                <StatPanel
                    label="Wallet"
                    value={props.walletConnected ? props.formatAddress(props.userAddress) : "Disconnected"}
                />
                <StatPanel label="Role" value={props.myRole || "Unverified"} />
                <StatPanel label="My Proposals" value={props.myProposalsLength} />
                <StatPanel label="Active Proposals" value={props.activeCount} />
            </div>

            <div className="panel">
                <h3>Session Timeline</h3>
                {props.activityLog.length === 0 ? (
                    <p className="muted-copy">No actions recorded yet. Verify identity or cast a vote to populate this timeline.</p>
                ) : (
                    <div className="timeline-stack">
                        {props.activityLog.map((entry) => (
                            <article key={entry.id} className={`timeline-item ${entry.tone}`}>
                                <div>
                                    <p className="timeline-title">{entry.title}</p>
                                    <p className="muted-copy">{entry.detail}</p>
                                </div>
                                <span className="timeline-time">{entry.timestamp}</span>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
