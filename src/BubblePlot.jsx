import React, { useMemo } from "react";
import {
  scaleLog,
  scaleLinear,
  scaleSqrt,
  scaleOrdinal,
  extent,
  format,
} from "d3";
import { data } from "./gapminder";
import { AxisTop } from "./AxisTop";
import { AxisLeft } from "./AxisLeft";

// ---------- Dimensions ----------
const width = 960;
const height = 700;
const margin = { top: 185, right: 40, bottom: 60, left: 90 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// ---------- Continent color palette ----------
const continentColors = {
  Africa: "#E69F00 ",
  Americas: "#009E73  ",
  Asia: "#D55E00",
  Europe: "#0072B2 ",
  Oceania: "#CC79A7 ",
};

const continents = Object.keys(continentColors);

// ---------- Formatters ----------
const xTickFormat = (d) => {
  if (d >= 1000) return `${format(",")(d / 1000)}k`;
  return format(",")(d);
};

const BubblePlot = () => {
  // Build scales using D3
  const xScale = useMemo(
    () =>
      scaleLog()
        .domain(extent(data, (d) => d.gdpPercap))
        .range([0, innerWidth])
        .nice(),
    [],
  );

  const yScale = useMemo(
    () =>
      scaleLinear()
        .domain(extent(data, (d) => d.lifeExp))
        .range([innerHeight, 0])
        .nice(),
    [],
  );

  const rScale = useMemo(
    () =>
      scaleSqrt()
        .domain(extent(data, (d) => d.pop))
        .range([3, 40]),
    [],
  );

  const colorScale = useMemo(
    () =>
      scaleOrdinal()
        .domain(continents)
        .range(continents.map((c) => continentColors[c])),
    [],
  );

  // Sort so smaller bubbles render on top of larger ones
  const sortedData = useMemo(() => [...data].sort((a, b) => b.pop - a.pop), []);

  return (
    <svg
      width={width}
      height={height}
      style={{ fontFamily: "sans-serif", background: "#fafafa" }}
    >
      {/* Chart title */}
      <text
        x={width / 2}
        y={22}
        textAnchor="middle"
        style={{ fontSize: "18px", fontWeight: 600, fill: "#333" }}
      >
        Gapminder: GDP per Capita vs Life Expectancy
      </text>

      {/* Introduction & Description */}
      <foreignObject x={margin.left} y={28} width={innerWidth} height={100}>
        <div
          xmlns="http://www.w3.org/1999/xhtml"
          style={{
            fontsize: "11px",
            fontfamily: "sans-serif",
            color: "#666",
            textAlign: "left",
            lineHeight: "1.4",
            paddingTop: "10px",
          }}
        >
          This vizualization provides an exploration of global development
          indicators, such as life expectancy, GDP per capita, and population
          size across various countries and regions. A logarithmic scale is
          employed for GDP per capita to effectively manage the wide range of
          values, allowing for clearer comparisons between nations with vastly
          different economic outputs.
        </div>
      </foreignObject>

      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Axes */}
        <AxisTop
          xScale={xScale}
          innerHeight={innerHeight}
          tickFormat={xTickFormat}
        />
        <AxisLeft yScale={yScale} innerWidth={innerWidth} />

        {/* X-axis label (top) */}
        <text
          x={innerWidth / 2}
          y={-40}
          textAnchor="middle"
          style={{ fontSize: "13px", fill: "#333", fontWeight: 500 }}
        >
          GDP per Capita (USD, log scale)
        </text>

        {/* Y-axis label */}
        <text
          transform={`translate(${-60}, ${innerHeight / 2}) rotate(-90)`}
          textAnchor="middle"
          style={{ fontSize: "13px", fill: "#333", fontWeight: 500 }}
        >
          Life Expectancy (years)
        </text>

        {/* Bubbles */}
        {sortedData.map((d) => (
          <circle
            key={d.country}
            cx={xScale(d.gdpPercap)}
            cy={yScale(d.lifeExp)}
            r={rScale(d.pop)}
            fill={colorScale(d.continent)}
            fillOpacity={0.65}
            stroke={colorScale(d.continent)}
            strokeWidth={1}
            strokeOpacity={0.9}
          >
            <title>
              {`${d.country}\nContinent: ${d.continent}\nLife Exp: ${d.lifeExp.toFixed(1)} yrs\nGDP/cap: $${format(",.0f")(d.gdpPercap)}\nPop: ${format(",")(d.pop)}`}
            </title>
          </circle>
        ))}

        {/* ---------- Legend ---------- */}
        <g transform={`translate(${innerWidth - 140}, ${innerHeight - 130})`}>
          <rect
            x={-12}
            y={-16}
            width={160}
            height={continents.length * 22 + 12}
            fill="white"
            fillOpacity={0.85}
            stroke="#ccc"
            rx={4}
          />
          {continents.map((continent, i) => (
            <g key={continent} transform={`translate(0, ${i * 22})`}>
              <circle
                cx={0}
                cy={0}
                r={6}
                fill={continentColors[continent]}
                fillOpacity={0.75}
              />
              <text
                x={14}
                dy="0.35em"
                style={{ fontSize: "12px", fill: "#333" }}
              >
                {continent}
              </text>
            </g>
          ))}
        </g>

        {(() => {
          const largestPerContinent = continents.map((continent) => {
            return data
              .filter((d) => d.continent === continent)
              .sort((a, b) => b.pop - a.pop)[0];
          });

          // Compute initial label positions
          const labels = largestPerContinent.map((d) => {
            const cx = xScale(d.gdpPercap);
            const cy = yScale(d.lifeExp);
            const r = rScale(d.pop);
            const displayName =
              d.country === "United States" ? "USA" : d.country;

            return {
              ...d,
              cx,
              cy,
              r,
              labelX: cx,
              labelY: cy - r - 10,
              displayName,
              width: displayName.length * 6.5, // approximate text width
              height: 14, // approximate text height
            };
          });

          // Simple iterative repulsion — push overlapping labels apart
          const iterations = 50;
          for (let iter = 0; iter < iterations; iter++) {
            for (let i = 0; i < labels.length; i++) {
              for (let j = i + 1; j < labels.length; j++) {
                const a = labels[i];
                const b = labels[j];

                const overlapX =
                  a.width / 2 + b.width / 2 + 6 - Math.abs(a.labelX - b.labelX);
                const overlapY =
                  a.height / 2 +
                  b.height / 2 +
                  2 -
                  Math.abs(a.labelY - b.labelY);

                if (overlapX > 0 && overlapY > 0) {
                  // Push apart on whichever axis has less overlap
                  if (overlapX < overlapY) {
                    const pushX = overlapX / 2 + 1;
                    if (a.labelX < b.labelX) {
                      a.labelX -= pushX;
                      b.labelX += pushX;
                    } else {
                      a.labelX += pushX;
                      b.labelX -= pushX;
                    }
                  } else {
                    const pushY = overlapY / 2 + 1;
                    if (a.labelY < b.labelY) {
                      a.labelY -= pushY;
                      b.labelY += pushY;
                    } else {
                      a.labelY += pushY;
                      b.labelY -= pushY;
                    }
                  }
                }
              }
            }
          }

          return labels.map((d) => (
            <g key={d.country}>
              {/* Leader line */}
              <line
                x1={d.cx}
                y1={d.cy - d.r}
                x2={d.labelX}
                y2={d.labelY + 4}
                stroke="#999"
                strokeWidth={0.75}
              />
              {/* White halo */}
              <text
                x={d.labelX}
                y={d.labelY}
                textAnchor="middle"
                style={{
                  fontSize: "10px",
                  fontFamily: "sans-serif",
                  fontWeight: 500,
                  stroke: "white",
                  strokeWidth: 3,
                  strokeLinejoin: "round",
                  fill: "white",
                  pointerEvents: "none",
                }}
              >
                {d.displayName}
              </text>
              {/* Label */}
              <text
                x={d.labelX}
                y={d.labelY}
                textAnchor="middle"
                style={{
                  fontSize: "10px",
                  fontFamily: "sans-serif",
                  fill: "#333",
                  fontWeight: 500,
                  pointerEvents: "none",
                }}
              >
                {d.displayName}
              </text>
            </g>
          ));
        })()}

        {/* ---------- Population size legend ---------- */}
        <g transform={`translate(${innerWidth - 140}, ${innerHeight - 240})`}>
          <text
            y={-50}
            style={{ fontSize: "11px", fill: "#636363", fontWeight: 500 }}
          >
            Population
          </text>
          {[10_000_000, 100_000_000, 500_000_000].map((popVal, i) => {
            const r = rScale(popVal);
            return (
              <g key={popVal} transform={`translate(${i * 48}, 0)`}>
                <circle
                  cx={0}
                  cy={-r / 2}
                  r={r}
                  fill="none"
                  stroke="#999"
                  strokeWidth={1}
                />
                <text
                  y={r / 2 + 14}
                  textAnchor="middle"
                  style={{ fontSize: "9px", fill: "#999" }}
                >
                  {popVal >= 1_000_000
                    ? `${popVal / 1_000_000}M`
                    : format(",")(popVal)}
                </text>
              </g>
            );
          })}
        </g>
      </g>
      {/* Sources & Credits */}
      <text
        x={width / 2}
        y={height - 8}
        textAnchor="middle"
        style={{
          fontSize: "10px",
          fontFamily: "sans-serif",
          fill: "#999",
        }}
      >
        Source: Based on free material from GAPMINDER.ORG, CC-BY LICENSE |
        Visualization by Jeremiah King as part of D3 Loves React course taught
        by Yan Holtz
      </text>
    </svg>
  );
};

export default BubblePlot;
