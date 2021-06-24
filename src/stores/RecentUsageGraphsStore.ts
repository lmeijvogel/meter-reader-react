import { observable, IObservableArray } from "mobx";
import { UsageData } from "../models/UsageData";

export class RecentUsageGraphsStore {
    json: IObservableArray<any> = observable([]);

    setData(json: any) {
        this.json.replace(json);
    }

    relevantUsages(): UsageData[] {
        const lastHalf = this.json.slice(0, this.json.length / 2).reverse();

        return this.decimate(lastHalf, 12);
    }

    waterData(): number[] {
        return this.makeRelative(this.relevantUsages().map((u) => u.water));
    }

    stroomData(): number[] {
        const stroomTotals = this.relevantUsages().map((u) => u.stroom_dal + u.stroom_piek);
        return this.makeRelative(stroomTotals).map((u) => this.truncate(u * 1000, 2));
    }

    labels(): string[] {
        return this.buildLabels(this.relevantUsages());
    }

    private decimate(input: UsageData[], interval: number): UsageData[] {
        let numberUntilNextEntry = 0;

        return input.filter((_) => {
            if (numberUntilNextEntry <= 0) {
                numberUntilNextEntry = interval;

                return true;
            } else {
                numberUntilNextEntry--;
                return false;
            }
        });
    }

    private buildLabels(relevantUsages: UsageData[]) {
        return relevantUsages.map((u) => {
            return u.time_stamp.slice(11, 16);
        });
    }

    private makeRelative(data: number[]): number[] {
        let last = data[0];

        return data.slice(1).map((el) => {
            const value = el - last;

            last = el;

            return value;
        });
    }

    private truncate(value: number, precision: number) {
        return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    }
}
