import { observer } from "mobx-react";

import * as React from "react";

const RunningUsage = observer(
    class RunningUsage extends React.Component {
        // @observable store: RunningUsageStore;

        constructor() {
            super({});
            // this.store = new RunningUsageStore();
        }

        componentDidMount() {
            // this.store.retrieveState();
        }

        render() {
            return null;
            // switch (this.store.monitoringState) {
            // case MonitoringState.Unknown:
            // return <div>Loading Running Usage Monitor</div>;
            // case MonitoringState.NotMonitoring:
            // return <div>Add a button here!</div>;
            // case MonitoringState.Monitoring:
            // return <div>Monitoring</div>;
            // }
        }
    }
);

export { RunningUsage };
