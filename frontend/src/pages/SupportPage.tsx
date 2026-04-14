import type { FaqItem } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

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
        <section className="page" style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div className="page-head">
                <h2>Help and Support</h2>
                <p>Quick onboarding and troubleshooting for your governance workflow.</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem", marginTop: "2rem" }}>
                <article className="panel">
                    <h3>Quick Start Checklist</h3>
                    <div className="checklist-stack" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
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
                    <h3>Frequently Asked Questions</h3>
                    <div className="faq-stack" style={{ marginTop: "1.5rem" }}>
                        {props.faqItems.map((item) => {
                            const isOpen = props.openFaqId === item.id;

                            return (
                                <div key={item.id} className="aegon-list-row" style={{ padding: "0.5rem 0" }}>
                                    <button
                                        onClick={() => props.setOpenFaqId(isOpen ? "" : item.id)}
                                        style={{
                                            width: "100%",
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            background: "none",
                                            border: "none",
                                            padding: "0.8rem 0",
                                            color: isOpen ? "#F76F32" : "#FFFFFF",
                                            fontSize: "1rem",
                                            fontWeight: 600,
                                            cursor: "pointer",
                                            transition: "color 0.2s ease"
                                        }}
                                    >
                                        <span style={{ textAlign: "left" }}>{item.question}</span>
                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <ChevronDown size={20} />
                                        </motion.div>
                                    </button>
                                    
                                    <AnimatePresence>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                style={{ overflow: "hidden" }}
                                            >
                                                <p style={{ 
                                                    paddingBottom: "1rem", 
                                                    color: "rgba(255,255,255,0.7)", 
                                                    lineHeight: 1.6,
                                                    margin: 0
                                                }}>
                                                    {item.answer}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            );
                        })}
                    </div>
                </article>
            </div>
        </section>
    );
}
