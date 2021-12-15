import { makeAutoObservable } from "mobx";
import { RunningUsageStore } from "./RunningUsageStore";
import { PeriodUsageStore } from "./PeriodUsageStore";
import { RadialUsageStore } from "./RadialUsageStore";
import { LiveDataStore } from "./LiveDataStore";

export type CurrentView = "period" | "recent" | "radial";

export class AppStore {
    currentView: CurrentView = "period";

    readonly periodUsageStore = new PeriodUsageStore();
    readonly runningUsageStore = new RunningUsageStore();
    readonly radialUsageStore = new RadialUsageStore();
    readonly liveDataStore = new LiveDataStore();

    constructor() {
        makeAutoObservable(this);
    }
}
