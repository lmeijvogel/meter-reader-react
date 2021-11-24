import * as d3 from "d3";
import { observer } from "mobx-react";
import { useEffect } from "react";
import { Color } from "../lib/Colors";
import { LiveData } from "../models/LiveData";

type Props = {
    liveData: "Loading" | "Error" | LiveData;
    onClick: () => void;
};

const CurrentUsage = observer(({ liveData, onClick }: Props) => {
    return (
        <div className={"gauges"} onClick={onClick}>
            {renderChild(liveData)}
        </div>
    );
});

function renderChild(liveData: LiveData | "Loading" | "Error") {
    switch (liveData) {
        case "Loading":
            return <div>Loading live data</div>;
        case "Error":
            return <div>Error loading live data</div>;
        default:
            return (
                <>
                    <Gauge
                        id="currentGauge"
                        color={Color.stroom}
                        colorFull={Color.stroomIntense}
                        value={liveData.current}
                        maxValue={3}
                        title="Stroom"
                        valueFormatter={displayableCurrent}
                    />
                    <Gauge
                        id="waterGauge"
                        color={Color.water}
                        colorFull={Color.waterIntense}
                        value={liveData.water_current}
                        maxValue={20}
                        title="Water"
                        valueFormatter={displayableWater}
                    />
                </>
            );
    }
}

type GaugeProps = {
    id: string;
    color: string;
    colorFull: string;
    value: number;
    maxValue: number;
    title: string;
    valueFormatter: (value: number) => string;
};

const width = 100;
const height = width;

function Gauge({ id, color, colorFull, value, maxValue, title, valueFormatter }: GaugeProps) {
    useEffect(() => {
        const fillColor = value < maxValue ? color : colorFull;

        const scaleDegrees = d3
            .scaleLinear()
            .domain([0, maxValue])
            .range([0.01, 2 * Math.PI])
            .clamp(true);

        const baseArc = () =>
            d3
                .arc()
                .innerRadius((width / 2) * 0.8)
                .outerRadius(width / 2)
                .startAngle(0);

        const usageArc = baseArc().endAngle(scaleDegrees(value));

        const unusedArc = baseArc().endAngle(2 * Math.PI);

        const currentSvg = d3
            .select("#" + id)
            .attr("width", width)
            .attr("height", height);

        currentSvg
            .select("path.unused")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", "#eeeeee")
            .attr("d", unusedArc as any);

        currentSvg
            .select("path.usage")
            .attr("transform", `translate(${width / 2}, ${height / 2})`)
            .attr("width", width)
            .attr("height", height)
            .attr("fill", fillColor)
            .attr("d", usageArc as any);

        currentSvg
            .select("text.title")
            .attr("transform", `translate(${width / 2}, ${height / 2 - 10})`)
            .attr("height", height / 2)
            .style("text-anchor", "middle")
            .style("dominant-baseline", "middle") // This is the vertical alignment
            .text(title);

        currentSvg
            .select("text.usage")
            .attr("transform", `translate(${width / 2}, ${height / 2 + 10})`)
            .attr("height", height / 2)
            .style("text-anchor", "middle")
            .style("dominant-baseline", "middle") // This is the vertical alignment
            .text(valueFormatter(value));
    }, [id, color, colorFull, title, value, maxValue, valueFormatter]);

    return (
        <svg id={id}>
            <path className="unused" />
            <path className="usage" />
            <text className="title" />
            <text className="usage" />
        </svg>
    );
}

function displayableCurrent(value: number): string {
    return `${value * 1000} W`;
}

function displayableWater(value: number): string {
    return `${value} L/m`;
}

export { CurrentUsage };
