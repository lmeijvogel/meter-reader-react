import { action, IObservableArray, makeAutoObservable, observable, runInAction } from "mobx";
import { getWeek, getWeekYear } from "../components/dateHelpers";
import { UsageData } from "../models/UsageData";

export class RadialUsageStore {
    data: IObservableArray<UsageData> = observable([]);

    constructor(public week: number, public year: number) {
        makeAutoObservable(this);
    }

    periodSelected = action((week: number, year: number) => {
        this.week = week;
        this.year = year;

        this.fetchData();
    });

    fetchData = async (): Promise<void> => {
        const response = await fetch(`/api/radial/${this.year}/${this.week}.json`, { credentials: "include" });

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

    defaultYearAndWeek(): { year: number; week: number } {
        const today = new Date();

        return this.getWeekAndYear(today);
    }

    getWeekAndYear(date: Date): { year: number; week: number } {
        return {
            year: getWeekYear(date),
            week: getWeek(date)
        };
    }
}
