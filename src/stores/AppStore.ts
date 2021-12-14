import { makeAutoObservable, runInAction } from "mobx";
import { LiveData } from "../models/LiveData";
import {
    PeriodDescription,
    YearDescription,
    MonthDescription,
    DayDescription,
    serializePeriodDescription,
    deserializePeriodDescription
} from "../models/PeriodDescription";
import { UsageData } from "../models/UsageData";
import { RunningUsageStore } from "./RunningUsageStore";
import { PeriodDataProvider } from "../models/PeriodDataProvider";
import { YearDataProvider } from "../models/YearDataProvider";
import { MonthDataProvider } from "../models/MonthDataProvider";
import { DayDataProvider } from "../models/DayDataProvider";
import { DisplayState } from "../lib/DisplayState";
import { createUrl } from "../helpers/LocationBarParser";

// Explicitly doesn't have a state 'Loading' since we're never checking for it anyway:
// If it is loading, it should still draw the data that is already present,
// otherwise the graphs will disappear and appear instead of animate.
export enum LoadingState {
    NotLoaded = 0,
    Loaded,
    ErrorLoading
}

export class AppStore {
    liveData: LiveData | "Loading" | "Error" = "Loading";
    loadingState: LoadingState = LoadingState.NotLoaded;
    displayState: DisplayState;
    dataProvider: PeriodDataProvider | null = null;

    runningUsageStore: RunningUsageStore = new RunningUsageStore();

    previousState: DisplayState | null = null;

    constructor() {
        makeAutoObservable(this);

        this.displayState = this.defaultState();
    }

    setLiveData(liveData: LiveData | "Loading" | "Error") {
        this.liveData = liveData;
    }

    stateSelected = (displayState: DisplayState, skipPushState = false) => {
        this.storePreviousState();

        const newLocation = createUrl(displayState);

        console.log("stateSelected", { skipPushState, displayState });
        if (!skipPushState) {
            window.history.pushState(this.serializedState(), newLocation, newLocation);
        }

        if (displayState.view === "period") {
            fetch("/api" + newLocation + ".json", { credentials: "include" })
                .then((response) => {
                    switch (response.status) {
                        case 200:
                            return response.json();
                        case 502:
                            throw new Error("Bad gateway");
                        default:
                            throw new Error(`Unexpected status ${response.status}`);
                    }
                })
                .then((json) => this.setData(displayState.period, json))
                .catch(() => this.setErrorState());
        } else {
            this.displayState = displayState;
        }
    };

    stateSelectedFromHistory(state: any) {
        const displayState = this.deserializeState(state);

        console.log("deserializeState", { displayState });
        this.stateSelected(displayState, true);
    }

    storePreviousState() {
        this.previousState = this.displayState;
    }

    previousStateSelected = () => {
        if (this.previousState) {
            this.stateSelected(this.previousState);
        } else {
            this.stateSelected(this.defaultState());
        }
    };

    defaultState(): DisplayState {
        const date = new Date();

        return {
            view: "period",
            period: new MonthDescription(date.getFullYear(), date.getMonth())
        };
    }

    private setData = (periodDescription: PeriodDescription, json: UsageData[]) => {
        runInAction(() => {
            this.displayState = {
                view: "period",
                period: periodDescription
            };

            this.dataProvider = this.buildDataProvider(periodDescription, json);
            this.loadingState = LoadingState.Loaded;
        });
    };

    private setErrorState = () => {
        this.dataProvider = null;

        this.loadingState = LoadingState.ErrorLoading;
    };

    private buildDataProvider(periodDescription: PeriodDescription, periodUsage: UsageData[]): PeriodDataProvider {
        if (periodDescription instanceof YearDescription) {
            return new YearDataProvider(periodDescription, periodUsage);
        }

        if (periodDescription instanceof MonthDescription) {
            return new MonthDataProvider(periodDescription, periodUsage);
        }

        if (periodDescription instanceof DayDescription) {
            return new DayDataProvider(periodDescription, periodUsage);
        }

        throw new Error(`Unexpected periodDescription type: ${periodDescription}`);
    }

    private serializedState(): any {
        const { displayState } = this;

        if (displayState.view === "period") {
            return {
                type: "period",
                periodDescription: serializePeriodDescription(displayState.period)
            };
        } else if (displayState.view === "recent") {
            return {
                type: "recent"
            };
        } else if (displayState.view === "radial") {
            return {
                type: "radial",
                year: displayState.year,
                week: displayState.week
            };
        }
    }

    private deserializeState(state: any): DisplayState {
        if (state.type === "period") {
            return {
                view: "period",
                period: deserializePeriodDescription(state.periodDescription)
            };
        } else if (state.type === "recent") {
            return {
                view: "recent"
            };
        } else if (state.type === "radial") {
            return {
                view: "radial",
                year: state.year,
                week: state.week
            };
        }

        // Invalid, but let's not crash
        return this.defaultState();
    }
}
