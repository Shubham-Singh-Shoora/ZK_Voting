import { CheckCircle2 } from "lucide-react";

interface VerifyPageProps {
    verifyEmail: string;
    setVerifyEmail: (value: string) => void;
    myRole: string;
    mySecret: bigint | null;
    isProposerRole: boolean;
    isLoading: boolean;
    onVerifyEligibility: () => void;
    onRegisterAsProposer: () => void;
    onGoHub: () => void;
}

export function VerifyPage(props: VerifyPageProps) {
    return (
        <section className="page reveal">
            <div className="page-head">
                <h2>Identity Verification</h2>
                <p>Verify your eligibility using email hashing and unlock your secret witness locally.</p>
            </div>

            <div className="panel">
                <label htmlFor="email" className="field-label">Registered Email</label>
                <div className="field-row">
                    <input
                        id="email"
                        type="email"
                        className="input"
                        placeholder="student1@iiitsonepat.ac.in"
                        value={props.verifyEmail}
                        onChange={(event) => props.setVerifyEmail(event.target.value)}
                    />
                    <button className="primary-btn" onClick={props.onVerifyEligibility}>Verify</button>
                </div>

                {props.myRole && props.myRole !== "Not Found" && (
                    <div className="status-block success-block">
                        <p className="status-title">
                            <CheckCircle2 size={18} /> {props.myRole}
                        </p>
                        <p className="status-copy">Secret witness is available only in this session.</p>
                        <p className="secret-box">{props.mySecret?.toString()}</p>
                        <div className="button-row">
                            {props.myRole.includes("Faculty") && !props.isProposerRole && (
                                <button className="primary-btn" disabled={props.isLoading} onClick={props.onRegisterAsProposer}>
                                    Register as Proposer
                                </button>
                            )}
                            <button className="ghost-btn" onClick={props.onGoHub}>Open DAO Hub</button>
                        </div>
                    </div>
                )}

                {props.myRole === "Not Found" && (
                    <div className="status-block error-block">
                        <p className="status-title">Eligibility not found</p>
                        <p className="status-copy">No voter/proposer record matches this email hash.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
