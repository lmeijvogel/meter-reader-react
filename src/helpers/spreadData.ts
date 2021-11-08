type LabeledElement = {
    label: number;
};

export function spreadData<T extends LabeledElement>(
    dataset: T[],
    dataRange: { min: number; max: number }
): (T | null)[] {
    let output: (T | null)[] = [];

    for (let i = dataRange.min; i <= dataRange.max; i++) {
        const elementForPosition = dataset.find((el) => el.label === i);

        output.push(elementForPosition ?? null);
    }

    return output;
}
