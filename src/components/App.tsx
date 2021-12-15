import { observer } from "mobx-react";

import { Component } from "react";

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

const App = observer(
    class App extends Component<Props> {
        timer: any | null = null;

        render() {
            const { currentView, liveData, periodUsageStore, radialUsageStore } = this.props.store;

            return (
                <div id="mainContainer">
                    <div>
                        <CurrentUsage liveData={liveData} onClick={this.currentUsageClicked} />
                    </div>
                    <div className="mainContent">
                        {currentView === "recent" ? (
                            <RecentUsageGraphs />
                        ) : currentView === "period" ? (
                            <UsageGraphs store={periodUsageStore} onTitleClick={this.showRadialUsage} />
                        ) : (
                            <RadialUsage store={radialUsageStore} onTitleClick={this.closeRadialUsage} />
                        )}
                    </div>
                    {currentView === "period" && liveData !== "Error" && liveData !== "Loading" && (
                        <ActualReadings
                            stroom_dal={liveData.stroom_dal}
                            stroom_piek={liveData.stroom_piek}
                            gas={liveData.gas}
                        />
                    )}
                </div>
            );
        }

        componentDidMount() {
            this.startLiveDataTimer();
            this.retrieveLiveData();
        }

        componentWillUnmount() {
            this.stopLiveDataTimer();
        }

        startLiveDataTimer() {
            this.timer = setInterval(this.retrieveLiveData, 3000);
        }

        stopLiveDataTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }

        retrieveLiveData = async () => {
            const { store } = this.props;

            const response = await fetch("/api/energy/current", { credentials: "include" });

            try {
                switch (response.status) {
                    case 200:
                        const json = await response.json();

                        store.setLiveData({
                            id: json.id,
                            current: json.current,
                            gas: json.gas,
                            stroom_dal: json.stroom_dal,
                            stroom_piek: json.stroom_piek,
                            water_current: json.water_current
                        });
                        break;
                    case 401:
                    case 404:
                    default:
                        store.setLiveData("Error");
                        break;
                }
            } catch {
                store.setLiveData("Error");
            }
        };

        currentUsageClicked = () => {
            const { currentView } = this.props.store;

            if (currentView === "recent") {
                this.props.store.currentView = "period";
            } else {
                this.props.store.currentView = "recent";
            }
        };

        showRadialUsage = (periodDescription: PeriodDescription) => {
            const { radialUsageStore } = this.props.store;

            const radialProps = radialUsageStore.getWeekAndYear(periodDescription.toDate());

            radialUsageStore.periodSelected(radialProps);

            this.props.store.currentView = "radial";
        };

        closeRadialUsage = () => {
            this.props.store.currentView = "period";
        };
    }
);

export { App };
