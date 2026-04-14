import { Building2, GraduationCap, Landmark, UsersRound } from "lucide-react";

const useCases = [
    {
        title: "Education Councils",
        detail: "Run faculty and student voting with confidential ballots and transparent outcomes.",
        icon: GraduationCap,
    },
    {
        title: "Protocol DAOs",
        detail: "Protect delegate privacy while maintaining deterministic, auditable governance execution.",
        icon: Landmark,
    },
    {
        title: "Community Foundations",
        detail: "Coordinate sensitive budget and policy decisions without social pressure bias.",
        icon: Building2,
    },
    {
        title: "Member Committees",
        detail: "Enable honest participation in high-context internal votes where anonymity matters.",
        icon: UsersRound,
    },
];

export function LandingUseCases() {
    return (
        <section className="helix-section" id="use-cases">
            <div className="helix-head reveal">
                <p>USE CASES</p>
                <h2>From protocol DAOs to academic councils, Aegis adapts to sensitive decisions.</h2>
            </div>

            <div className="helix-card-grid helix-card-grid-4">
                {useCases.map((useCase, index) => {
                    const Icon = useCase.icon;

                    return (
                        <article className={`helix-card reveal-delay-${Math.min(index + 1, 3)}`} key={useCase.title}>
                            <div className="helix-use-top">
                                <div className="helix-icon">
                                    <Icon size={20} />
                                </div>
                                <span className="helix-case-id">0{index + 1}</span>
                            </div>
                            <h3>{useCase.title}</h3>
                            <p>{useCase.detail}</p>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
