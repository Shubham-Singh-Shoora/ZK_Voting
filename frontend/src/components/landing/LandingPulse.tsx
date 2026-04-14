import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface LandingPulseProps {
    chainLabel: string;
    activeCount: number;
    onGoExplorer: () => void;
}

export function LandingPulse(props: LandingPulseProps) {
    const [displayCount, setDisplayCount] = useState(0);

    // Simple upward tick animation for visual effect on load
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDisplayCount(props.activeCount);
        }, 500);
        return () => clearTimeout(timeout);
    }, [props.activeCount]);

    return (
        <section className="aegis-section" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            {/* Background Stream Animation */}
            <div className="aegis-stream-bg">
                <motion.div 
                    initial={{ y: "0%" }}
                    animate={{ y: "-50%" }}
                    transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                    style={{
                        width: "100%",
                        height: "200%",
                        background: "repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255, 122, 0, 0.03) 40px, rgba(255, 122, 0, 0.03) 80px)",
                    }}
                />
            </div>

            <div className="aegis-container" style={{ textAlign: "center", position: "relative", zIndex: 10 }}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <p style={{ color: "rgba(255,255,255,0.4)", letterSpacing: "0.2em", fontSize: "0.85rem", textTransform: "uppercase" }}>
                        Live Protocol Flow
                    </p>
                    
                    <div style={{ margin: "4rem 0" }}>
                        <motion.div 
                            className="aegis-live-counter"
                            animate={{ opacity: [0.8, 1, 0.8] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            {displayCount}
                        </motion.div>
                        <p style={{ fontSize: "1.2rem", color: "rgba(255,255,255,0.6)", marginTop: "1rem" }}>
                            Active Proposals
                        </p>
                    </div>

                    <div className="aegis-network-label">
                        {props.chainLabel}
                    </div>

                    <div style={{ marginTop: "3rem" }}>
                        <button className="aegis-btn-ghost" onClick={props.onGoExplorer}>
                            Open Live Explorer
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
