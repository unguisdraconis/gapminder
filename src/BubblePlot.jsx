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
const height = 600;
const margin = { top: 100, right: 40, bottom: 60, left: 90 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

// ---------- Continent color palette ----------
const continentColors = {
  Africa: "#e6854a",
  Americas: "#4daf4a",
  Asia: "#e04b5a",
  Europe: "#377eb8",
  Oceania: "#984ea3",
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
        Visualization by Jeremiah King
      </text>
    </svg>
  );
};

export default BubblePlot;
