import { PeriodDescription, DayDescription } from "../../models/PeriodDescription";
import { NavigationButton } from "../NavigationButton";

interface IProps {
    enabled: boolean;

    periodDescription: PeriodDescription;

    onSelect: (periodDescription: PeriodDescription) => void;
}

export const NavigationButtons = ({ enabled, periodDescription, onSelect }: IProps) => {
    const today = DayDescription.today();
    const previous = periodDescription.previous();
    const next = periodDescription.next();
    const up = periodDescription.up();

    const newPeriod = (period: PeriodDescription) => {
        onSelect(period);
    };

    const todayButton = <NavigationButton label="Today" onClick={() => newPeriod(today)} enabled={enabled} />;

    return (
        <div className="NavigationButtonContainer">
            <div className="row">
                <div className="column column-md-50 column-sm-100">
                    <NavigationButton
                        label={"< " + previous.toShortTitle()}
                        onClick={() => newPeriod(previous)}
                        enabled={enabled && previous.hasMeasurements()}
                    />
                </div>
                <div className="column column-md-50 column-sm-100">
                    <NavigationButton
                        label={next.toShortTitle() + " >"}
                        onClick={() => newPeriod(next)}
                        enabled={enabled && next.hasMeasurements()}
                    />
                </div>
            </div>
            {up && (
                <div className="row">
                    <div className="column column-100">
                        <NavigationButton label={up.toShortTitle()} onClick={() => newPeriod(up)} enabled={enabled} />
                    </div>
                </div>
            )}

            <div className="row">
                <div className="column column-100">{todayButton}</div>
            </div>
        </div>
    );
};
