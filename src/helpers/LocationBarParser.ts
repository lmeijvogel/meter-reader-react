import { DisplayState } from "../lib/DisplayState";
import { DayDescription, MonthDescription, PeriodDescription, YearDescription } from "../models/PeriodDescription";

export function parseLocationBar(path: string, defaultState: DisplayState): DisplayState {
    if (path.match(/\/recent/)) {
        return {
            view: "recent"
        };
    }

    const period = tryMatchPeriod(path);

    if (period) {
        return {
            view: "period",
            period: period
        };
    }

    return defaultState;
}

export function createUrl(displayState: DisplayState): string {
    switch (displayState.view) {
        case "period":
            return displayState.period.toUrl();
        case "recent":
            return "/recent";
        case "radial":
            return `/radial/${displayState.year}/${displayState.week}`;
    }
}

function tryMatchPeriod(path: string): PeriodDescription | null {
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

    return null;
}
