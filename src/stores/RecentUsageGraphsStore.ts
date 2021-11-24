import { observable, IObservableArray, action } from "mobx";
import { UsageData } from "../models/UsageData";

export class RecentUsageGraphsStore {
    json: IObservableArray<any> = observable([]);

    fetchData = action(async () => {
        const response = await fetch("/api/energy/recent", { credentials: "include" });

        if (response.status === 200) {
            const json = await response.json();
            this.json.replace(json);
        } else {
            this.json.replace([]);
        }
    });

    relevantUsages(): UsageData[] {
        const lastHalf = this.json.slice(0, this.json.length / 2).reverse();

        return this.decimate(lastHalf, 12);
    }

    waterData(): number[] {
        return this.makeRelative(this.relevantUsages().map((u) => u.water));
    }

    stroomData(): number[] {
        const stroomTotals = this.relevantUsages().map((u) => u.stroom);
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
