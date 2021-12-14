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
    onTitleClick: () => void;
};

const UsageGraphs = observer(({ loadingState, periodSelected, dataProvider, onTitleClick }: IProps) => {
    const onSelect = (periodDescription: PeriodDescription, skipPushState = false) => {
        periodSelected(periodDescription, skipPushState);
    };

    // TODO: Will this work correctly? I think so.
    const enabled = loadingState === LoadingState.Loaded;

    if (loadingState === LoadingState.Loaded) {
        const { periodDescription } = dataProvider;

        return (
            <>
                <h2 onClick={onTitleClick}>{periodDescription.toTitle()}</h2>

                <PeriodUsageDisplay dataProvider={dataProvider} onSelect={onSelect} enabled={enabled} />

                <NavigationButtons periodDescription={periodDescription} onSelect={onSelect} enabled={enabled} />
            </>
        );
    }

    return null;
});

export { UsageGraphs };
