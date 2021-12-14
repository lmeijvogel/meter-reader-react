import * as ReactDOM from "react-dom";

import { App } from "./components/App";
import { getWeek, getWeekYear } from "./components/dateHelpers";
import { AppStore } from "./stores/AppStore";
import { RadialUsageStore } from "./stores/RadialUsageStore";

// Importing these here will include them on the resulting page
/* eslint-disable */
const energieStyles = require("./styles/energie.css");
const mainStyles = require("./styles/main.css");
const milligramStyles = require("./styles/milligram.min.css");
/* eslint-enable */

const appContainer = document.querySelector("#root");

const appStore = new AppStore();

const today = new Date();
const radialYear = getWeekYear(today);
const radialWeek = getWeek(today);

const radialUsageStore = new RadialUsageStore(radialWeek, radialYear);

ReactDOM.render(<App store={appStore} radialUsageStore={radialUsageStore} />, appContainer);
