import { Maybe } from "../lib/Maybe";

export function interpolateArray(input: Maybe<number>[]): Maybe<number>[] {
    const scratch: (Maybe<number> | "skip")[] = [...input];

    /* First mark leading and trailing nulls since they can't be interpolated.
     * This will make it easier later on to skip them but still include the correct
     * number of nulls
     */
    for (let i = 0; input[i] === null; i++) {
        scratch[i] = "skip";
    }

    for (let i = input.length - 1; input[i] === null; i--) {
        scratch[i] = "skip";
    }

    /* Note: This actually alters the input array to contain the interpolated values */
    return scratch.map((value, i) => {
        if (value === "skip") {
            return null;
        }

        if (value !== null) {
            return value;
        } else {
            const interpolatedValue = interpolateValue(scratch, i);

            scratch[i] = interpolatedValue;
            return interpolatedValue;
        }
    });
}

function interpolateValue(scratch: (Maybe<number> | "skip")[], position: number) {
    /* This should always exist since it either existed before or was just added by the
     * previous interpolation */
    const previousValue = scratch[position - 1] as number;

    const nextElements = scratch.slice(position);
    const nextNonEmptyIndex = nextElements.findIndex((el) => el !== null);
    const nextNonEmptyValue = nextElements[nextNonEmptyIndex] as number;

    const stepSize = (nextNonEmptyValue - previousValue) / (nextNonEmptyIndex + 1);
    const interpolatedValue = previousValue + stepSize;

    return interpolatedValue;
}
