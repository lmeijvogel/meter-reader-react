import { observer } from "mobx-react";

import { Component } from "react";

import { AppStore } from "../stores/AppStore";

import { parseLocationBar } from "../helpers/LocationBarParser";
import { CurrentUsage } from "./CurrentUsage";
import { RecentUsageGraphs } from "./RecentUsageGraphs";
import { UsageGraphs } from "./UsageGraphs";
import { ActualReadings } from "./ActualReadings";
import { RadialUsage } from "./RadialUsage/RadialUsageGraphs";
import { RadialUsageStore } from "../stores/RadialUsageStore";
// import {RunningUsage} from './RunningUsage';

type Props = {
    store: AppStore;
    radialUsageStore: RadialUsageStore;
};

const App = observer(
    class App extends Component<Props> {
        timer: any | null = null;

        render() {
            const { dataProvider, displayState, liveData, loadingState } = this.props.store;

            // <RunningUsage store={runningUsageStore} />
            // Apparently, Chart.js doesn't understand 'height' and 'maxHeight' correctly, but only handles 'width' and 'max-width'.
            // The maxWidth here corresponds to filling a single screen (vertically) on my laptop.
            return (
                <div id="mainContainer">
                    <div>
                        <CurrentUsage liveData={liveData} onClick={this.currentUsageClicked} />
                    </div>
                    <div className="mainContent">
                        {displayState.view === "recent" ? (
                            <RecentUsageGraphs />
                        ) : displayState.view === "period" ? (
                            <UsageGraphs
                                loadingState={loadingState}
                                dataProvider={dataProvider!}
                                periodSelected={(period) =>
                                    this.props.store.stateSelected({ view: "period", period: period })
                                }
                                onTitleClick={this.showRadialUsage}
                            />
                        ) : (
                            <RadialUsage store={this.props.radialUsageStore} onTitleClick={this.closeRadialUsage} />
                        )}
                    </div>
                    {displayState.view === "period" && liveData !== "Error" && liveData !== "Loading" && (
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
            this.selectViewFromLocationBar();

            window.onpopstate = (event: PopStateEvent) => {
                console.log("onpopstate");
                if (event.state) {
                    this.props.store.stateSelectedFromHistory(event.state);
                }
            };

            this.startLiveDataTimer();
            this.retrieveLiveData();
        }

        componentWillUnmount() {
            this.stopLiveDataTimer();
        }

        selectViewFromLocationBar() {
            const displayState = parseLocationBar(window.location.pathname, this.props.store.defaultState());

            this.props.store.stateSelected(displayState, false);
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
            const currentType = this.props.store.displayState.view;

            if (currentType === "period") {
                this.props.store.stateSelected({ view: "recent" });
            } else {
                this.props.store.previousStateSelected();
            }
        };

        // TODO: Way too much dependence between RadialUsageStore and AppStore.
        showRadialUsage = () => {
            const { radialUsageStore } = this.props;

            const { displayState } = this.props.store;
            const radialProps =
                displayState.view === "period"
                    ? radialUsageStore.getWeekAndYear(displayState.period.toDate())
                    : radialUsageStore.defaultYearAndWeek();

            radialUsageStore.periodSelected(radialProps.week, radialProps.year);
            this.props.store.stateSelected({ view: "radial", ...radialProps });
        };

        closeRadialUsage = () => {
            this.props.store.previousStateSelected();
        };
    }
);

export { App };
