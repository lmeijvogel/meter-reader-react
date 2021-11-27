import * as React from "react";
import { createRef } from "react";

import * as d3 from "d3";

import { convertToRelative } from "../helpers/convertToRelative";
import { interpolateArray } from "../helpers/interpolateArray";
import { costsFor, PriceCategory } from "../helpers/PriceCalculator";
import { UsageData, UsageField } from "../models/UsageData";
import { GraphXOffset } from "./PeriodUsageDisplay";
import { assertNever } from "../lib/assertNever";

type Props = {
    label: string;
    data: (UsageData | null)[];
    maxY: number;
    fieldName: UsageField;
    color: string;
    onClick: (index: number) => void;
    tooltipLabelBuilder: (title: number) => string;
    xOffset: GraphXOffset;
};

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

export class Graph extends React.Component<Props> {
    private readonly elementRef = createRef<SVGSVGElement>();

    private svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any> | null = null;

    private readonly scaleX: d3.ScaleBand<string>;
    private readonly xAxis: d3.Axis<string>;

    private readonly scaleY: d3.ScaleLinear<number, number, never>;
    private readonly yAxis: d3.Axis<d3.NumberValue>;

    constructor(props: Props) {
        super(props);

        this.scaleX = d3.scaleBand().padding(0.15).paddingOuter(0);
        this.xAxis = d3.axisBottom(this.scaleX.align(0));

        this.scaleY = d3.scaleLinear().clamp(true);
        this.yAxis = d3.axisLeft(this.scaleY);
    }

    componentDidMount() {
        this.initializeGraph();
        this.renderGraph(this.svg!);
    }

    componentDidUpdate() {
        this.renderGraph(this.svg!);
    }

    render() {
        return (
            <div>
                <svg id={`chart_${this.props.fieldName}`} ref={this.elementRef}>
                    <g className="xAxis" />
                    <g className="yAxis" />
                    <g className="gridLines" />
                </svg>
            </div>
        );
    }

    initializeGraph() {
        const id = this.elementRef.current!.id;

        this.svg = d3
            .select("#" + id)
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "white");

        addChartTitle(this.svg);
    }

    renderGraph(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
        const relativeData = preprocessData(this.dataForField(), truncate);

        const domain = d3
            .range(this.props.xOffset === "between_values" ? 0 : 1, relativeData.length + 1, 1)
            .map((el) => el.toString());

        this.scaleX.domain(domain).range([padding.left + axisWidth, width - padding.right]);
        this.scaleY.domain([0, this.props.maxY]).range([height - padding.bottom - axisHeight, padding.top]);

        this.updateAxes(svg, relativeData);

        this.drawGridLines(svg);
        this.drawBars(svg, relativeData);

        const firstDataElement = this.props.data[0];

        svg.select(".chartTitle").text(
            buildChartTitle(this.props.label, this.totalUsage(), this.props.fieldName, firstDataElement)
        );
    }

    clickBar = ({ target }: { target: SVGRectElement }) => {
        const index = parseInt(target.attributes.getNamedItem("index")!.value, 10);
        this.props.onClick(index);
    };

    showTooltip = (event: any, value: number) => {
        const index = parseInt(event.target.attributes.getNamedItem("index")!.value, 10);
        showTooltip(this.buildTooltipContents(index, value), event);
    };

    hideTooltip = () => {
        const tooltip = d3.select("#tooltip");
        tooltip.style("opacity", 0);
    };

    private updateAxes(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, relativeData: number[]) {
        this.xAxis.tickValues(buildTicks(relativeData.length));

        svg.select(".xAxis")
            .attr("transform", `translate(0, ${this.scaleY(0)})`)
            .call(this.xAxis as any);
        svg.select(".yAxis")
            .attr("transform", `translate(${padding.left + axisWidth}, 0)`)
            .call(this.yAxis as any);
    }

    drawGridLines(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
        const yTickValues = this.yAxis.tickValues() || this.scaleY.ticks();
        svg.select("g.gridLines")
            .selectAll("line")
            .data(yTickValues)
            .join("line")
            .attr("x1", padding.left + axisWidth)
            .attr("y1", (el) => this.scaleY(el))
            .attr("x2", width - padding.right)
            .attr("y2", (el) => this.scaleY(el))
            .attr("stroke", "#ddd")
            .attr("stroke-width", 1);
    }

    private drawBars(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, relativeData: number[]) {
        svg.selectAll("rect")
            .data(relativeData)
            .join(
                (enter) =>
                    enter
                        .append("rect")
                        .on("click", this.clickBar)
                        .on("mouseenter", this.showTooltip)
                        .on("mouseleave", this.hideTooltip)
                        .attr("width", this.scaleX.bandwidth())

                        .attr("y", (el) => this.scaleY(el))
                        .attr("height", (el) => this.scaleY(0) - this.scaleY(el))
                        .attr("x", (_val, i) => this.calculateBarXPosition(i) + this.scaleX.bandwidth() * 1.15)

                        .transition()
                        .duration(500)
                        .attr("x", (_val, i) => this.calculateBarXPosition(i))
                        .selection(),
                (update) =>
                    update
                        .on("click", this.clickBar)
                        .transition()
                        .duration(500)
                        .attr("y", (el) => this.scaleY(el))
                        .attr("height", (el) => this.scaleY(0) - this.scaleY(el))
                        .attr("x", (_val, i) => this.calculateBarXPosition(i))
                        .attr("width", this.scaleX.bandwidth()),

                (exit) => exit.remove()
            )
            .attr("fill", this.props.color)
            .attr("index", (_d, i) => i);
    }

    totalUsage() {
        const actualValues = this.dataForField().filter(isNotNull);

        return Math.max(...actualValues) - Math.min(...actualValues);
    }

    calculateBarXPosition(i: number) {
        const shiftBars = this.props.xOffset === "between_values" ? this.scaleX.bandwidth() / 2 : 0;
        const pos = this.scaleX((i + 1).toString());

        return !!pos ? pos - shiftBars : 0;
    }

    buildTooltipContents(index: number, value: number) {
        return `${this.props.tooltipLabelBuilder(index)}:<br />${value} ${unit(this.props.fieldName)}`;
    }

    dataForField(): (number | null)[] {
        return this.props.data.map((u) => {
            return u?.[this.props.fieldName] ?? null;
        });
    }
}

function preprocessData(data: (number | null)[], truncate: (value: number, precision: number) => number) {
    const interpolatedData = interpolateArray(data);
    const relativeData = convertToRelative(interpolatedData);
    const roundedData = relativeData.map((value) => truncate(value, 3));

    return roundedData;
}

function buildChartTitle(
    label: string,
    usage: number,
    fieldName: UsageField,
    firstDataElement: UsageData | null
): string {
    return `${label}: ${printableTotal(usage)} ${unit(fieldName)} (${printableCosts(
        usage,
        fieldName,
        firstDataElement
    )})`;
}

// TODO: Extract method 'usageThisPeriod' so we only have to do the isNotNull filter once?
function printableTotal(usage: number): string {
    return truncate(usage, 1).toString().replace(".", ",");
}

function printableCosts(usage: number, fieldName: UsageField, firstDataElement: UsageData | null): string {
    if (!firstDataElement) {
        return "0";
    }

    const firstTimestamp = new Date(firstDataElement.time_stamp);

    const category = getCategory(fieldName);

    return costsFor(usage, category, firstTimestamp).toString();
}

function getCategory(fieldName: UsageField): PriceCategory {
    switch (fieldName) {
        case "gas":
            return PriceCategory.Gas;
        case "water":
            return PriceCategory.Water;
        case "stroom":
            return PriceCategory.Stroom;
    }
}

function isNotNull<T>(x: T | null | undefined): x is T {
    return x !== null && x !== undefined;
}

function truncate(value: number, precision: number): number {
    return Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
}

function unit(fieldName: UsageField) {
    switch (fieldName) {
        case "gas":
            return "m³";
        case "stroom":
            return "kWh";
        case "water":
            return "L";
        default:
            return assertNever(fieldName);
    }
}

function buildTicks(dataCount: number): string[] {
    return d3.range(1, dataCount + 1, 2).map((el) => el.toString());
}

function addChartTitle(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
    const middleOfChart = (padding.left + axisWidth + (width - padding.right)) / 2;

    svg.append("text")
        .attr("class", "chartTitle")
        .attr("x", middleOfChart)
        .attr("y", padding.top / 2)
        .style("text-anchor", "middle")
        .style("font-style", "italic");
}

function showTooltip(contents: string, event: any) {
    const tooltip = d3.select("#tooltip");

    tooltip
        .html(contents)
        .style("left", event.pageX + 20 + "px")
        .style("top", event.pageY - 58 + "px")
        .style("opacity", 1);
}
