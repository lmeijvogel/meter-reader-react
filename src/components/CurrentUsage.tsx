import { LiveData } from "../models/LiveData";

type Props = {
    liveData: LiveData | null;
    onClick: () => void;
};

export function CurrentUsage({ liveData, onClick }: Props) {
    return (
        <table className="column column-30" onClick={onClick}>
            <thead>
                <tr>
                    <th>Current</th>
                    <th>Water</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>{displayableCurrent()}</td>
                    <td>{displayableWater()}</td>
                </tr>
            </tbody>
        </table>
    );

    function displayableCurrent(): string {
        if (liveData) {
            return `${liveData.current * 1000} W`;
        } else {
            return "...";
        }
    }

    function displayableWater(): string {
        if (!liveData) {
            return "...";
        }

        return `${liveData.water_current} L/m`;
    }
}
