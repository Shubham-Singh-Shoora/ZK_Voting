import { Fingerprint, LockKeyhole, ShieldCheck } from "lucide-react";

const corePillars = [
    {
        title: "Private Eligibility",
        copy: "Members prove access without exposing identity.",
        icon: Fingerprint,
    },
    {
        title: "Sybil Resistance",
        copy: "Nullifiers ensure one member, one vote.",
        icon: ShieldCheck,
    },
    {
        title: "Verifiable Outcomes",
        copy: "Results are finalized on-chain for public auditability.",
        icon: LockKeyhole,
    },
];

export function LandingProjectStory() {
    return (
        <section className="helix-section" id="project-story">
            <div className="helix-head reveal">
                <p>WHAT IS AEGIS?</p>
                <h2>Minimal private governance for modern DAOs.</h2>
            </div>

            <div className="helix-story">
                <article className="helix-story-copy reveal-delay-1">
                    <p>
                        Aegis combines local proof generation, gasless voting, and immutable settlement in one clean flow.
                    </p>
                </article>

                <div className="helix-card-grid helix-card-grid-3">
                    {corePillars.map((pillar) => {
                        const Icon = pillar.icon;
                        return (
                            <article className="helix-card reveal-delay-1" key={pillar.title}>
                                <div className="helix-icon">
                                    <Icon size={20} />
                                </div>
                                <h3>{pillar.title}</h3>
                                <p>{pillar.copy}</p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
