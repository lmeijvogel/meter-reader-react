import { DayDescription, MonthDescription } from "./PeriodDescription";
import { PeriodDataProvider } from "./PeriodDataProvider";
import { UsageData } from "./UsageData";

export class MonthDataProvider extends PeriodDataProvider {
    constructor(public periodDescription: MonthDescription, public readonly periodUsage: UsageData[]) {
        super();
    }

    tooltipLabel = (day: number) => {
        return this.descriptionAt(day).toTitle();
    };

    maxDate() {
        // +1 because we want the 0th day of the next month (== last day of current month)
        return new Date(this.periodDescription.year, this.periodDescription.month + 1, 0).getDate();
    }

    descriptionAt(index: number): DayDescription {
        return new DayDescription(this.periodDescription.year, this.periodDescription.month, index + 1);
    }

    get dataRange() {
        switch (this.periodDescription.month) {
            case 1:
                const isLeapYear = new Date(this.periodDescription.year, 1, 29).getDate() === 29;

                if (isLeapYear) {
                    return { min: 1, max: 30 };
                } else {
                    return { min: 1, max: 29 };
                }
            case 0:
            case 2:
            case 4:
            case 6:
            case 7:
            case 9:
            case 11:
                return { min: 1, max: 32 };
            default:
                return { min: 1, max: 31 };
        }
    }

    get maxGasY() {
        return 15;
    }

    get maxStroomY() {
        return 15;
    }

    get maxWaterY() {
        return 1000;
    }

    isNotNull<T>(element: T | null | undefined): element is T {
        return !!element;
    }

    canDrillDown = true;
}
