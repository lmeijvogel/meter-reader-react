import { makeAutoObservable, runInAction } from "mobx";
import { DayDataProvider } from "../models/DayDataProvider";
import { MonthDataProvider } from "../models/MonthDataProvider";
import { PeriodDataProvider } from "../models/PeriodDataProvider";
import {
    DayDescription,
    MonthDescription,
    PeriodDescription,
    serializePeriodDescription,
    YearDescription
} from "../models/PeriodDescription";
import { UsageData } from "../models/UsageData";
import { YearDataProvider } from "../models/YearDataProvider";

// Explicitly doesn't have a state 'Loading' since we're never checking for it anyway:
// If it is loading, it should still draw the data that is already present,
// otherwise the graphs will disappear and appear instead of animate.
export enum LoadingState {
    NotLoaded = 0,
    Loaded,
    ErrorLoading
}

export class PeriodUsageStore {
    loadingState: LoadingState = LoadingState.NotLoaded;

    periodDescription: PeriodDescription | null = null;
    dataProvider: PeriodDataProvider | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    initializeIfNecessary() {
        if (!this.periodDescription) {
            this.setPeriodDescription(this.defaultPeriodDescription());
        }
    }

    private defaultPeriodDescription(): PeriodDescription {
        return DayDescription.today();
    }

    setPeriodDescription = (periodDescription: PeriodDescription) => {
        this.periodDescription = periodDescription;

        this.fetchData();
    };

    serializeState(): PeriodDescription {
        return serializePeriodDescription(this.periodDescription!);
    }

    private fetchData() {
        if (!this.periodDescription) {
            return;
        }

        const newLocation = this.periodDescription.toUrl();

        // TODO: periodDescription!
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
            .then((json) => this.setData(this.periodDescription!, json))
            .catch(() => this.setErrorState());
    }

    private setData = (periodDescription: PeriodDescription, json: UsageData[]) => {
        runInAction(() => {
            this.dataProvider = this.buildDataProvider(periodDescription, json);
            this.loadingState = LoadingState.Loaded;
        });
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

    private setErrorState = () => {
        this.dataProvider = null;

        this.loadingState = LoadingState.ErrorLoading;
    };
}
