interface StatusToastProps {
    status: string;
    isLoading: boolean;
}

export function StatusToast(props: StatusToastProps) {
    if (!props.status) {
        return null;
    }

    return (
        <div className="toast">
            {props.isLoading && <span className="spinner" />}
            <span>{props.status}</span>
        </div>
    );
}
