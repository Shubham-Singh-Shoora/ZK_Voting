import type { FaqItem } from "../types";

interface SupportPageProps {
    walletConnected: boolean;
    onConnectWallet: () => void;
    onGoVerify: () => void;
    onGoExplorer: () => void;
    faqItems: FaqItem[];
    openFaqId: string;
    setOpenFaqId: (id: string) => void;
}

export function SupportPage(props: SupportPageProps) {
    return (
        <section className="page reveal">
            <div className="page-head">
                <h2>Help and Support</h2>
                <p>Quick onboarding and troubleshooting for your governance workflow.</p>
            </div>

            <div className="support-grid">
                <article className="panel">
                    <h3>Quick Start Checklist</h3>
                    <div className="checklist-stack">
                        <button className="check-item" onClick={props.walletConnected ? props.onGoVerify : props.onConnectWallet}>
                            <span className="check-dot">1</span>
                            <div>
                                <p className="timeline-title">Connect Wallet</p>
                                <p className="muted-copy">Authenticate with MetaMask to unlock app functions.</p>
                            </div>
                        </button>
                        <button className="check-item" onClick={props.onGoVerify}>
                            <span className="check-dot">2</span>
                            <div>
                                <p className="timeline-title">Verify Eligibility</p>
                                <p className="muted-copy">Hash your registered email locally and unlock witness secret.</p>
                            </div>
                        </button>
                        <button className="check-item" onClick={props.onGoExplorer}>
                            <span className="check-dot">3</span>
                            <div>
                                <p className="timeline-title">Explore Proposals</p>
                                <p className="muted-copy">Find active rounds and open any proposal room to vote.</p>
                            </div>
                        </button>
                    </div>
                </article>

                <article className="panel">
                    <h3>FAQ</h3>
                    <div className="faq-stack">
                        {props.faqItems.map((item) => {
                            const isOpen = props.openFaqId === item.id;

                            return (
                                <button
                                    key={item.id}
                                    className={`faq-item ${isOpen ? "open" : ""}`}
                                    onClick={() => props.setOpenFaqId(isOpen ? "" : item.id)}
                                >
                                    <div className="faq-question-row">
                                        <p className="timeline-title">{item.question}</p>
                                        <span className="badge subtle">{isOpen ? "Open" : "Closed"}</span>
                                    </div>
                                    {isOpen && <p className="muted-copy faq-answer">{item.answer}</p>}
                                </button>
                            );
                        })}
                    </div>
                </article>
            </div>
        </section>
    );
}
