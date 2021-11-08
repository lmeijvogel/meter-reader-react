import { makeAutoObservable } from "mobx";
import { LiveData } from "../models/LiveData";
import { PeriodDescription, YearDescription, MonthDescription, DayDescription } from "../models/PeriodDescription";
import { UsageData } from "../models/UsageData";
import { RunningUsageStore } from "./RunningUsageStore";
import { PeriodDataProvider } from "../models/PeriodDataProvider";
import { YearDataProvider } from "../models/YearDataProvider";
import { MonthDataProvider } from "../models/MonthDataProvider";
import { DayDataProvider } from "../models/DayDataProvider";

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
    dataProvider: PeriodDataProvider | null = null;
    loadingState: LoadingState = LoadingState.NotLoaded;
    showRecentUsage: boolean = false;

    runningUsageStore: RunningUsageStore = new RunningUsageStore();

    constructor() {
        makeAutoObservable(this);
    }

    setLiveData(liveData: LiveData | "Loading" | "Error") {
        this.liveData = liveData;
    }

    periodSelected = (periodDescription: PeriodDescription, skipPushState = false) => {
        const newLocation = periodDescription.toUrl();

        if (!skipPushState) {
            window.history.pushState({ periodDescription: periodDescription }, newLocation, newLocation);
        }

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
            .then((json) => this.setData(periodDescription, json))
            .catch(() => this.setErrorState());
    };

    private setData = (periodDescription: PeriodDescription, json: UsageData[]) => {
        this.dataProvider = this.buildDataProvider(periodDescription, json);

        this.loadingState = LoadingState.Loaded;
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
}
