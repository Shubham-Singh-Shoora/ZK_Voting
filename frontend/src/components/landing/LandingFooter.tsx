import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface LandingFooterProps {
    onGoHub: () => void;
    onGoDocs: () => void;
    onGoResources: () => void;
    onGoSupport: () => void;
}

export function LandingFooter(props: LandingFooterProps) {
    return (
        <section className="aegis-section" style={{ minHeight: "auto", padding: "6rem 0 2rem" }}>
            <div className="aegis-container">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    style={{ textAlign: "center", marginBottom: "8rem" }}
                >
                    <h2 className="aegis-heading" style={{ fontSize: "clamp(2.5rem, 5vw, 5rem)", marginBottom: "2.5rem" }}>
                        Start a private vote.
                    </h2>
                    <button className="aegis-btn-primary" onClick={props.onGoHub} style={{ padding: "1.2rem 2.5rem", fontSize: "1.2rem" }}>
                        Launch App <ArrowRight size={20} />
                    </button>
                </motion.div>

                <div className="aegis-footer-row" style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "2rem" }}>
                    <div>
                        <div className="aegis-logo">
                            <span>ZK</span> AEGIS
                        </div>
                        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                            Confidential voting infrastructure.
                        </p>
                    </div>

                    <nav className="aegis-nav-links" style={{ gap: "1.5rem" }}>
                        <button onClick={props.onGoDocs} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>Documentation</button>
                        <button onClick={props.onGoResources} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>Resources</button>
                        <button onClick={props.onGoSupport} style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)" }}>Support</button>
                    </nav>
                </div>
            </div>
        </section>
    );
}
