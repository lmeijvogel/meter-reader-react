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
        render() {
            const { currentView, liveDataStore, periodUsageStore, radialUsageStore } = this.props.store;

            return (
                <div id="mainContainer">
                    <div>
                        <CurrentUsage store={liveDataStore} onClick={this.currentUsageClicked} />
                    </div>
                    <div className="mainContent">
                        {currentView === "recent" ? (
                            <RecentUsageGraphs />
                        ) : currentView === "period" ? (
                            <>
                                <UsageGraphs store={periodUsageStore} onTitleClick={this.showRadialUsage} />
                                <ActualReadings store={liveDataStore} />
                            </>
                        ) : (
                            <RadialUsage store={radialUsageStore} onTitleClick={this.closeRadialUsage} />
                        )}
                    </div>
                </div>
            );
        }

        componentDidMount() {
            this.props.store.liveDataStore.startTimer();
        }

        componentWillUnmount() {
            this.props.store.liveDataStore.stopTimer();
        }

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
