import { observer } from "mobx-react";
import { LiveDataStore } from "../stores/LiveDataStore";

interface IProps {
    store: LiveDataStore;
}

export const ActualReadings = observer(({ store }: IProps) => {
    const { liveData } = store;

    if (liveData === "Loading" || liveData === "Error") {
        return null;
    }

    const { stroom, gas } = liveData;

    return (
        <div>
            <h3>Meterstanden</h3>

            <table className="numeric-data">
                <thead>
                    <tr>
                        <th>Stroom (kWh)</th>
                        <th>
                            Gas (m<sup>3</sup>)
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{stroom}</td>
                        <td>{gas}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
});
