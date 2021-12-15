import { makeAutoObservable } from "mobx";
import { LiveData } from "../models/LiveData";

export class LiveDataStore {
    timer: NodeJS.Timeout | null = null;

    liveData: LiveData | "Loading" | "Error" = "Loading";

    constructor() {
        makeAutoObservable(this);
    }

    retrieveLiveData = async () => {
        const response = await fetch("/api/energy/current", { credentials: "include" });

        try {
            switch (response.status) {
                case 200:
                    const json = await response.json();

                    this.setLiveData({
                        id: json.id,
                        current: json.current,
                        gas: json.gas,
                        stroom: json.stroom,
                        water_current: json.water_current
                    });
                    break;
                case 401:
                case 404:
                default:
                    this.setLiveData("Error");
                    break;
            }
        } catch {
            this.setLiveData("Error");
        }
    };

    startTimer() {
        this.timer = setInterval(this.retrieveLiveData, 3000);

        this.retrieveLiveData();
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    private setLiveData(liveData: LiveData | "Loading" | "Error") {
        this.liveData = liveData;
    }
}
