export function calculateCurrentWaterUsage(liveData: { last_water_ticks: Date[] }): string {
    const { last_water_ticks } = liveData;

    /* We're looking at two intervals: The interval between the last recorded "ticks" and how long ago the last tick was.
     *
     * If there's only one recorded tick, we only have a upper limit on how the water flow:
     *
     * For example: if the only tick was 30 seconds ago, we know that the flow is less than 2 liters per minute,
     * otherwise, there would have been a tick already.
     *
     * If there are two recorded ticks, there are two cases:
     *
     * * The flow is the same or rising.
     *   For example: One tick at 45 seconds ago, and one at 15 seconds. If the flow is the same, we would expect
     *   the next tick to be 15 seconds in the future. So we assume that the flow is unchanged.
     *
     * * The flow is decreasing.
     *   For example: One tick at 75 seconds ago, and one at 45 seconds. If the flow were the same, there would
     *   have also been a tick at 15 seconds ago, so the flow is decreasing.
     *
     *   We treat this case the same as if there's only one recorded tick: The tick before is outdated.
     *
     * Lastly, below a certain threshold, we just report usage = 0
     */

    if (last_water_ticks.length === 0) {
        return "0 L/m";
    }

    const timeSinceLastTickInMs = new Date().getTime() - last_water_ticks[0].getTime();

    if (timeSinceLastTickInMs > 2 * 60 * 1000) {
        return "0 L/m";
    }

    if (last_water_ticks.length === 1) {
        return printEstimate(timeSinceLastTickInMs);
    }

    const timeBetweenTicksInMs = last_water_ticks[0].getTime() - last_water_ticks[1].getTime();

    if (timeBetweenTicksInMs < timeSinceLastTickInMs) {
        return printEstimate(timeSinceLastTickInMs);
    }

    return printExact(timeBetweenTicksInMs);
}

function printEstimate(timeInMs: number): string {
    return `< ${formatFlow(timeInMs)} L/m`;
}

function printExact(timeInMs: number): string {
    return `${formatFlow(timeInMs)} L/m`;
}

function formatFlow(timeInMs: number): string {
    const timeInMinutes = timeInMs / 1000 / 60;

    const flowPerMinute = 1 / timeInMinutes;

    const formattedFlow = flowPerMinute.toFixed(1);

    return formattedFlow;
}
