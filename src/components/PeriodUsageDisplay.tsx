import { observer } from "mobx-react";

import { PeriodDescription } from "../models//PeriodDescription";
import { spreadData } from "../helpers/spreadData";
import { Graph } from "./Graph";
import { PeriodDataProvider } from "../models/PeriodDataProvider";
import { Color } from "../lib/Colors";

export type GraphXOffset = "on_value" | "between_values";

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

    if (!dataProvider.periodUsage) {
        return <div>Loading</div>;
    }

    const data = spreadData(dataProvider.periodUsage, dataProvider.dataRange);

    return (
        <div className={"periodUsageDisplay" + (enabled ? "" : " disabled")}>
            <Graph
                label="Gas"
                data={data}
                maxY={dataProvider.maxGasY}
                fieldName="gas"
                color={Color.gas}
                colorIntense={Color.gasIntense}
                onClick={onClick}
                tooltipLabelBuilder={dataProvider.tooltipLabel}
                xOffset={dataProvider.periodDescription.xOffset}
            />
            <Graph
                label="Stroom"
                data={data}
                maxY={dataProvider.maxStroomY}
                fieldName="stroom"
                color={Color.stroom}
                colorIntense={Color.stroomIntense}
                onClick={onClick}
                tooltipLabelBuilder={dataProvider.tooltipLabel}
                xOffset={dataProvider.periodDescription.xOffset}
            />
            <Graph
                label="Water"
                data={data}
                maxY={dataProvider.maxWaterY}
                fieldName="water"
                color={Color.water}
                colorIntense={Color.waterIntense}
                onClick={onClick}
                tooltipLabelBuilder={dataProvider.tooltipLabel}
                xOffset={dataProvider.periodDescription.xOffset}
            />
        </div>
    );
});

export { PeriodUsageDisplay };
