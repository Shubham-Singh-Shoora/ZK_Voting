export function DocsPage() {
    return (
        <section className="page reveal">
            <div className="page-head">
                <h2>Protocol Documentation</h2>
                <p>Implementation notes and architecture snapshots for developers and auditors.</p>
            </div>

            <div className="docs-grid">
                <article className="panel reveal-delay-1">
                    <h3>Flow Overview</h3>
                    <p className="muted-copy">Connect wallet, verify identity, generate proof, relay gasless vote.</p>
                </article>
                <article className="panel reveal-delay-2">
                    <h3>Cryptographic Stack</h3>
                    <p className="muted-copy">Noir circuit, UltraHonk backend, on-chain verifier contract integration.</p>
                </article>
                <article className="panel reveal-delay-3">
                    <h3>Merkle Rounds</h3>
                    <p className="muted-copy">Round-specific roots separate proposer and voter eligibility groups.</p>
                </article>
            </div>
        </section>
    );
}
