type optNumber = number | null;

export class ArrayInterpolator {
    call(input: optNumber[]): number[] {
        const firstNonEmptyIndex: number = this.firstNonEmptyIndex(input);

        if (firstNonEmptyIndex === -1) {
            // No elements are filled in!
            return [];
        }

        let rest: optNumber[];

        if (firstNonEmptyIndex === 0) {
            // Fill a single range by finding the next non-empty element and
            // interpolate between them

            // Skip the first element, but still count it in the offset
            const nextNonEmpty = this.firstNonEmptyIndex(this.tail(input)) + 1;

            // No further elements are filled in, nothing to interpolate
            if (nextNonEmpty === 0) {
                return input.slice(0, 1) as number[];
            }

            const first: optNumber[] = this.take(input, nextNonEmpty + 1);
            rest = this.drop(input, nextNonEmpty);

            const interpolatedFirst = this.interpolate(first);

            return this.initial(interpolatedFirst).concat(this.call(rest)) as number[];
        } else {
            const empties: optNumber[] = this.take(input, firstNonEmptyIndex);
            rest = this.drop(input, firstNonEmptyIndex);

            return empties.concat(this.call(rest)) as number[];
        }
    }

    interpolate(array: optNumber[]): number[] {
        const first = array[0] as number;
        const last = array[array.length - 1] as number;
        const count = array.length;

        const stepSize = (last - first) / (count - 1);

        return this.range(count).map((el) => first + el * stepSize);
    }

    firstNonEmptyIndex(input: optNumber[]): number {
        return this.firstIndexWhereInt(input, (el: optNumber) => el !== 0 && el !== null);
    }

    firstIndexWhereInt(input: optNumber[], test: (el: optNumber) => boolean): number {
        if (input.length === 0) {
            return -1;
        }

        const head = input[0];

        if (test(head)) {
            return 0;
        } else {
            const indexInTail = this.firstIndexWhereInt(this.tail(input), test);

            if (indexInTail === -1) {
                return -1;
            }
            return 1 + indexInTail;
        }
    }

    take(input: optNumber[], count: number): optNumber[] {
        return input.slice(0, count);
    }

    drop(input: optNumber[], count: number): optNumber[] {
        return input.slice(count);
    }

    tail(input: optNumber[]): optNumber[] {
        return input.slice(1);
    }

    initial(input: optNumber[]): optNumber[] {
        return input.slice(0, input.length - 1);
    }

    range(count: number): number[] {
        let result: number[] = [];

        for (let i: number = 0; i < count; i++) {
            result.push(i);
        }

        return result;
    }
}
