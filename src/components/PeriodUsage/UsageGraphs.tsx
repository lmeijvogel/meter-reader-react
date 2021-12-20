import { observer } from "mobx-react";

import { PeriodDescription } from "../../models/PeriodDescription";

import { NavigationButtons } from "./NavigationButtons";
import { PeriodUsageDisplay } from "./PeriodUsageDisplay";
import { LoadingState, PeriodUsageStore } from "../../stores/PeriodUsageStore";
import { useEffect } from "react";

type IProps = {
    store: PeriodUsageStore;
    onTitleClick: (periodDescription: PeriodDescription) => void;
};

const UsageGraphs = observer(({ store, onTitleClick }: IProps) => {
    const { loadingState, dataProvider, setPeriodDescription } = store;

    useEffect(() => {
        store.initializeIfNecessary();
    }, [store]);

    // TODO: Not inlined below yet since we probably want to change the URL as well
    const onSelect = (periodDescription: PeriodDescription) => {
        setPeriodDescription(periodDescription);
    };

    // TODO: Will this work correctly? I think so.
    const enabled = loadingState === LoadingState.Loaded;

    if (loadingState === LoadingState.Loaded && !!dataProvider) {
        const { periodDescription } = dataProvider;

        const onClick = () => onTitleClick(periodDescription);

        return (
            <>
                <h2 onClick={onClick}>{periodDescription.toTitle()}</h2>

                <PeriodUsageDisplay dataProvider={dataProvider} onSelect={onSelect} enabled={enabled} />

                <NavigationButtons periodDescription={periodDescription} onSelect={onSelect} enabled={enabled} />
            </>
        );
    }

    return null;
});

export { UsageGraphs };
