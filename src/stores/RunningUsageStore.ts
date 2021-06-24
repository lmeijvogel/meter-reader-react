import { makeAutoObservable } from "mobx";

import { LiveData } from "../models/LiveData";

export enum MonitoringState {
    Unknown,
    NotMonitoring,
    Monitoring,
    RetrievalError
}

export class RunningUsageStore {
    constructor() {
        makeAutoObservable(this);
    }

    monitoringState: MonitoringState = MonitoringState.Unknown;

    startingValues: LiveData | null = null;

    retrieveState() {
        fetch("/api/energy/running_usage", { credentials: "include" })
            .then((response) => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    throw new Error("Could not retrieve monitoring state");
                }
            })
            .then((json) => {
                if (json.running) {
                    this.monitoringState = MonitoringState.Monitoring;

                    this.startingValues = json.startingValues;
                } else {
                    this.monitoringState = MonitoringState.NotMonitoring;
                }
            })
            .catch(() => {
                this.monitoringState = MonitoringState.RetrievalError;
            });
    }
}
