import { Wallet } from "lucide-react";

interface UtilityStripProps {
    walletConnected: boolean;
    walletLabel: string;
    onWalletClick: () => void;
}

export function UtilityStrip(props: UtilityStripProps) {
    return (
        <header className="utility-strip">
            <div className="brand-lockup">
                <span className="brand-token">ZK</span>
                <div>
                    <p className="brand-title">Aegis DAO Protocol</p>
                    <p className="brand-subtitle">private voting orchestration</p>
                </div>
            </div>

            <button className="wallet-pill" onClick={props.onWalletClick}>
                <Wallet size={16} />
                {props.walletLabel}
            </button>
        </header>
    );
}
