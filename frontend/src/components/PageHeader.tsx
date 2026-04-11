import type { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    actions?: ReactNode;
}

export function PageHeader(props: PageHeaderProps) {
    return (
        <div className={`page-head ${props.actions ? "split" : ""}`}>
            <div>
                <h2>{props.title}</h2>
                <p>{props.subtitle}</p>
            </div>
            {props.actions}
        </div>
    );
}
