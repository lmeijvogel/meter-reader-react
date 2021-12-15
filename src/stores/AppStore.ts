import { makeAutoObservable } from "mobx";
import { LiveData } from "../models/LiveData";
import { RunningUsageStore } from "./RunningUsageStore";
import { PeriodUsageStore } from "./PeriodUsageStore";
import { RadialUsageStore } from "./RadialUsageStore";

export type CurrentView = "period" | "recent" | "radial";

export class AppStore {
    liveData: LiveData | "Loading" | "Error" = "Loading";
    currentView: CurrentView = "period";

    periodUsageStore: PeriodUsageStore = new PeriodUsageStore();
    runningUsageStore: RunningUsageStore = new RunningUsageStore();
    radialUsageStore: RadialUsageStore = new RadialUsageStore();

    constructor() {
        makeAutoObservable(this);
    }

    setLiveData(liveData: LiveData | "Loading" | "Error") {
        this.liveData = liveData;
    }
}
