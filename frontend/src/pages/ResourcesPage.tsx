import { motion } from "framer-motion";

interface ResourcesPageProps {
    chainLabel: string;
}

export function ResourcesPage(props: ResourcesPageProps) {
    const resources = [
        { label: "Relay Endpoint", value: "POST /api/relay/vote on localhost:3000" },
        { label: "Chain Integration", value: `${props.chainLabel} with deployed DAO and verifier contracts.` },
        { label: "Membership Inputs", value: "Email hash lookup maps identities to Merkle witness secrets." },
        { label: "Prover Network", value: "Rust WebSocket telemetry actively listening on port 8080." }
    ];

    return (
        <section className="page" style={{ maxWidth: "800px", margin: "0 auto" }}>
            <div className="page-head">
                <h2>Resources</h2>
                <p>Runtime endpoints and integration references for local development.</p>
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
                        <h4 style={{ margin: 0, color: "#3ED7D7", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {item.label}
                        </h4>
                        <p style={{ margin: 0, color: "#FFFFFF", fontSize: "1.05rem", fontWeight: 500 }}>
                            {item.value}
                        </p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
