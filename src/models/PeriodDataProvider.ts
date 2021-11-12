import { PeriodDescription } from "./PeriodDescription";
import { UsageData } from "./UsageData";

type MeasurementFieldName = keyof Omit<UsageData, "time_stamp">;

export abstract class PeriodDataProvider {
    abstract periodDescription: PeriodDescription;
    abstract periodUsage: UsageData[];

    abstract tooltipLabel: (field: number) => string;

    abstract descriptionAt(index: number): PeriodDescription;

    totalUsage(field: MeasurementFieldName): number {
        return this.maxValue(field) - this.minValue(field);
    }

    abstract get dataRange(): { min: number; max: number };

    abstract get maxGasY(): number;

    abstract get maxStroomY(): number;

    abstract get maxWaterY(): number;

    abstract canDrillDown: boolean;

    private minValue(field: MeasurementFieldName): number {
        return this.periodUsage[0]?.[field] ?? 0;
    }

    private maxValue(field: MeasurementFieldName): number {
        return this.periodUsage[this.periodUsage.length - 1]?.[field] ?? 0;
    }
}
