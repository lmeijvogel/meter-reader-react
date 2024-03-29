import { observer } from "mobx-react";

import { spreadData } from "../../helpers/spreadData";
import { Color } from "../../lib/Colors";
import { PeriodDescription } from "../../models//PeriodDescription";
import { PeriodDataProvider } from "../../models/PeriodDataProvider";
import { Graph } from "./Graph";

type Props = {
    dataProvider: PeriodDataProvider;
    enabled: boolean;
    onSelect: (period: PeriodDescription) => void;
};

export const Graphs = observer(({ dataProvider, enabled, onSelect }: Props) => {
    const onClick = (index: number): void => {
        if (dataProvider.canDrillDown) {
            onSelect(dataProvider.descriptionAt(index));
        }
    };

    const data = spreadData(dataProvider.periodUsage, dataProvider.dataRange);

    const { periodDescription } = dataProvider;

    return (
        <div className={"periodUsageDisplay" + (enabled ? "" : " disabled")}>
            <Graph
                label="Gas"
                periodDescription={periodDescription}
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
                periodDescription={periodDescription}
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
                periodDescription={periodDescription}
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
