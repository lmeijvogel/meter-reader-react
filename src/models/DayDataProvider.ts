import { DayDescription } from "../models/PeriodDescription";
import { PeriodDataProvider } from "./PeriodDataProvider";
import { PeriodDescription } from "./PeriodDescription";
import { UsageData } from "./UsageData";

export class DayDataProvider extends PeriodDataProvider {
    constructor(public periodDescription: DayDescription, public readonly periodUsage: Array<UsageData | null>) {
        super();
    }

    descriptionAt(_index: number): PeriodDescription {
        // Clicking on an hour bar shouldn't change anything, but I don't want to return null
        // since that makes typing more fragile.
        return this.periodDescription;
    }

    labels(): number[] {
        return this.range(0, 24);
    }

    tooltipLabel = (hour: string): string => {
        const intHour = parseInt(hour, 10);
        const nextHour = (intHour + 1) % 24;
        return `${hour}:00 - ${nextHour}:00`;
    };

    positionInData = (element: UsageData, _dataset: (UsageData | null)[]): number => {
        const periodDescription = this.periodDescription;

        const startOfDay = new Date(periodDescription.year, periodDescription.month, periodDescription.day, 0, 0, 0);
        const elementTime = new Date(element.time_stamp);

        const diffInMs = elementTime.getTime() - startOfDay.getTime();
        const diffInHours = Math.floor(diffInMs / 1000 / 3600);

        return diffInHours;
    };

    get maxGasY() {
        return 2;
    }

    get maxStroomY() {
        return 1.5;
    }

    get maxWaterY() {
        return 200;
    }

    canDrillDown = false;
}
