import { DayDescription } from "../models/PeriodDescription";
import { PeriodDataProvider } from "./PeriodDataProvider";
import { PeriodDescription } from "./PeriodDescription";
import { UsageData } from "./UsageData";

export class DayDataProvider extends PeriodDataProvider {
  constructor(
    public periodDescription: DayDescription,
    public readonly periodUsage: Array<UsageData | null>
  ) {
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

  positionInData = (
    element: UsageData,
    _dataset: (UsageData | null)[]
  ): number => {
    const periodDescription = this.periodDescription;

    const currentDate = new Date(
      periodDescription.year,
      periodDescription.month,
      periodDescription.day
    );

    const elementTime = new Date(element.time_stamp);
    const elementDate = new Date(
      elementTime.getFullYear(),
      elementTime.getMonth(),
      elementTime.getDate()
    );

    const oneDay = 24 * 60 * 60 * 1000;
    const dayDifference =
      (elementDate.getTime() - currentDate.getTime()) / oneDay;

    return elementTime.getHours() + dayDifference * 24;
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
}
