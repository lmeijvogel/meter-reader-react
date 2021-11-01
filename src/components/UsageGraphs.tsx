import { observer } from "mobx-react";

import { PeriodDataProvider } from "../models/PeriodDataProvider";
import { PeriodDescription } from "../models/PeriodDescription";

import { NavigationButtons } from "./NavigationButtons";
import { PeriodUsageDisplay } from "./PeriodUsageDisplay";
import { LoadingState } from "../stores/AppStore";

type IProps = {
    loadingState: LoadingState;
    periodSelected: (periodDescription: PeriodDescription, skipPushState: boolean) => void;
    dataProvider: PeriodDataProvider;
};

const UsageGraphs = observer(({ loadingState, periodSelected, dataProvider }: IProps) => {
    const onSelect = (periodDescription: PeriodDescription, skipPushState = false) => {
        periodSelected(periodDescription, skipPushState);
    };

    // TODO: Will thiw work correctly? I think so.
    const enabled = loadingState === LoadingState.Loaded;

    if (loadingState === LoadingState.Loaded) {
        const { periodDescription } = dataProvider;

        return (
            <div>
                <h2>{periodDescription.toTitle()}</h2>

                <PeriodUsageDisplay dataProvider={dataProvider} onSelect={onSelect} enabled={enabled} />

                <NavigationButtons periodDescription={periodDescription} onSelect={onSelect} enabled={enabled} />
            </div>
        );
    }

    return null;
});

export { UsageGraphs };
