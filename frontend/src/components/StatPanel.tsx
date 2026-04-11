interface StatPanelProps {
    label: string;
    value: string | number;
}

export function StatPanel(props: StatPanelProps) {
    return (
        <article className="panel stat-panel">
            <p className="metric-label">{props.label}</p>
            <p className="metric-value">{props.value}</p>
        </article>
    );
}
