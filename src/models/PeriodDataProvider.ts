import { PeriodDescription } from "./PeriodDescription";
import { UsageData } from "./UsageData";

type MeasurementFieldName = keyof Omit<UsageData, "time_stamp">;

export abstract class PeriodDataProvider {
    abstract periodDescription: PeriodDescription;
    abstract periodUsage: UsageData[];

    abstract labels(): number[];
    abstract tooltipLabel: (field: string) => string;

    abstract descriptionAt(index: number): PeriodDescription;

    totalUsage(field: MeasurementFieldName): number {
        return this.maxValue(field) - this.minValue(field);
    }

    abstract get dataRange(): { min: number; max: number };

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

    private minValue(field: MeasurementFieldName): number {
        return this.periodUsage[0]?.[field] ?? 0;
    }

    private maxValue(field: MeasurementFieldName): number {
        return this.periodUsage[this.periodUsage.length - 1]?.[field] ?? 0;
    }
}
