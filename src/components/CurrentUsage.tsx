import * as React from "react";
import { Component } from "react";

import { LiveData } from "../models/LiveData";

import { calculateCurrentWaterUsage } from "../helpers/calculateCurrentWaterUsage";

type IProps = {
    liveData: LiveData | null;
    onClick: () => void;
};

export class CurrentUsage extends Component<IProps> {
    render() {
        return (
            <table className="column column-20" onClick={this.onClick}>
                <thead>
                    <tr>
                        <th>Current</th>
                        <th>Water</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{this.displayableCurrent}</td>
                        <td>{this.displayableWater}</td>
                    </tr>
                </tbody>
            </table>
        );
    }

    private onClick = () => {
        this.props.onClick();
    };

    private get displayableCurrent(): string {
        const { liveData } = this.props;

        if (liveData) {
            return `${liveData.current * 1000} W`;
        } else {
            return "...";
        }
    }

    private get displayableWater(): string {
        const { liveData } = this.props;

        if (!liveData) {
            return "...";
        }

        return calculateCurrentWaterUsage(liveData);
    }
}
