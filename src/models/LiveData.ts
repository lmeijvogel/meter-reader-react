export type LiveData = {
    id: number;
    current: number;
    gas: number;
    stroom_dal: number;
    stroom_piek: number;
    water_current: number;
    water_current_period_in_seconds: number;
    last_water_ticks: Date[];
};
