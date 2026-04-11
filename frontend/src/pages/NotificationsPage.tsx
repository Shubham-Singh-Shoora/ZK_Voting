import { Bell, BellRing, MailCheck, Trash2 } from "lucide-react";
import type { NotificationItem } from "../types";
import { PageHeader, StatPanel } from "../components";

interface NotificationsPageProps {
    unreadNotifications: number;
    notifications: NotificationItem[];
    activeCount: number;
    activityLogLength: number;
    onMarkAllRead: () => void;
    onClearRead: () => void;
    onOpenProposal: (proposalId: number) => void;
    onToggleRead: (id: string, nextRead: boolean) => void;
}

export function NotificationsPage(props: NotificationsPageProps) {
    return (
        <section className="page reveal">
            <PageHeader
                title="Notifications"
                subtitle="Deadlines, proposal outcomes, and activity events in one operational feed."
                actions={(
                    <div className="button-row">
                        <button className="ghost-btn" onClick={props.onMarkAllRead}>
                            <MailCheck size={16} /> Mark all read
                        </button>
                        <button className="ghost-btn" onClick={props.onClearRead}>
                            <Trash2 size={16} /> Clear read
                        </button>
                    </div>
                )}
            />

            <div className="insight-grid">
                <StatPanel label="Unread" value={props.unreadNotifications} />
                <StatPanel label="Total Alerts" value={props.notifications.length} />
                <StatPanel label="Active Proposals" value={props.activeCount} />
                <StatPanel label="Session Events" value={props.activityLogLength} />
            </div>

            <div className="panel">
                <h3>Alert Feed</h3>
                {props.notifications.length === 0 ? (
                    <p className="muted-copy">No alerts right now. Refresh DAO state to check for updates.</p>
                ) : (
                    <div className="notification-stack">
                        {props.notifications.map((notification) => (
                            <article
                                key={notification.id}
                                className={`notification-item ${notification.priority} ${notification.isRead ? "read" : "unread"}`}
                            >
                                <div>
                                    <div className="notification-title-row">
                                        {notification.priority === "warn" ? <BellRing size={16} /> : <Bell size={16} />}
                                        <p className="timeline-title">{notification.title}</p>
                                        <span className="badge subtle">{notification.category}</span>
                                    </div>
                                    <p className="muted-copy">{notification.detail}</p>
                                    <p className="notification-meta">{notification.timestamp}</p>
                                </div>

                                <div className="notification-actions">
                                    {typeof notification.proposalId === "number" && (
                                        <button
                                            className="ghost-btn compact-btn"
                                            onClick={() => {
                                                if (typeof notification.proposalId === "number") {
                                                    props.onOpenProposal(notification.proposalId);
                                                }
                                                props.onToggleRead(notification.id, true);
                                            }}
                                        >
                                            Open Proposal
                                        </button>
                                    )}

                                    <button
                                        className="ghost-btn compact-btn"
                                        onClick={() => props.onToggleRead(notification.id, !notification.isRead)}
                                    >
                                        {notification.isRead ? "Mark Unread" : "Mark Read"}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
