import { observer } from "mobx-react";

import { PeriodDescription } from "../models//PeriodDescription";
import { spreadData } from "../helpers/spreadData";
import { Graph } from "./Graph";
import { PeriodDataProvider } from "../models/PeriodDataProvider";

type Props = {
    dataProvider: PeriodDataProvider;
    enabled: boolean;
    onSelect: (period: PeriodDescription) => void;
};

const PeriodUsageDisplay = observer(({ dataProvider, enabled, onSelect }: Props) => {
    const onClick = (index: number): void => {
        if (dataProvider.canDrillDown) {
            onSelect(dataProvider.descriptionAt(index));
        }
    };

    if (!dataProvider) {
        return null;
    }

    const labels = dataProvider.labels();

    if (!dataProvider.periodUsage) {
        return <div>Loading</div>;
    }

    const data = spreadData(dataProvider.periodUsage, dataProvider.dataRange);

    return (
        <div className={"PeriodUsageDisplay" + (enabled ? "" : " disabled")}>
            <table>
                <thead>
                    <tr>
                        <th>Gas</th>
                        <th>Stroom</th>
                        <th>Water</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{dataProvider.totalUsage("gas").toFixed(3)}</td>
                        <td>{dataProvider.totalUsage("stroom_totaal").toFixed(3)}</td>
                        <td>{dataProvider.totalUsage("water")}</td>
                    </tr>
                </tbody>
            </table>
            <Graph
                label="Gas"
                labels={labels}
                data={data}
                maxY={dataProvider.maxGasY}
                fieldName="gas"
                color="#e73711"
                onClick={onClick}
                tooltipLabelBuilder={dataProvider.tooltipLabel}
            />
            <Graph
                label="Stroom"
                labels={labels}
                data={data}
                maxY={dataProvider.maxStroomY}
                fieldName="stroom_totaal"
                color="#f0ad4e"
                onClick={onClick}
                tooltipLabelBuilder={dataProvider.tooltipLabel}
            />
            <Graph
                label="Water"
                labels={labels}
                data={data}
                maxY={dataProvider.maxWaterY}
                fieldName="water"
                color="#428bca"
                onClick={onClick}
                tooltipLabelBuilder={dataProvider.tooltipLabel}
            />
        </div>
    );
});

export { PeriodUsageDisplay };
