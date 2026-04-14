import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Spline from "@splinetool/react-spline";

interface LandingHeroProps {
    walletConnected: boolean;
    onConnectWallet: () => void;
    onGoDocs: () => void;
    onGoResources: () => void;
    onGoExplorer: () => void;
    onGoSupport: () => void;
}

const sentence = "Private DAO voting, simplified.";

const letterVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
};

export function LandingHero(props: LandingHeroProps) {
    return (
        <section className="aegis-section aegis-hero" style={{ height: "100vh" }}>
            {/* Spline 3D Integration */}
            <div
                aria-hidden="true"
                style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: "70%",
                    height: "100%",
                    zIndex: 0,
                    transition: "opacity 1s ease",
                    pointerEvents: "none"
                }}
            >
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to right, #0A0A0A 0%, transparent 40%, transparent 80%, #0A0A0A 100%)",
                    zIndex: 1,
                    pointerEvents: "none"
                }} />
                <div style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to bottom, #0A0A0A 0%, transparent 20%, transparent 80%, #0A0A0A 100%)",
                    zIndex: 1,
                    pointerEvents: "none"
                }} />
                <div style={{ width: "100%", height: "100%", pointerEvents: "auto" }}>
                    <Spline scene="https://prod.spline.design/r4UOuPJ1RfChiRHU/scene.splinecode" />
                </div>
            </div>

            {/* Glowing Accent Orbs */}
            <div style={{ position: "fixed", top: "10%", right: "30%", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(255, 122, 0, 0.15) 0%, transparent 60%)", filter: "blur(60px)", zIndex: 0, pointerEvents: "none" }} />

            {/* Navigation Header */}
            <header className="aegis-nav">
                <div className="aegis-logo" style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <img 
                        src="/aegon-logo.png" 
                        alt="Aegon Logo" 
                        style={{ height: "64px", objectFit: "contain", transform: "scale(1.4)" }} 
                    />
                    <span style={{ fontSize: "1.4rem", letterSpacing: "0.05em", fontWeight: 800, color: "#FFFFFF", marginLeft: "0.5rem" }}>AEGON</span>
                </div>
                <nav className="aegis-nav-links">
                    <button onClick={props.onGoDocs}>Docs</button>
                    <button onClick={props.onGoResources}>Resources</button>
                    <button onClick={() => window.open("https://github.com/Shubham-Singh-Shoora/Aegon", "_blank")}>GitHub</button>
                    <button className="aegis-btn-ghost" onClick={props.onGoSupport}>Book Support</button>
                </nav>
            </header>

            {/* Hero Content */}
            <div className="aegis-container" style={{ position: "relative", zIndex: 10, alignSelf: "center", display: "flex", flexDirection: "column", justifyContent: "center", height: "100%" }}>
                <div style={{ maxWidth: "800px" }}>
                    <motion.h1
                        className="aegis-heading"
                        initial="hidden"
                        animate="visible"
                        variants={{
                            visible: {
                                transition: {
                                    staggerChildren: 0.03,
                                }
                            }
                        }}
                    >
                        {sentence.split("").map((char, index) => (
                            <motion.span key={char + "-" + index} variants={letterVariants} style={{ display: "inline-block" }}>
                                {char === " " ? "\u00A0" : char}
                            </motion.span>
                        ))}
                    </motion.h1>

                    <motion.p
                        className="aegis-subheading"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 0.8 }}
                    >
                        Private eligibility, gasless relays, auditable settlement.
                    </motion.p>

                    <motion.div
                        style={{ marginTop: "3rem", display: "flex", gap: "1rem" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 0.8 }}
                    >
                        <button className="aegis-btn-primary" onClick={props.onConnectWallet}>
                            Connect Wallet <ArrowRight size={16} />
                        </button>
                        <button className="aegis-btn-outline" onClick={props.onGoExplorer}>
                            Open Explorer
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
