import { action, IObservableArray, makeAutoObservable, observable, runInAction } from "mobx";
import { getWeek, getWeekYear } from "../components/dateHelpers";
import { UsageData } from "../models/UsageData";

export type RadialUsagePeriod = {
    week: number;
    year: number;
};

export class RadialUsageStore {
    data: IObservableArray<UsageData> = observable([]);

    period: RadialUsagePeriod;
    constructor() {
        makeAutoObservable(this);

        this.period = this.defaultPeriod();
    }

    periodSelected = action((period: RadialUsagePeriod) => {
        this.period = period;

        this.fetchData();
    });

    fetchData = async (): Promise<void> => {
        const { year, week } = this.period;

        const response = await fetch(`/api/radial/${year}/${week}.json`, { credentials: "include" });

        switch (response.status) {
            case 200:
                const newData = await response.json();

                runInAction(() => this.data.replace(newData));
                break;
            case 502:
                throw new Error("Bad gateway");
            default:
                throw new Error(`Unexpected status ${response.status}`);
        }
    };

    defaultPeriod(): RadialUsagePeriod {
        const today = new Date();

        return this.getWeekAndYear(today);
    }

    getWeekAndYear(date: Date): RadialUsagePeriod {
        return {
            year: getWeekYear(date),
            week: getWeek(date)
        };
    }

    serializeState(): RadialUsagePeriod {
        return this.period;
    }

    deserializeState(state: any) {
        return state as RadialUsagePeriod;
    }
}
