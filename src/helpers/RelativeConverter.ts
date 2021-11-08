import { Maybe } from "../lib/Maybe";

export class RelativeConverter {
    convert(input: Maybe<number>[]): number[] {
        const copy = [...input];

        let previousValue = copy.shift();

        return copy.map(function (value) {
            let result;

            if (previousValue != null && value != null) {
                const diff = value - previousValue;

                // This is a bad workaround for moving house:
                // The meter return absolute values, so there's a big difference
                // between the old and new meter.
                // (only visible in the year view, since that's the only
                // view that has old and new measurements in the same view)
                //
                // A downside is that this hides one month of data.
                if (diff < -4400) {
                    result = 0;
                } else {
                    result = diff;
                }
            } else {
                result = 0;
            }

            previousValue = value;

            return result;
        });
    }
}
