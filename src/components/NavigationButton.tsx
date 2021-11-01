interface IProps {
    enabled: boolean;
    label: string;

    onClick: () => void;
}

export const NavigationButton = ({ enabled, label, onClick }: IProps) => {
    return (
        <button onClick={onClick} disabled={!enabled} className="NavigationButton">
            {label}
        </button>
    );
};
