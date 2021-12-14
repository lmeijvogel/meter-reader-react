import { getDateOfISOWeek, getWeek, getWeekYear } from "../dateHelpers";
import { NavigationButton } from "../NavigationButton";

type Props = {
    year: number;
    week: number;

    onSelect: (week: number, year: number) => void;
};

export function NavigationButtons({ year, week, onSelect }: Props) {
    const startOfSelectedWeek = getDateOfISOWeek(year, week);

    const [lastWeekNumber, lastWeekYear] = getWeekAndYear(startOfSelectedWeek, -7);
    const [nextWeekNumber, nextWeekYear] = getWeekAndYear(startOfSelectedWeek, 7);

    return (
        <div className="container">
            <div className="row">
                <div className="column column-md-50 column-sm-100">
                    <NavigationButton
                        label={`< week ${lastWeekNumber} ${lastWeekYear}`}
                        onClick={() => onSelect(lastWeekNumber, lastWeekYear)}
                        enabled={true}
                    />
                </div>
                <div className="column column-md-50 column-sm-100">
                    <NavigationButton
                        label={`week ${nextWeekNumber} ${nextWeekYear} >`}
                        onClick={() => onSelect(nextWeekNumber, nextWeekYear)}
                        enabled={true}
                    />
                </div>
            </div>
        </div>
    );
    // <div className="row">
    // <div className="column column-100">{todayButton}</div>
    // </div>
}

function getWeekAndYear(startDate: Date, addDays: number): [week: number, year: number] {
    const hourInMs = 60 * 60 * 1000;
    const dayInMs = 24 * hourInMs;

    const currentTimeStamp = startDate.getTime();

    const newDate = new Date();
    newDate.setTime(currentTimeStamp + addDays * dayInMs);

    // Lazy workaround for DST: We always want to end up at 0:00, but simply adding/subtracting
    // 24 hours would let the date end up at 23:00 or 01:00 when the clock
    // changes.
    if (newDate.getHours() === 23) {
        newDate.setTime(currentTimeStamp + addDays * dayInMs + hourInMs);
    } else if (newDate.getHours() === 1) {
        newDate.setTime(currentTimeStamp + addDays * dayInMs - hourInMs);
    }

    return [getWeek(newDate), getWeekYear(newDate)];
}
