import { PeriodDescription } from "./PeriodDescription";
import { UsageData } from "./UsageData";

export abstract class PeriodDataProvider {
    abstract periodDescription: PeriodDescription;
    abstract periodUsage: Array<UsageData | null>;

    abstract labels(): number[];
    abstract tooltipLabel: (field: string) => string;
    abstract positionInData: (element: UsageData, dataset: (UsageData | null)[]) => number;

    abstract descriptionAt(index: number): PeriodDescription;

    abstract get maxGasY(): number;

    abstract get maxStroomY(): number;

    abstract get maxWaterY(): number;

    abstract canDrillDown: boolean;

    protected range(start: number, end: number): number[] {
        let result: number[] = [];

        for (let i: number = start; i < end; i++) {
            result.push(i);
        }

        return result;
    }
}
