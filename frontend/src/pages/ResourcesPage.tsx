import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

interface ResourcesPageProps {
    chainLabel: string;
}

export function ResourcesPage(props: ResourcesPageProps) {
    const resources = [
        { 
            label: "Vitalik on Collusion (MACI)", 
            value: "Foundational research mapping the requirement of Anti-Collusion infrastructure for DAOs.",
            link: "https://vitalik.eth.limo/general/2019/04/03/collusion.html"
        },
        { 
            label: "Aztec Privacy-First L2", 
            value: "Documentation on programmable ZK architectures handling fully obscured state trees.",
            link: "https://docs.aztec.network/"
        },
        { 
            label: "Relay Endpoint (Local)", 
            value: "POST /api/relay/vote on localhost:3000",
            link: null
        },
        { 
            label: "Prover Network Map", 
            value: "Rust WebSocket telemetry actively listening on port 8080.",
            link: null
        }
    ];

    return (
        <section className="page" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="page-head">
                <h2>Resources & Research</h2>
                <p>Curated literature on ZK governance, alongside runtime endpoints for local development.</p>
            </div>

            <div style={{ marginTop: "2rem" }}>
                {resources.map((item, index) => (
                    <motion.div 
                        key={item.label}
                        className="aegon-list-row"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
                    >
                        <h4 style={{ margin: 0, color: "#3ED7D7", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {item.label}
                        </h4>
                        <p style={{ margin: 0, color: "#FFFFFF", fontSize: "1.05rem", fontWeight: 500 }}>
                            {item.value}
                        </p>
                        {item.link && (
                            <a 
                                href={item.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", color: "#F76F32", textDecoration: "none", marginTop: "0.2rem", fontWeight: "bold" }}
                            >
                                Read Research <ExternalLink size={14} />
                            </a>
                        )}
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
