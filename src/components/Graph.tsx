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
    colorIntense: string;
    onClick: (index: number) => void;
    tooltipLabelBuilder: (title: number) => string;
    xOffset: GraphXOffset;
};

type DragSelectionData = {
    selectionStartPx: number;
    selectionEndPx: number;

    previousSelectionStartBand: number | null;
    previousSelectionEndBand: number | null;
    previousSelectionRelevantIndexes: number[];
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
    /* When the user drags to select a number of bars,
     * it's necessary to find the bars corresponding to the
     * coordinates on-screen. Sadly, the BandScale that we use for
     * positioning the bars does not have an `inverse(x)` method,
     * so we build a second (linear) scale that matches the BandScale
     * and use that for finding the current bar for given x-coordinates.
     */
    private readonly scaleXForInversion: d3.ScaleLinear<number, number, never>;
    private readonly xAxis: d3.Axis<string>;

    private readonly scaleY: d3.ScaleLinear<number, number, never>;
    private readonly yAxis: d3.Axis<d3.NumberValue>;

    private mouseIsDown = false;
    private isDragging = false;
    private ignoreClickEvent = false;

    private dragSelectionData: DragSelectionData | null = null;

    constructor(props: Props) {
        super(props);

        this.scaleX = d3.scaleBand().padding(0.15).paddingOuter(0);
        this.scaleXForInversion = d3.scaleLinear();
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
        // Values are rendered above the selection for the tooltip
        return (
            <svg className="periodUsageGraph" id={`chart_${this.props.fieldName}`} ref={this.elementRef}>
                <g className="xAxis" />
                <g className="yAxis" />
                <g className="gridLines" />
                <g className="values" />
                <g className="selection">
                    <rect />
                </g>
            </svg>
        );
    }

    private initializeGraph() {
        const id = this.elementRef.current!.id;

        this.svg = d3
            .select("#" + id)
            .attr("viewBox", `0 0 ${width} ${height}`)
            .style("background-color", "white");

        addChartTitle(this.svg);

        this.svg.on("touchstart", (event: TouchEvent) => {
            if (event.touches.length === 1) {
                event.preventDefault();

                const touch = event.touches.item(0);

                if (!!touch) {
                    this.onDragStart(touch);
                }
            }
        });
        this.svg
            .on("mousedown", (event) => {
                event.preventDefault();

                this.onDragStart(event);
            })

            .on("touchmove", (event: TouchEvent) => {
                if (event.touches.length === 1) {
                    event.preventDefault();

                    const item = event.touches.item(0);

                    if (!!item) {
                        this.onDragMove(item);
                    }
                }
            })
            .on("mousemove", (event) => {
                event.preventDefault();

                this.onDragMove(event);
            })
            .on("touchend", () => {
                this.onDragEnd();
            })

            .on("mouseup", () => {
                this.onDragEnd();
            })

            .on("click", () => {
                if (this.ignoreClickEvent) {
                    return;
                }

                this.svg!.select("g.selection").select("rect").attr("display", "none");
                this.dragSelectionData = null;

                this.renderChartTitle(this.totalUsage());
                this.resetBarColors();
            });
    }

    private onDragStart = (item: Touch) => {
        this.mouseIsDown = true;

        const selectionStartPx = d3.pointer(item)[0];
        this.dragSelectionData = {
            selectionStartPx: selectionStartPx,
            selectionEndPx: selectionStartPx,
            previousSelectionStartBand: null,
            previousSelectionEndBand: null,
            previousSelectionRelevantIndexes: []
        };

        this.resetBarColors();
    };

    private onDragMove = (item: Touch) => {
        if (!this.mouseIsDown || !this.dragSelectionData) {
            return;
        }

        this.isDragging = true;
        this.dragSelectionData.selectionEndPx = d3.pointer(item)[0];

        const leftEdge = Math.min(this.dragSelectionData.selectionStartPx, this.dragSelectionData.selectionEndPx);
        const rightEdge = Math.max(this.dragSelectionData.selectionStartPx, this.dragSelectionData.selectionEndPx);

        this.svg!.select("g.selection")
            .select("rect")
            .attr("display", "block")
            .attr("x", leftEdge)
            .attr("y", padding.top)
            .attr("width", rightEdge - leftEdge)
            .attr("height", this.scaleY(0) - padding.top)
            .attr("fill", "rgba(128, 128, 128, 0.2)");

        const startBand = Math.max(-1, this.findBandForX(leftEdge, this.props.xOffset));
        const endBand = this.findBandForX(rightEdge, this.props.xOffset);

        if (
            startBand !== this.dragSelectionData.previousSelectionStartBand ||
            endBand !== this.dragSelectionData.previousSelectionEndBand
        ) {
            const relevantIndexes = this.calculateRelevantIndexesFromBands(startBand, endBand);

            const elementsToClear = d3.difference(
                this.dragSelectionData.previousSelectionRelevantIndexes,
                relevantIndexes
            );
            const elementsToFill = d3.difference(
                relevantIndexes,
                this.dragSelectionData.previousSelectionRelevantIndexes
            );

            const allBars = this.svg!.select("g.values").selectAll("rect");

            allBars.filter((_el, i) => elementsToClear.has(i)).attr("fill", this.props.color);
            allBars.filter((_el, i) => elementsToFill.has(i)).attr("fill", this.props.colorIntense);

            const total = this.calculateTotalFromBandIndexes(startBand, endBand);

            this.renderChartTitle(total);

            this.dragSelectionData.previousSelectionStartBand = startBand;
            this.dragSelectionData.previousSelectionEndBand = endBand;
            this.dragSelectionData.previousSelectionRelevantIndexes = relevantIndexes;
        }
    };

    private onDragEnd = () => {
        if (this.isDragging) {
            /* If the user clicks in the graph when we're not dragging, the selection should be hidden.
             * However, the click event also occurs after a mouseup and can't be easily prevented.
             *
             * Here, we set a variable that can be checked by the click event. The setTimeout
             * makes sure that it is only reset after the current event loop.
             */
            this.ignoreClickEvent = true;
            setTimeout(() => {
                this.ignoreClickEvent = false;
            }, 0);
        }

        this.isDragging = false;
        this.mouseIsDown = false;
    };

    private resetBarColors() {
        this.svg!.select("g.values").selectAll("rect").attr("fill", this.props.color);
    }

    private calculateRelevantIndexesFromBands(startBand: number, endBand: number) {
        if (startBand === -1 && endBand === -1) {
            return [];
        }

        return d3.range(startBand - 1, endBand);
    }

    private calculateTotalFromBandIndexes(startBand: number, endBand: number) {
        const relevantIndexes = this.calculateRelevantIndexesFromBands(startBand, endBand);

        return relevantIndexes.reduce((sum, index) => sum + this.processedData[index], 0);
    }

    private findBandForX(x: number, xOffset: GraphXOffset) {
        const factor = this.scaleXForInversion.invert(x) - 1;

        const numberOfBands = this.scaleX.domain().length;

        const interpolator = d3.interpolate(1, numberOfBands);

        const value = interpolator(factor);

        const offset = xOffset === "between_values" ? 1 : 0;

        return Math.floor(value - offset);
    }

    private renderGraph(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
        const domainNumeric = d3.range(1, this.processedData.length + 1);

        const domain = d3
            .range(this.props.xOffset === "between_values" ? 0 : 1, this.processedData.length + 1, 1)
            .map((el) => el.toString());

        this.scaleX.domain(domain).range([padding.left + axisWidth, width - padding.right]);
        this.scaleXForInversion
            .domain(domainNumeric)
            .range([padding.left + axisWidth, width - padding.right - padding.left]);
        this.scaleY.domain([0, this.props.maxY]).range([height - padding.bottom - axisHeight, padding.top]);

        this.updateAxes(svg);

        this.drawGridLines(svg);
        this.drawBars(svg, this.processedData);

        this.renderChartTitle(this.totalUsage());
    }

    private renderChartTitle(usage: number, extraText?: string) {
        const firstDataElement = this.props.data[0];

        const chartTitle = buildChartTitle(this.props.label, usage, this.props.fieldName, firstDataElement);
        this.svg!.select(".chartTitle").text(extraText ? `${chartTitle} (${extraText})` : chartTitle);
    }

    private clickBar = ({ target }: { target: SVGRectElement }) => {
        const index = parseInt(target.attributes.getNamedItem("index")!.value, 10);
        this.props.onClick(index);
    };

    private showTooltip = (event: any, value: number) => {
        if (this.mouseIsDown) {
            return;
        }

        const index = parseInt(event.target.attributes.getNamedItem("index")!.value, 10);
        const contents = this.buildTooltipContents(index, value);
        const tooltip = d3.select("#tooltip");

        tooltip
            .html(contents)
            .style("left", event.pageX + 20 + "px")
            .style("top", event.pageY - 58 + "px")
            .style("display", "block");
    };

    private hideTooltip = () => {
        const tooltip = d3.select("#tooltip");
        tooltip.style("display", "none");
    };

    private updateAxes(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
        this.xAxis.tickValues(buildTicks(this.processedData.length));

        svg.select(".xAxis")
            .attr("transform", `translate(0, ${this.scaleY(0)})`)
            .call(this.xAxis as any);
        svg.select(".yAxis")
            .attr("transform", `translate(${padding.left + axisWidth}, 0)`)
            .call(this.yAxis as any);
    }

    private drawGridLines(svg: d3.Selection<d3.BaseType, unknown, HTMLElement, any>) {
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
        svg.select("g.values")
            .selectAll("rect")
            .data(relativeData)
            .join("rect")
            .on("click", this.clickBar)
            .on("mouseenter", this.showTooltip)
            .on("mouseleave", this.hideTooltip)

            .attr("y", (el) => this.scaleY(el))
            .attr("height", (el) => this.scaleY(0) - this.scaleY(el))
            .attr("x", (_val, i) => this.calculateBarXPosition(i))
            .attr("width", this.scaleX.bandwidth())
            .attr("fill", this.props.color)
            .attr("index", (_d, i) => i);
    }

    private totalUsage() {
        const actualValues = this.dataForField().filter(isNotNull);

        return Math.max(...actualValues) - Math.min(...actualValues);
    }

    private calculateBarXPosition(i: number) {
        const shiftBars = this.props.xOffset === "between_values" ? this.scaleX.bandwidth() / 2 : 0;
        const pos = this.scaleX((i + 1).toString());

        return !!pos ? pos - shiftBars : 0;
    }

    private buildTooltipContents(index: number, value: number) {
        return `${this.props.tooltipLabelBuilder(index)}:<br />${value} ${unit(this.props.fieldName)}`;
    }

    private dataForField(): (number | null)[] {
        return this.props.data.map((u) => {
            return u?.[this.props.fieldName] ?? null;
        });
    }

    private get processedData(): number[] {
        const interpolatedData = interpolateArray(this.dataForField());
        const relativeData = convertToRelative(interpolatedData);
        const roundedData = relativeData.map((value) => truncate(value, 3));

        return roundedData;
    }
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
