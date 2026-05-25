import React, { useMemo } from "react";

export const AxisTop = ({ xScale, innerHeight, tickFormat }) => {
  const ticks = useMemo(() => {
    return xScale.ticks(6).map((value) => ({
      value,
      xOffset: xScale(value),
    }));
  }, [xScale]);

  return (
    <g>
      {/* Axis line */}
      <line
        x1={xScale.range()[0]}
        x2={xScale.range()[1]}
        y1={0}
        y2={0}
        stroke="#636363"
        strokeWidth={1}
      />

      {ticks.map(({ value, xOffset }) => {
        const isMajor = Number.isInteger(Math.log10(value));
        const opacity = isMajor ? 1 : 0.0;
        const tickOpacity = isMajor ? 1 : 0.8;
        const labelOpacity = isMajor ? 1 : 0.2; // completely hides minor labels

        return (
          <g key={value} transform={`translate(${xOffset}, 0)`}>
            {/* Tick mark */}
            <line
              y1={0}
              y2={-6}
              stroke="#636363"
              strokeWidth={1}
              opacity={tickOpacity}
            />

            {/* Grid line */}
            <line
              y1={0}
              y2={innerHeight}
              stroke="#e0e0e0"
              strokeWidth={1}
              strokeDasharray="4,4"
              opacity={tickOpacity}
            />

            {/* Tick label */}
            <text
              y={-12}
              textAnchor="middle"
              style={{
                fontSize: "11px",
                fontFamily: "sans-serif",
                fill: "#636363",
                opacity: opacity,
              }}
            >
              {tickFormat ? tickFormat(value) : value}
            </text>
          </g>
        );
      })}
    </g>
  );
};
