import * as React from "react";
import { observer } from "mobx-react";

import { PeriodDescription } from "../models//PeriodDescription";
import { DataShifter } from "../helpers/DataShifter";
import { Graph } from "./Graph";
import { PeriodDataProvider } from "../models/PeriodDataProvider";

export interface IPeriodUsageDisplayProps {
    dataProvider: PeriodDataProvider;
    enabled: boolean;
    onSelect: (period: PeriodDescription) => void;
}

const PeriodUsageDisplay = observer(
    class PeriodUsageDisplay extends React.Component<IPeriodUsageDisplayProps, {}> {
        render() {
            const { dataProvider } = this.props;

            if (!dataProvider) {
                return null;
            }

            const labels = dataProvider.labels();
            const dataShifter = new DataShifter();

            const data = dataShifter.call(dataProvider.periodUsage, dataProvider.positionInData);

            return (
                <div className={"PeriodUsageDisplay" + (this.props.enabled ? "" : " disabled")}>
                    <Graph
                        label="Gas"
                        labels={labels}
                        data={data}
                        maxY={dataProvider.maxGasY}
                        fieldName="gas"
                        color="#e73711"
                        onClick={this.onClick}
                        tooltipLabelBuilder={dataProvider.tooltipLabel}
                    />
                    <Graph
                        label="Stroom"
                        labels={labels}
                        data={data}
                        maxY={dataProvider.maxStroomY}
                        fieldName="stroom_totaal"
                        color="#f0ad4e"
                        onClick={this.onClick}
                        tooltipLabelBuilder={dataProvider.tooltipLabel}
                    />
                    <Graph
                        label="Water"
                        labels={labels}
                        data={data}
                        maxY={dataProvider.maxWaterY}
                        fieldName="water"
                        color="#428bca"
                        onClick={this.onClick}
                        tooltipLabelBuilder={dataProvider.tooltipLabel}
                    />
                </div>
            );
        }

        onClick = (index: number): void => {
            const { dataProvider } = this.props;

            if (dataProvider.canDrillDown) {
                this.props.onSelect(dataProvider.descriptionAt(index));
            }
        };
    }
);

export { PeriodUsageDisplay };
