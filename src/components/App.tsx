import { observer } from "mobx-react";

import { Component } from "react";

import { LocationBarParser } from "../helpers/LocationBarParser";
import { AppStore } from "../stores/AppStore";

import { CurrentUsage } from "./CurrentUsage";
import { RecentUsageGraphs } from "./RecentUsageGraphs";
import { UsageGraphs } from "./UsageGraphs";
import { ActualReadings } from "./ActualReadings";
import { LiveData } from "../models/LiveData";
// import {RunningUsage} from './RunningUsage';

type Props = {
    store: AppStore;
};

const App = observer(
    class App extends Component<Props> {
        timer: any | null = null;

        render() {
            const { dataProvider, liveData, loadingState, showRecentUsage } = this.props.store;

            // <RunningUsage store={runningUsageStore} />
            // Apparently, Chart.js doesn't understand 'height' and 'maxHeight' correctly, but only handles 'width' and 'max-width'.
            // The maxWidth here corresponds to filling a single screen (vertically) on my laptop.
            return (
                <div className="container" style={{ maxWidth: "500px" }}>
                    <div className="row">{this.renderLiveData(liveData)}</div>
                    <div className="row">
                        {showRecentUsage ? (
                            <div>
                                <RecentUsageGraphs />
                            </div>
                        ) : (
                            <UsageGraphs
                                loadingState={loadingState}
                                dataProvider={dataProvider!}
                                periodSelected={this.props.store.periodSelected}
                            />
                        )}
                    </div>
                    {!showRecentUsage && (
                        <div className="row">
                            {liveData !== "Error" && liveData !== "Loading" && (
                                <ActualReadings
                                    stroom_dal={liveData.stroom_dal}
                                    stroom_piek={liveData.stroom_piek}
                                    gas={liveData.gas}
                                />
                            )}
                        </div>
                    )}
                </div>
            );
        }

        componentDidMount() {
            this.selectPeriodFromLocationBar();

            window.onpopstate = (event: PopStateEvent) => {
                if (event.state.period) {
                    this.props.store.periodSelected(event.state.period, true);
                }
            };

            this.startLiveDataTimer();
        }

        componentWillUnmount() {
            this.stopLiveDataTimer();
        }

        renderLiveData(liveData: LiveData | "Error" | "Loading") {
            if (liveData === "Loading") {
                return "Loading LiveData";
            } else if (liveData === "Error") {
                return "Error loading LiveData";
            }

            return <CurrentUsage liveData={liveData} onClick={this.currentUsageClicked} />;
        }

        selectPeriodFromLocationBar() {
            const locationBarParser = new LocationBarParser();

            const period = locationBarParser.parse(window.location.pathname);

            this.props.store.periodSelected(period, false);
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

            switch (response.status) {
                case 200:
                    const json = await response.json();

                    store.setLiveData({
                        id: json.id,
                        current: json.current,
                        gas: json.gas,
                        stroom_dal: json.stroom_dal,
                        stroom_piek: json.stroom_piek,
                        water_current: json.water_current,
                        water_current_period_in_seconds: json.water_current_period_in_seconds,
                        last_water_ticks: json.last_water_ticks.map((str: string) => new Date(str))
                    });
                    break;
                case 401:
                    store.setLiveData("Error");
                    break;
                case 404:
                    store.setLiveData("Error");
                    break;
                default:
                    store.setLiveData("Error");
                    break;
            }
        };

        currentUsageClicked = () => {
            this.props.store.showRecentUsage = !this.props.store.showRecentUsage;
        };
    }
);

export { App };
