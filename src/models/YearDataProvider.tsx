import { MonthDescription, YearDescription } from "./PeriodDescription";
import { PeriodDataProvider } from "./PeriodDataProvider";
import { UsageData } from "./UsageData";

export class YearDataProvider extends PeriodDataProvider {
    constructor(public periodDescription: YearDescription, public readonly periodUsage: UsageData[]) {
        super();
    }

    labels(): number[] {
        var range = this.range(1, 13);

        return range;
    }

    tooltipLabel = (month: string) => {
        const intMonth = parseInt(month, 10);
        return this.descriptionAt(intMonth - 1).toTitle();
    };

    descriptionAt(index: number): MonthDescription {
        return new MonthDescription(this.periodDescription.year, index);
    }

    get dataRange() {
        return {
            min: 1,
            max: 12
        };
    }

    get maxGasY() {
        return 300;
    }

    get maxStroomY() {
        return 350;
    }

    get maxWaterY() {
        return 15000;
    }

    canDrillDown = true;
}
