import { useEffect, useState } from "react";

import { CurrentUsage } from "./CurrentUsage";
import { RecentUsageGraphs } from "./RecentUsageGraphs";
import { UsageGraphs } from "./UsageGraphs";
import { ActualReadings } from "./ActualReadings";
import { RadialUsage } from "./RadialUsage/RadialUsageGraphs";
import { PeriodDescription } from "../models/PeriodDescription";
import { PeriodUsageStore } from "../stores/PeriodUsageStore";
import { RadialUsageStore } from "../stores/RadialUsageStore";
import { LiveDataStore } from "../stores/LiveDataStore";

type Props = {
    periodUsageStore: PeriodUsageStore;
    radialUsageStore: RadialUsageStore;
    liveDataStore: LiveDataStore;
};

type CurrentView = "period" | "recent" | "radial";

const App = ({ liveDataStore, periodUsageStore, radialUsageStore }: Props) => {
    const [currentView, setCurrentView] = useState<CurrentView>("period");

    useEffect(() => {
        liveDataStore.startTimer();

        return () => liveDataStore.stopTimer();
    }, [liveDataStore]);

    const currentUsageClicked = () => {
        if (currentView === "recent") {
            setCurrentView("period");
        } else {
            setCurrentView("recent");
        }
    };

    const showRadialUsage = (periodDescription: PeriodDescription) => {
        const radialProps = radialUsageStore.getWeekAndYear(periodDescription.toDate());

        radialUsageStore.periodSelected(radialProps);

        setCurrentView("radial");
    };

    const closeRadialUsage = () => {
        setCurrentView("period");
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
};

export { App };
