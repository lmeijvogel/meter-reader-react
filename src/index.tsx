import * as ReactDOM from "react-dom";

import { App } from "./components/App";
import { AppStore } from "./stores/AppStore";

// Importing these here will include them on the resulting page
/* eslint-disable */
const energieStyles = require("./styles/energie.css");
const mainStyles = require("./styles/main.css");
const milligramStyles = require("./styles/milligram.min.css");
/* eslint-enable */

const appContainer = document.querySelector("#root");

const appStore = new AppStore();

ReactDOM.render(<App store={appStore} />, appContainer);
