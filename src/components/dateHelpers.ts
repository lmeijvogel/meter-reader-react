// This script is released to the public domain and may be used, modified and
// distributed without restrictions. Attribution not necessary but appreciated.
// Source: https://weeknumber.com/how-to/javascript

// Returns the ISO week of the date.
// Altered by me so it works on a copy of the date parameter instead of
// changing it.
export function getWeek(date: Date): number {
    const dateCopy = new Date();
    dateCopy.setTime(date.getTime());
    dateCopy.setHours(0, 0, 0, 0);
    //
    // Thursday in current week decides the year.
    dateCopy.setDate(dateCopy.getDate() + 3 - ((dateCopy.getDay() + 6) % 7));
    //
    // January 4 is always in week 1.
    var week1 = new Date(dateCopy.getFullYear(), 0, 4);
    //
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((dateCopy.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}

// Returns the four-digit year corresponding to the ISO week of the date.
export function getWeekYear(date: Date): number {
    const dateCopy = new Date();
    dateCopy.setTime(date.getTime());

    dateCopy.setDate(dateCopy.getDate() + 3 - ((dateCopy.getDay() + 6) % 7));

    return dateCopy.getFullYear();
}

// Copied from StackOverflow, so it does not necessarily fall under
// the statement at the top of the file:
// https://stackoverflow.com/questions/16590500/calculate-date-from-week-number-in-javascript
export function getDateOfISOWeek(year: number, week: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);

    const dayOfWeek = simple.getDay();

    const isoWeekStart = simple;

    if (dayOfWeek <= 4) {
        isoWeekStart.setDate(simple.getDate() - simple.getDay() + 1);
    } else {
        isoWeekStart.setDate(simple.getDate() + 8 - simple.getDay());
    }

    return isoWeekStart;
}
