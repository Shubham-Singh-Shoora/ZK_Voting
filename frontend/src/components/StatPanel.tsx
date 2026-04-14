interface StatPanelProps {
    label: string;
    value: string | number;
    highlightColor?: string;
}

export function StatPanel(props: StatPanelProps) {
    return (
        <article className="panel stat-panel">
            <p className="metric-label" style={props.highlightColor ? { color: props.highlightColor } : undefined}>{props.label}</p>
            <p className="metric-value">{props.value}</p>
        </article>
    );
}
