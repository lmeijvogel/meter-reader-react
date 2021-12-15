import * as ReactDOM from "react-dom";

import { App } from "./components/App";
import { LiveDataStore } from "./stores/LiveDataStore";
import { PeriodUsageStore } from "./stores/PeriodUsageStore";
import { RadialUsageStore } from "./stores/RadialUsageStore";
import { RunningUsageStore } from "./stores/RunningUsageStore";

// Importing these here will include them on the resulting page
/* eslint-disable */
const energieStyles = require("./styles/energie.css");
const mainStyles = require("./styles/main.css");
const milligramStyles = require("./styles/milligram.min.css");
/* eslint-enable */

const appContainer = document.querySelector("#root");

const periodUsageStore = new PeriodUsageStore();
const runningUsageStore = new RunningUsageStore();
const radialUsageStore = new RadialUsageStore();
const liveDataStore = new LiveDataStore();

ReactDOM.render(
    <App
        periodUsageStore={periodUsageStore}
        runningUsageStore={runningUsageStore}
        radialUsageStore={radialUsageStore}
        liveDataStore={liveDataStore}
    />,
    appContainer
);
