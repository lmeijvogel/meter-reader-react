import * as d3 from "d3";
import * as React from "react";
import { useEffect } from "react";

import { observer } from "mobx-react";

import { Color } from "../lib/Colors";

import { RecentUsageGraphsStore } from "../stores/RecentUsageGraphsStore";

const RecentUsageGraphs = observer(
    class RecentUsageGraphs extends React.Component {
        private readonly store: RecentUsageGraphsStore;

        constructor(props: {}) {
            super(props);

            this.store = new RecentUsageGraphsStore();
        }

        componentDidMount() {
            this.store.fetchData();
        }

        render() {
            return (
                <div className="recentUsageGraphs">
                    <RecentUsageGraph id="recentStroom" store={this.store} field={"stroom"} color={Color.stroom} />
                    <RecentUsageGraph id="recentWater" store={this.store} field={"water"} color={Color.water} />
                </div>
            );
        }
    }
);

type GraphProps = {
    id: string;
    store: RecentUsageGraphsStore;
    field: "stroom" | "water";
    color: string;
};

const RecentUsageGraph = observer(function RecentUsageGraph({ id, store, field, color }: GraphProps) {
    const width = 350;
    const height = 250;

    const padding = {
        top: 10,
        right: 10,
        bottom: 20,
        left: 40
    };

    const data = field === "stroom" ? store.stroomData() : store.waterData();
    const labels = store.labels();

    useEffect(() => {
        const yScale = d3
            .scaleLinear()
            .domain([0, d3.max(data) ?? 1])
            .range([height - padding.bottom, padding.top]);

        const xScale = d3
            .scaleBand()
            .domain(d3.range(0, labels.length - 1).map((n) => n.toString()))
            .range([padding.left, width - padding.right])
            .padding(0.15);

        const xAxis = d3.axisBottom(xScale).tickFormat((_val, i) => (i % 2 === 0 ? labels[i] : ""));
        const yAxis = d3.axisLeft(yScale);

        const svg = d3
            .select("#" + id)
            .attr("width", width)
            .attr("height", height)
            .style("background-color", "white");

        svg.selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", (_el, i) => xScale(i.toString()) ?? 0)
            .attr("y", (el) => yScale(el))
            .attr("width", xScale.bandwidth())
            .attr("height", (el) => height - padding.bottom - yScale(el))
            .attr("fill", color);

        svg.select("g.x-axis").remove();

        svg.append("g")
            .attr("class", "x-axis")
            .call(xAxis)
            .attr("transform", `translate(0, ${height - padding.bottom})`);

        svg.select("g.y-axis").remove();
        svg.append("g").attr("class", "y-axis").call(yAxis).attr("transform", `translate(${padding.left}, 0)`);
    });

    return (
        <div>
            <svg id={id} />
        </div>
    );
});

export { RecentUsageGraphs };
