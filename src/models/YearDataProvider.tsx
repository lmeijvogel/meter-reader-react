import { MonthDescription, YearDescription } from "./PeriodDescription";
import { PeriodDataProvider } from "./PeriodDataProvider";
import { UsageData } from "./UsageData";

export class YearDataProvider extends PeriodDataProvider {
    constructor(public periodDescription: YearDescription, public readonly periodUsage: Array<UsageData | null>) {
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

    positionInData = (element: UsageData, dataset: (UsageData | null)[]): number => {
        const filteredDataset = dataset.filter(el => !!el) as UsageData[];

        const years = filteredDataset.map(el => new Date(el.time_stamp).getFullYear());
        const minYear = Math.min.apply(null, years);

        const date = new Date(element.time_stamp);

        return date.getMonth() + (date.getFullYear() - minYear) * 12;
    };

    descriptionAt(index: number): MonthDescription {
        return new MonthDescription(this.periodDescription.year, index);
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
