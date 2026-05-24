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

      {ticks.map(({ value, xOffset }) => (
        <g key={value} transform={`translate(${xOffset}, 0)`}>
          {/* Tick mark */}
          <line y1={0} y2={-6} stroke="#636363" strokeWidth={1} />

          {/* Grid line extending downward */}
          <line
            y1={0}
            y2={innerHeight}
            stroke="#e0e0e0"
            strokeWidth={1}
            strokeDasharray="4,4"
          />

          {/* Tick label */}
          <text
            y={-12}
            textAnchor="middle"
            style={{
              fontSize: "11px",
              fontFamily: "sans-serif",
              fill: "#636363",
            }}
          >
            {tickFormat ? tickFormat(value) : value}
          </text>
        </g>
      ))}
    </g>
  );
};
