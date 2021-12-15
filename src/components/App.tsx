import { observer } from "mobx-react";

import { useEffect } from "react";

import { AppStore } from "../stores/AppStore";

import { CurrentUsage } from "./CurrentUsage";
import { RecentUsageGraphs } from "./RecentUsageGraphs";
import { UsageGraphs } from "./UsageGraphs";
import { ActualReadings } from "./ActualReadings";
import { RadialUsage } from "./RadialUsage/RadialUsageGraphs";
import { PeriodDescription } from "../models/PeriodDescription";

type Props = {
    store: AppStore;
};

const App = observer(({ store }: Props) => {
    const { currentView, liveDataStore, periodUsageStore, radialUsageStore } = store;

    useEffect(() => {
        liveDataStore.startTimer();

        return () => liveDataStore.stopTimer();
    }, [liveDataStore]);

    const currentUsageClicked = () => {
        if (currentView === "recent") {
            store.currentView = "period";
        } else {
            store.currentView = "recent";
        }
    };

    const showRadialUsage = (periodDescription: PeriodDescription) => {
        const radialProps = radialUsageStore.getWeekAndYear(periodDescription.toDate());

        radialUsageStore.periodSelected(radialProps);

        store.currentView = "radial";
    };

    const closeRadialUsage = () => {
        store.currentView = "period";
    };

    return (
        <div id="mainContainer">
            <div>
                <CurrentUsage store={liveDataStore} onClick={currentUsageClicked} />
            </div>
            <div className="mainContent">
                {currentView === "recent" ? (
                    <RecentUsageGraphs />
                ) : currentView === "period" ? (
                    <>
                        <UsageGraphs store={periodUsageStore} onTitleClick={showRadialUsage} />
                        <ActualReadings store={liveDataStore} />
                    </>
                ) : (
                    <RadialUsage store={radialUsageStore} onTitleClick={closeRadialUsage} />
                )}
            </div>
        </div>
    );
});

export { App };
