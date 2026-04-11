interface ResourcesPageProps {
    chainLabel: string;
}

export function ResourcesPage(props: ResourcesPageProps) {
    return (
        <section className="page reveal">
            <div className="page-head">
                <h2>Resources</h2>
                <p>Runtime endpoints and integration references for local development.</p>
            </div>

            <div className="docs-grid">
                <article className="panel reveal-delay-1">
                    <h3>Relay Endpoint</h3>
                    <p className="muted-copy">POST /api/relay/vote on localhost:3000</p>
                </article>
                <article className="panel reveal-delay-2">
                    <h3>Chain</h3>
                    <p className="muted-copy">{props.chainLabel} with deployed DAO and verifier contracts.</p>
                </article>
                <article className="panel reveal-delay-3">
                    <h3>Membership Inputs</h3>
                    <p className="muted-copy">Email hash lookup maps identities to Merkle witness secrets.</p>
                </article>
            </div>
        </section>
    );
}
