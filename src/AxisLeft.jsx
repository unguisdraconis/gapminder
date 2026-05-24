import React, { useMemo } from "react";

export const AxisLeft = ({ yScale, innerWidth, tickFormat }) => {
  const ticks = useMemo(() => {
    return yScale.ticks(8).map((value) => ({
      value,
      yOffset: yScale(value),
    }));
  }, [yScale]);

  return (
    <g>
      {/* Axis line */}
      <line
        x1={0}
        x2={0}
        y1={yScale.range()[0]}
        y2={yScale.range()[1]}
        stroke="#636363"
        strokeWidth={1}
      />

      {ticks.map(({ value, yOffset }) => (
        <g key={value} transform={`translate(0, ${yOffset})`}>
          {/* Tick mark */}
          <line x1={0} x2={-6} stroke="#636363" strokeWidth={1} />

          {/* Grid line extending to the right */}
          <line
            x1={0}
            x2={innerWidth}
            stroke="#e0e0e0"
            strokeWidth={1}
            strokeDasharray="4,4"
          />

          {/* Tick label */}
          <text
            x={-12}
            dy="0.32em"
            textAnchor="end"
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
