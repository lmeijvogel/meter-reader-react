import { Component } from "react";

import { Bar } from "react-chartjs-2";
import { ChartData } from "chart.js";

import { convertToRelative } from "../helpers/convertToRelative";
import { interpolateArray } from "../helpers/interpolateArray";
import { costsFor, PriceCategory } from "../helpers/PriceCalculator";
import { UsageData } from "../models/UsageData";

type DataName = "gas" | "water" | "stroom_totaal";

interface IProps {
    label: string;
    labels: number[];
    data: (UsageData | null)[];
    maxY: number;
    fieldName: DataName;
    color: string;
    onClick: (index: number) => void;
    tooltipLabelBuilder: (title: string) => string;
}

type ChartItem = {
    xLabel: string;
    index: number;
};

export class Graph extends Component<IProps, {}> {
    render() {
        var tooltipLabelBuilder = this.props.tooltipLabelBuilder;

        var titleCallback = function (tooltipItems: ChartItem[], data: ChartData) {
            var title = "";
            var labels = data.labels;
            var labelCount = labels ? labels.length : 0;

            if (tooltipItems.length > 0) {
                var item = tooltipItems[0];

                if (item.xLabel) {
                    title = item.xLabel;
                } else if (labelCount > 0 && item.index < labelCount) {
                    const label = labels ? labels[item.index] : undefined;

                    if (!!label) {
                        title = (label as any).toString();
                    } else {
                        title = "";
                    }
                }
            }

            return tooltipLabelBuilder.call(null, title);
        };

        const options = {
            onClick: this.onClick,
            responsive: true,
            title: {
                display: true,
                text: this.ChartTitle()
            },
            legend: { display: false },
            tooltips: { callbacks: { title: titleCallback } },
            scales: {
                yAxes: [
                    {
                        ticks: {
                            beginAtZero: true,
                            max: this.props.maxY
                        }
                    }
                ]
            }
        };

        return <Bar type="" data={this.ChartData()} options={options} />;
    }

    ChartData(): ChartData {
        const interpolatedData = interpolateArray(this.dataForField());
        const relativeData = convertToRelative(interpolatedData);
        const roundedData = relativeData.map((value) => this.truncate(value, 3));

        return {
            labels: this.props.labels,
            datasets: [
                {
                    label: this.props.label,
                    data: roundedData,
                    borderColor: this.props.color,
                    backgroundColor: this.props.color
                }
            ]
        };
    }

    ChartTitle(): string {
        return `${this.props.label}: ${this.printableTotal} ${this.unit} (${this.printableCosts})`;
    }

    private get printableTotal(): string {
        const total = this.max() - this.min();
        return this.truncate(total, 1).toString().replace(".", ",");
    }

    private get printableCosts(): string {
        if (this.props.data === null) {
            return "0";
        }

        const firstDataElement = this.props.data[0];

        if (!firstDataElement) {
            return "0";
        }

        const firstTimestamp = new Date(firstDataElement.time_stamp);

        const category = this.getCategory(this.props.fieldName);

        return costsFor(this.max() - this.min(), category, firstTimestamp)
            .toString()
            .replace(".", ",");
    }

    private getCategory(fieldName: DataName): PriceCategory {
        switch (fieldName) {
            case "gas":
                return PriceCategory.Gas;
            case "water":
                return PriceCategory.Water;
            case "stroom_totaal":
                return PriceCategory.Stroom;
        }
    }

    max(): number {
        const actualValues = this.dataForField().filter((value) => value !== null) as number[];

        return Math.max.apply(null, actualValues);
    }

    min(): number {
        const actualValues = this.dataForField().filter((value) => value !== null) as number[];

        return Math.min.apply(null, actualValues);
    }

    truncate(value: number, precision: number): number {
        return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    }

    dataForField(): (number | null)[] {
        return this.props.data.map((u) => {
            if (u) {
                return u[this.props.fieldName];
            } else {
                return null;
            }
        });
    }

    private get unit() {
        switch (this.props.fieldName) {
            case "gas":
                return "m³";
            case "stroom_totaal":
                return "kWh";
            case "water":
                return "L";
            default:
                return "units";
        }
    }

    onClick = (_event: MouseEvent, data: { index: number }[]) => {
        if (data[0]) {
            this.props.onClick(data[0].index);
        }
    };
}
