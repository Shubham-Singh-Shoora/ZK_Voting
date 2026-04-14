import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const DOCS_DATA = [
    {
        id: "flow",
        title: "Flow Overview",
        content: "Connect wallet, verify identity, generate proof, relay gasless vote. The system utilizes abstract architecture to hide complexity from the end user while ensuring absolute state privacy."
    },
    {
        id: "crypto",
        title: "Cryptographic Stack",
        content: "Built upon Noir circuits and the UltraHonk backend. The on-chain verifier contract integration allows the DAO to settle proposals instantly upon valid proof submission without revealing the voter."
    },
    {
        id: "merkle",
        title: "Merkle Rounds",
        content: "Round-specific root injections separate proposer and voter eligibility groups. Historical state is tracked dynamically ensuring double-voting is nullified at the cryptographic layer."
    }
];

export function DocsPage() {
    const [openId, setOpenId] = useState<string | null>(DOCS_DATA[0].id);

    return (
        <section className="page" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="page-head">
                <h2>Protocol Documentation</h2>
                <p>Implementation notes and architecture snapshots for developers and auditors.</p>
            </div>

            <div style={{ marginTop: "2rem" }}>
                {DOCS_DATA.map((item) => {
                    const isOpen = openId === item.id;
                    return (
                        <div key={item.id} className="aegon-list-row">
                            <button
                                onClick={() => setOpenId(isOpen ? null : item.id)}
                                style={{
                                    width: "100%",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    background: "none",
                                    border: "none",
                                    padding: "0.5rem 0",
                                    color: isOpen ? "#F76F32" : "#FFFFFF",
                                    fontSize: "1.1rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "color 0.2s ease"
                                }}
                            >
                                {item.title}
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
                                            paddingTop: "0.5rem", 
                                            paddingBottom: "1.5rem", 
                                            color: "rgba(255,255,255,0.7)", 
                                            lineHeight: 1.8 
                                        }}>
                                            {item.content}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
