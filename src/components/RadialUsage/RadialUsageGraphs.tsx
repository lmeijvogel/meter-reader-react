import { observer } from "mobx-react";
import React from "react";

import { UsageField } from "../../models/UsageData";
import { RadialUsageStore } from "../../stores/RadialUsageStore";
import { RadialGraph } from "./RadialGraph";
import { NavigationButtons } from "./NavigationButtons";
import { getDateOfISOWeek } from "../dateHelpers";

type Props = {
    store: RadialUsageStore;
    onTitleClick: () => void;
};

class RadialUsageDisplay extends React.Component<Props> {
    render() {
        const { store } = this.props;

        return (
            <div>
                <h2 onClick={this.props.onTitleClick}>{this.title()}</h2>
                {["gas", "stroom", "water"].map((fieldName) => (
                    <RadialGraph key={`radial_graph_${fieldName}`} store={store} fieldName={fieldName as UsageField} />
                ))}
                <NavigationButtons week={store.week} year={store.year} onSelect={store.periodSelected} />
            </div>
        );
    }

    componentDidMount() {
        this.props.store.fetchData();
    }

    private title(): string {
        const { year, week } = this.props.store;
        const dayInMs = 60 * 60 * 24 * 1000;

        const startDay = getDateOfISOWeek(year, week);
        const endDay = new Date();

        endDay.setTime(startDay.getTime() + 6 * dayInMs);

        return `${this.formatDate(startDay)} - ${this.formatDate(endDay)}`;
    }

    private formatDate(date: Date): string {
        return `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    }
}

export const RadialUsage = observer(RadialUsageDisplay);
