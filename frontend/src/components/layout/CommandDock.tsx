import type { DockItem } from "../../config/appConfig";
import type { ViewState } from "../../types";

interface CommandDockProps {
    view: ViewState;
    items: DockItem[];
    walletConnected: boolean;
    unreadNotifications: number;
    onSetView: (view: Exclude<ViewState, "PROPOSAL">) => void;
}

export function CommandDock(props: CommandDockProps) {
    return (
        <div className="command-dock" role="tablist" aria-label="App sections">
            {props.items.map((item) => {
                const Icon = item.icon;
                const active = props.view === item.key;
                const disabled = Boolean(item.requiresWallet && !props.walletConnected);

                return (
                    <button
                        key={item.key}
                        className={`dock-btn ${active ? "active" : ""}`}
                        onClick={() => !disabled && props.onSetView(item.key)}
                        disabled={disabled}
                        title={disabled ? "Connect wallet first" : item.label}
                    >
                        <Icon size={16} />
                        <span>{item.label}</span>
                        {item.key === "NOTIFICATIONS" && props.unreadNotifications > 0 && (
                            <span className="dock-count">{props.unreadNotifications}</span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
