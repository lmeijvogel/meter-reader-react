import { PeriodDescription, DayDescription, MonthDescription, YearDescription } from "../models/PeriodDescription";

export function parseLocationBar(path: string): PeriodDescription {
    const dayMatch = path.match(/\/day\/(\d+)\/(\d+)\/(\d+)/);

    if (dayMatch) {
        return new DayDescription(parseInt(dayMatch[1], 10), parseInt(dayMatch[2], 10) - 1, parseInt(dayMatch[3], 10));
    }

    const monthMatch = path.match(/\/month\/(\d+)\/(\d+)/);

    if (monthMatch) {
        return new MonthDescription(parseInt(monthMatch[1], 10), parseInt(monthMatch[2], 10) - 1);
    }

    const yearMatch = path.match(/\/year\/(\d+)/);

    if (yearMatch) {
        return new YearDescription(parseInt(yearMatch[1], 10));
    }

    const date = new Date();

    return new MonthDescription(date.getFullYear(), date.getMonth());
}
