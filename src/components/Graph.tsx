import { useEffect, useRef } from "react";

import * as d3 from "d3";

import { convertToRelative } from "../helpers/convertToRelative";
import { interpolateArray } from "../helpers/interpolateArray";
import { costsFor, PriceCategory } from "../helpers/PriceCalculator";
import { UsageData } from "../models/UsageData";
import { GraphXOffset } from "./PeriodUsageDisplay";

type DataName = "gas" | "water" | "stroom_totaal";

type Props = {
    label: string;
    data: (UsageData | null)[];
    maxY: number;
    fieldName: DataName;
    color: string;
    onClick: (index: number) => void;
    tooltipLabelBuilder: (title: number) => string;
    xOffset: GraphXOffset;
};

export function Graph({ label, data, maxY, fieldName, color, onClick, tooltipLabelBuilder, xOffset }: Props) {
    const ref = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        renderGraph();
    }, [data]);

    const width = 480;
    const height = 240;
    const padding = {
        top: 30,
        right: 10,
        bottom: 10,
        left: 10
    };

    const axisWidth = 30;
    const axisHeight = 10;

    const interpolatedData = interpolateArray(dataForField());
    const relativeData = convertToRelative(interpolatedData);
    const roundedData = relativeData.map((value) => truncate(value, 3));

    const scaleX = d3
        .scaleLinear()
        .domain([0, roundedData.length])
        .range([padding.left + axisWidth, width - padding.right]);

    const scaleY = d3
        .scaleLinear()
        .domain([0, maxY])
        .range([height - padding.bottom - axisHeight, padding.top])
        .clamp(true);

    var xAxis = d3.axisBottom(scaleX).tickValues(buildTicks(roundedData.length));
    var yAxis = d3.axisLeft(scaleY);

    function renderGraph() {
        const id = ref.current!.id;

        const htmlElement = document.getElementById(id);

        if (!!htmlElement) {
            htmlElement.innerHTML = "";
        }

        const svg = d3
            .select("#" + id)
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "white");

        svg.append("g")
            .attr("transform", `translate(0, ${scaleY(0)})`)
            .call(xAxis);

        svg.append("g")
            .attr("transform", `translate(${scaleX(0)}, 0)`)
            .call(yAxis);

        const yTickValues = yAxis.tickValues() || scaleY.ticks();
        svg.append("g")
            .selectAll("line")
            .data(yTickValues)
            .join("line")
            .attr("x1", padding.left + axisWidth)
            .attr("y1", (el) => scaleY(el))
            .attr("x2", width - padding.right)
            .attr("y2", (el) => scaleY(el))
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1);

        const xTickValues = xAxis.tickValues() || scaleX.ticks();
        svg.append("g")
            .selectAll("line")
            .data(xTickValues)
            .join("line")
            .attr("x1", (el) => scaleX(el))
            .attr("y1", scaleY(0))
            .attr("x2", (el) => scaleX(el))
            .attr("y2", padding.bottom)
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1);

        const barXOffset = xOffset === "on_value" ? 0.5 : 0;
        const click = ({ target }: { target: SVGRectElement }) => {
            const index = parseInt(target.attributes.getNamedItem("index")!.value, 10);
            onClick(index);
        };

        const tooltip = d3.select("#tooltip");

        svg.selectAll("rect")
            .data(roundedData)
            .join("rect")
            .attr("x", (_val, i) => scaleX(i + barXOffset) + 2)
            .attr("y", (el) => scaleY(el))
            .attr("width", scaleX(1) - scaleX(0) - 4)
            .attr("height", (el) => scaleY(0) - scaleY(el))
            .attr("fill", color)
            .attr("index", (_d, i) => i)

            .on("click", click)
            .on("mouseenter", (event, value) => {
                const index = parseInt(event.target.attributes.getNamedItem("index")!.value, 10);
                tooltip
                    .html(buildTooltipContents(index, value))
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY - 58 + "px")
                    .style("opacity", 1);
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
            });

        const middleOfChart = (padding.left + axisWidth + (width - padding.right)) / 2;
        svg.append("text")
            .attr("x", middleOfChart)
            .attr("y", padding.top / 2)
            .style("text-anchor", "middle")
            .style("font-style", "italic")
            .text(buildChartTitle());
    }

    function buildTooltipContents(index: number, value: number) {
        return `${tooltipLabelBuilder(index)}:<br />${value} ${unit()}`;
    }

    function buildChartTitle(): string {
        return `${label}: ${printableTotal()} ${unit()} (${printableCosts()})`;
    }

    function printableTotal(): string {
        const total = max() - min();
        return truncate(total, 1).toString().replace(".", ",");
    }

    function printableCosts(): string {
        if (data === null) {
            return "0";
        }

        const firstDataElement = data[0];

        if (!firstDataElement) {
            return "0";
        }

        const firstTimestamp = new Date(firstDataElement.time_stamp);

        const category = getCategory(fieldName);

        return costsFor(max() - min(), category, firstTimestamp).toString();
    }

    function getCategory(fieldName: DataName): PriceCategory {
        switch (fieldName) {
            case "gas":
                return PriceCategory.Gas;
            case "water":
                return PriceCategory.Water;
            case "stroom_totaal":
                return PriceCategory.Stroom;
        }
    }

    function max(): number {
        const actualValues = dataForField().filter((value) => value !== null) as number[];

        return Math.max(...actualValues);
    }

    function min(): number {
        const actualValues = dataForField().filter((value) => value !== null) as number[];

        return Math.min(...actualValues);
    }

    function truncate(value: number, precision: number): number {
        return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
    }

    function dataForField(): (number | null)[] {
        return data.map((u) => {
            if (u) {
                return u[fieldName];
            } else {
                return null;
            }
        });
    }

    function unit() {
        switch (fieldName) {
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

    function buildTicks(dataCount: number): number[] {
        const result = [];

        for (let i = 1; i <= dataCount; i += 2) {
            result.push(i);
        }

        if (xOffset === "on_value" && result[result.length - 1] === dataCount - 1) {
            result[result.length - 1] = dataCount;
        }

        return result;
    }

    return (
        <div>
            <svg id={`chart_${Math.floor(Math.random() * 1000)}`} ref={ref}></svg>
        </div>
    );
}
