import { Bell, BellRing, MailCheck, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
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

const listVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
};

export function NotificationsPage(props: NotificationsPageProps) {
    return (
        <section className="page" style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <PageHeader
                title="Notifications"
                subtitle="Deadlines, proposal outcomes, and activity events in one operational feed."
                actions={(
                    <div className="button-row">
                        <motion.button className="ghost-btn" onClick={props.onMarkAllRead} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                            <MailCheck size={16} /> Mark all read
                        </motion.button>
                        <motion.button className="ghost-btn" onClick={props.onClearRead} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                            <Trash2 size={16} /> Clear read
                        </motion.button>
                    </div>
                )}
            />

            <div className="insight-grid">
                <StatPanel label="Unread" value={props.unreadNotifications} />
                <StatPanel label="Total Alerts" value={props.notifications.length} highlightColor="#F76F32" />
                <StatPanel label="Active Proposals" value={props.activeCount} />
                <StatPanel label="Session Events" value={props.activityLogLength} />
            </div>

            <div className="panel">
                <h3>Alert Feed</h3>
                {props.notifications.length === 0 ? (
                    <p className="muted-copy">No alerts right now. Refresh DAO state to check for updates.</p>
                ) : (
                    <motion.div className="notification-stack" variants={listVariants} initial="hidden" animate="visible">
                        {props.notifications.map((notification) => (
                            <motion.article
                                variants={itemVariants}
                                key={notification.id}
                                className={`notification-item ${notification.priority} ${notification.isRead ? "read" : "unread"}`}
                            >
                                <div>
                                    <div className="notification-title-row">
                                        {notification.priority === "warn" ? <BellRing size={16} color="#F76F32" /> : <Bell size={16} color="#3ED7D7" />}
                                        <p className="timeline-title" style={{ color: notification.priority === "warn" ? "#F76F32" : "#FFFFFF" }}>{notification.title}</p>
                                        <span className="badge subtle">{notification.category}</span>
                                    </div>
                                    <p className="muted-copy">{notification.detail}</p>
                                    <p className="notification-meta">{notification.timestamp}</p>
                                </div>

                                <div className="notification-actions">
                                    {typeof notification.proposalId === "number" && (
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                            className="ghost-btn compact-btn"
                                            onClick={() => {
                                                if (typeof notification.proposalId === "number") {
                                                    props.onOpenProposal(notification.proposalId);
                                                }
                                                props.onToggleRead(notification.id, true);
                                            }}
                                        >
                                            Open Proposal
                                        </motion.button>
                                    )}

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                        className="ghost-btn compact-btn"
                                        onClick={() => props.onToggleRead(notification.id, !notification.isRead)}
                                    >
                                        {notification.isRead ? "Mark Unread" : "Mark Read"}
                                    </motion.button>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}
