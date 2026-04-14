import { Wallet } from "lucide-react";
import { DOCK_ITEMS } from "../../config/appConfig";
import type { ViewState } from "../../types";

interface UtilityStripProps {
    view: ViewState;
    walletConnected: boolean;
    walletLabel: string;
    unreadNotifications: number;
    onSetView: (view: Exclude<ViewState, "PROPOSAL">) => void;
    onWalletClick: () => void;
}

export function UtilityStrip(props: UtilityStripProps) {
    const ctaLabel = props.walletConnected ? "Open Hub" : "Get Started";

    // Filter main functional links for the top nav. We exclude LANDING to save space since the brand logo goes home.
    const navItems = DOCK_ITEMS.filter((item) => item.key !== "LANDING" && item.key !== "SUPPORT" && item.key !== "RESOURCES");

    return (
        <header className="utility-strip">
            <div 
                className="brand-lockup" 
                style={{ cursor: "pointer" }}
                onClick={() => props.onSetView("LANDING")}
            >
                <img 
                    src="/aegon-logo.png" 
                    alt="Aegon Logo" 
                    style={{ height: "48px", objectFit: "contain", transform: "scale(1.4)", transformOrigin: "left center" }} 
                    onError={(e) => {
                        // Fallback text if the image is missing
                        (e.target as HTMLImageElement).style.display = 'none';
                        const fallbackToken = document.createElement('span');
                        fallbackToken.className = 'brand-token';
                        fallbackToken.innerText = 'AE';
                        (e.target as HTMLImageElement).parentElement?.prepend(fallbackToken);
                    }}
                />
                <div style={{ marginLeft: "0.4rem" }}>
                    <h1 className="brand-title" style={{ fontSize: "1.2rem", fontFamily: "var(--font-heading)", letterSpacing: "0.05em", color: "#FFFFFF", fontWeight: 800 }}>
                        AEGON
                    </h1>
                </div>
            </div>

            <nav className="navbar-links" style={{ gap: "1.5rem" }}>
                {navItems.map((item) => {
                    const disabled = Boolean(item.requiresWallet && !props.walletConnected);
                    const active = props.view === item.key;
                    return (
                        <button 
                            key={item.key}
                            className={`navbar-link ${active ? "active-nav" : ""}`} 
                            onClick={() => !disabled && props.onSetView(item.key)}
                            disabled={disabled}
                            style={{ 
                                color: active ? "#F76F32" : (disabled ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.7)"),
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                position: "relative"
                            }}
                        >
                            {item.label}
                            {item.key === "NOTIFICATIONS" && props.unreadNotifications > 0 && (
                                <span style={{
                                    background: "#F76F32",
                                    color: "#0A0A0A",
                                    borderRadius: "10px",
                                    padding: "0.1rem 0.4rem",
                                    fontSize: "0.65rem",
                                    fontWeight: "bold",
                                    marginLeft: "0.2rem"
                                }}>
                                    {props.unreadNotifications}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>

            <div className="navbar-actions">
                <button className="wallet-pill" onClick={props.onWalletClick} style={{ borderColor: props.walletConnected ? "#3ED7D7" : undefined }}>
                    <Wallet size={16} color={props.walletConnected ? "#3ED7D7" : undefined} />
                    {props.walletLabel}
                </button>
                <button 
                    className="primary-btn strip-cta" 
                    onClick={() => props.onSetView(props.walletConnected ? "HUB" : "VERIFY")}
                    style={{ background: "#F76F32", color: "#0A0A0A", fontWeight: "bold" }}
                >
                    {ctaLabel}
                </button>
            </div>
        </header>
    );
}
