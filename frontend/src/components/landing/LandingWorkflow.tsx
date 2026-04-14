import { ShieldCheck, Network, Cpu } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
    { id: 1, title: "ZK-Proof", icon: ShieldCheck },
    { id: 2, title: "Vote / relay", icon: Network },
    { id: 3, title: "Settle", icon: Cpu },
];

export function LandingWorkflow() {
    return (
        <section className="aegis-section">
            <div className="aegis-container" style={{ padding: "8rem 4rem" }}>
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                >
                    <h2 className="aegis-heading" style={{ fontSize: "clamp(2rem, 4vw, 4rem)" }}>
                        Private in,<br/>Verifiable out.
                    </h2>
                </motion.div>

                <div className="aegis-workflow-row">
                    {/* Connecting background line */}
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "4rem",
                        right: "4rem",
                        height: "1px",
                        background: "rgba(255, 255, 255, 0.1)",
                        zIndex: 0
                    }} />

                    {/* Glowing particle flowing through */}
                    <motion.div 
                        initial={{ left: "4rem" }}
                        animate={{ left: "calc(100% - 4rem)" }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        style={{
                            position: "absolute",
                            top: "calc(50% - 2px)",
                            width: "80px",
                            height: "4px",
                            background: "linear-gradient(90deg, transparent, #FF7A00, transparent)",
                            boxShadow: "0 0 20px #FF7A00",
                            zIndex: 1,
                            borderRadius: "4px"
                        }}
                    />

                    {steps.map((step, i) => {
                        const Icon = step.icon;
                        return (
                            <motion.div 
                                key={step.id}
                                className="aegis-workflow-step"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: i * 0.2 }}
                            >
                                <div style={{ 
                                    background: "#0A0A0A", 
                                    padding: "1rem", 
                                    alignSelf: "flex-start", 
                                    position: "relative", 
                                    zIndex: 2,
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "1.5rem"
                                }}>
                                    <div className="aegis-workflow-icon">
                                        <Icon size={28} />
                                    </div>
                                    <div>
                                        <span style={{ color: "#FF7A00", fontSize: "0.8rem", letterSpacing: "0.1em" }}>0{step.id}</span>
                                        <h3>{step.title}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
