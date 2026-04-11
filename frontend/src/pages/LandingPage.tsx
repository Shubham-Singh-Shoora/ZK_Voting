import { Bell, ShieldCheck, Vote, Wallet } from "lucide-react";

interface LandingPageProps {
    walletConnected: boolean;
    walletLabel: string;
    chainLabel: string;
    unreadNotifications: number;
    proposalsLength: number;
    activeCount: number;
    endingSoonCount: number;
    passedCount: number;
    onConnectWallet: () => void;
    onGoVerify: () => void;
    onGoDocs: () => void;
    onGoResources: () => void;
    onGoExplorer: () => void;
    onGoNotifications: () => void;
    onGoHub: () => void;
    onGoSupport: () => void;
}

export function LandingPage(props: LandingPageProps) {
    return (
        <section className="landing-experience reveal">
            <section className="landing-hero-stage">
                <div className="landing-spline-bg" aria-hidden="true">
                    <iframe
                        src="https://my.spline.design/retrofuturismbganimation-DDZqMjky3IpuAaJ1fJcN9QAr/"
                        frameBorder="0"
                        width="100%"
                        height="100%"
                        title="Retrofuturism Background"
                    />
                </div>
                <div className="landing-cinematic-overlay" aria-hidden="true" />

                <button className="wallet-pill landing-wallet-corner" onClick={props.walletConnected ? props.onGoVerify : props.onConnectWallet}>
                    <Wallet size={16} />
                    {props.walletLabel}
                </button>

                <div className="landing-hero-content">
                    <div className="landing-brand-floating">
                        <div className="brand-lockup">
                            <span className="brand-token">ZK</span>
                            <div>
                                <p className="brand-title">Aegis DAO Protocol</p>
                                <p className="brand-subtitle">private voting orchestration</p>
                            </div>
                        </div>
                    </div>

                    <p className="eyebrow">Professional DAO Infrastructure</p>
                    <h1 className="hero-title">Anonymous Governance Built for Real Communities</h1>
                    <p className="hero-copy">
                        A premium operating surface for privacy-preserving proposals, gasless voting, and
                        sybil-resistant identity proofs powered by Noir and on-chain verification.
                    </p>

                    <div className="hero-actions">
                        <button className="primary-btn" onClick={props.walletConnected ? props.onGoVerify : props.onConnectWallet}>
                            Launch Voting Console
                        </button>
                        <button className="ghost-btn" onClick={props.onGoDocs}>Read Architecture</button>
                    </div>
                </div>
            </section>

            <section className="landing-section reveal-delay-1">
                <div className="landing-kpis">
                    <div className="kpi-pill">
                        <span className="kpi-label">Runtime</span>
                        <span className="kpi-value">Gasless Relay</span>
                    </div>
                    <div className="kpi-pill">
                        <span className="kpi-label">Membership</span>
                        <span className="kpi-value">ZK Eligibility</span>
                    </div>
                    <div className="kpi-pill">
                        <span className="kpi-label">Chain</span>
                        <span className="kpi-value">{props.chainLabel}</span>
                    </div>
                    <div className="kpi-pill">
                        <span className="kpi-label">Alerts</span>
                        <span className="kpi-value">{props.unreadNotifications} unread</span>
                    </div>
                </div>
            </section>

            <section className="landing-section reveal-delay-2">
                <div className="landing-section-head">
                    <p className="eyebrow">Why Aegis</p>
                    <h2>Governance designed for integrity, privacy, and speed.</h2>
                </div>
                <div className="landing-feature-grid">
                    <article className="feature-tile">
                        <ShieldCheck size={18} />
                        <h4>Privacy-First Identity</h4>
                        <p>Email hashes and witness generation stay client-side for safer membership checks.</p>
                    </article>
                    <article className="feature-tile">
                        <Vote size={18} />
                        <h4>Verifiable Decisions</h4>
                        <p>Every proposal result is traceable on-chain while voters remain pseudonymous.</p>
                    </article>
                    <article className="feature-tile">
                        <Bell size={18} />
                        <h4>Operational Alerts</h4>
                        <p>Get notified when voting windows are close to expiry or outcomes are finalized.</p>
                    </article>
                </div>
            </section>

            <section className="landing-section reveal-delay-2">
                <div className="landing-section-grid">
                    <article className="landing-block">
                        <h3>How Governance Starts</h3>
                        <div className="journey-list">
                            <button className="journey-step" onClick={props.walletConnected ? props.onGoVerify : props.onConnectWallet}>
                                <span className="step-index">1</span>
                                <div>
                                    <p className="timeline-title">Connect Wallet</p>
                                    <p className="muted-copy">Use MetaMask to bind proposer and voter rights with your address.</p>
                                </div>
                            </button>
                            <button className="journey-step" onClick={props.onGoVerify}>
                                <span className="step-index">2</span>
                                <div>
                                    <p className="timeline-title">Verify Identity Privately</p>
                                    <p className="muted-copy">Email hash stays local while your witness unlocks for proof generation.</p>
                                </div>
                            </button>
                            <button className="journey-step" onClick={props.onGoExplorer}>
                                <span className="step-index">3</span>
                                <div>
                                    <p className="timeline-title">Vote or Propose</p>
                                    <p className="muted-copy">Open proposal rooms, inspect rounds, and cast anonymous gasless votes.</p>
                                </div>
                            </button>
                        </div>
                    </article>

                    <article className="landing-block">
                        <h3>Governance Pulse</h3>
                        <div className="pulse-grid">
                            <div className="pulse-item">
                                <p className="metric-label">Total Proposals</p>
                                <p className="metric-value">{props.proposalsLength}</p>
                            </div>
                            <div className="pulse-item">
                                <p className="metric-label">Active Windows</p>
                                <p className="metric-value">{props.activeCount}</p>
                            </div>
                            <div className="pulse-item">
                                <p className="metric-label">Ending Soon</p>
                                <p className="metric-value">{props.endingSoonCount}</p>
                            </div>
                            <div className="pulse-item">
                                <p className="metric-label">Passed</p>
                                <p className="metric-value">{props.passedCount}</p>
                            </div>
                        </div>
                        <div className="landing-inline-actions">
                            <button className="ghost-btn" onClick={props.onGoExplorer}>Explore Proposals</button>
                            <button className="ghost-btn" onClick={props.onGoNotifications}>Open Alerts</button>
                        </div>
                    </article>
                </div>
            </section>

            <section className="landing-section reveal-delay-3">
                <div className="landing-cta-band">
                    <div>
                        <p className="eyebrow">Ready for launch</p>
                        <h3>Deploy privacy-preserving voting for your next DAO cycle.</h3>
                    </div>
                    <div className="hero-actions">
                        <button className="primary-btn" onClick={props.walletConnected ? props.onGoHub : props.onConnectWallet}>
                            Enter DAO Hub
                        </button>
                        <button className="ghost-btn" onClick={props.onGoSupport}>View onboarding</button>
                    </div>
                </div>
            </section>

            <footer className="landing-footer reveal-delay-3">
                <div className="landing-footer-brand">
                    <span className="brand-token">ZK</span>
                    <div>
                        <p className="brand-title">Aegis DAO Protocol</p>
                        <p className="brand-subtitle">private voting orchestration</p>
                    </div>
                </div>

                <div className="landing-footer-links">
                    <button className="footer-link" onClick={props.onGoDocs}>Documentation</button>
                    <button className="footer-link" onClick={props.onGoResources}>Resources</button>
                    <button className="footer-link" onClick={props.onGoSupport}>Support</button>
                </div>

                <p className="landing-footer-note">Zero-knowledge governance stack for modern DAOs.</p>
            </footer>
        </section>
    );
}
