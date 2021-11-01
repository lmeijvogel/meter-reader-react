import { observer } from "mobx-react";

import { PeriodDescription } from "../models//PeriodDescription";
import { DataShifter } from "../helpers/DataShifter";
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
    const dataShifter = new DataShifter();

    const data = dataShifter.call(dataProvider.periodUsage, dataProvider.positionInData);

    return (
        <div className={"PeriodUsageDisplay" + (enabled ? "" : " disabled")}>
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
