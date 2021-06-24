import { UsageData } from "../models/UsageData";

export class DataShifter {
    call(
        dataset: (UsageData | null)[],
        posExtractor: (element: UsageData, dataset: (UsageData | null)[]) => number
    ): (UsageData | null)[] {
        let output: (UsageData | null)[] = [];

        let lastPositionInOutput = 0;

        dataset.forEach((element) => {
            if (!element) {
                return;
            }

            const nextPositionInOutput = posExtractor(element, dataset);

            // I don't really want to handle this case at the moment
            if (nextPositionInOutput < lastPositionInOutput) {
                throw new Error("Unsorted input data");
            }

            while (lastPositionInOutput < nextPositionInOutput) {
                output[lastPositionInOutput] = null;
                lastPositionInOutput++;
            }

            output[nextPositionInOutput] = element;
            lastPositionInOutput = nextPositionInOutput + 1;
        });

        return output;
    }
}
