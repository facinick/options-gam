import React, { useState, useRef, useEffect } from 'react';
import { LinePath, AreaClosed } from '@visx/shape';
import { curveLinear } from '@visx/curve';
import { scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { GridRows, GridColumns } from '@visx/grid';
import { Group } from '@visx/group';
import AddPositionPopup from './AddPositionPopup';

export interface DataPoint {
  strike: number;
  pnl: number;
}

interface OptionsChartProps {
  data: DataPoint[];
  strikePrice: number;
  width: number;
  height: number;
}

interface HoveredPoint {
  strike: number;
  pnl: number;
  x: number;
  y: number;
}

const STRIKE_PRICE_HOVER_RADIUS = 100; // Radius around strike price for hover

// Helper function to calculate distance between two points
const distance = (x1: number, y1: number, x2: number, y2: number) =>
  Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

const OptionsChart: React.FC<OptionsChartProps> = ({
  data,
  strikePrice,
  width,
  height,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<HoveredPoint | null>(null);
  const [isHoveringChart, setIsHoveringChart] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);

  if (width <= 0 || height <= 0) {
    return null;
  }


  // Define margins for the chart
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };

  // Calculate inner dimensions of the chart area
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Determine the min and max strike prices for the x-axis
  const minStrike = strikePrice - 1000;
  const maxStrike = strikePrice + 1000;

  // Define the x-scale for strike prices
  const xScale = scaleLinear({
    domain: [minStrike, maxStrike],
    range: [0, innerWidth],
  });

  // Determine min and max PnL for the y-axis, setting default to show some data
  const pnlValues = data.map((d) => d.pnl);
  const minPnl = Math.min(0, ...pnlValues);
  const maxPnl = Math.max(0, ...pnlValues);

  // Define the y-scale for PnL
  const yScale = scaleLinear({
    domain: [minPnl - 1000, maxPnl + 1000], // Add a little buffer so nothing touches the edges.
    range: [innerHeight, 0],
  });
  // we render this data under the axis
  const PNL_ZERO: DataPoint[] = [{ strike: minStrike, pnl: 0 }, { strike: maxStrike, pnl: 0 }];

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    const svg = event.currentTarget;

    const rect = svg.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    const chartMouseX = mouseX - margin.left; // Relative to chart's left edge
    const chartMouseY = mouseY - margin.top; // Relative to chart's top edge

    // Only search for a hovered point if the mouse is in the chart area
    if (
      chartMouseX >= 0 &&
      chartMouseX <= innerWidth &&
      chartMouseY >= 0 &&
      chartMouseY <= innerHeight
    ) {
      // Convert mouse position to strike price.
      const hoveredStrike = xScale.invert(chartMouseX);
      const nearestPoint = data.reduce(
        (prev, curr) => {
          const prevDist = distance(chartMouseX, chartMouseY, xScale(prev.strike) ?? 0, yScale(prev.pnl) ?? 0);
          const currDist = distance(chartMouseX, chartMouseY, xScale(curr.strike) ?? 0, yScale(curr.pnl) ?? 0);

          return currDist < prevDist ? curr : prev;
        },
        data[0]
      );
      const nearestStrike = nearestPoint.strike;

      // Calculate distance to the nearest point.
      const nearestPointX = xScale(nearestStrike) ?? 0;
      const nearestPointY = yScale(nearestPoint.pnl) ?? 0;
      const distToNearest = distance(chartMouseX, chartMouseY, nearestPointX, nearestPointY);

      // Only hover if the mouse is within the hover radius
      if (distToNearest < STRIKE_PRICE_HOVER_RADIUS) {
        setHoveredPoint({
          strike: nearestStrike,
          pnl: nearestPoint.pnl,
          x: mouseX,
          y: mouseY,
        });
      } else {
        setHoveredPoint(null);
      }
    } else {
      setHoveredPoint(null);
    }
  };

  useEffect(() => {
      // This is added because the x,y coords are relative to the window but we want them relative to the svg
  }, [hoveredPoint])

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setIsHoveringChart(false);
  };
  const handleMouseEnter = () => {
    setIsHoveringChart(true);
  };

  const closePopup = () => {
    setHoveredPoint(null);
  };

  return (
    <svg
    width={width}
    height={height}
    onMouseMove={handleMouseMove}
    onMouseLeave={handleMouseLeave}
    onMouseEnter={handleMouseEnter}
    ref={svgRef}
    >
    {isHoveringChart && hoveredPoint && (
      <AddPositionPopup
        x={
          Math.min(Math.max(hoveredPoint.x, margin.left + 20), width - 150)
        } // Keep it inside the svg, and give it a bit of margin
        y={
          Math.min(Math.max(hoveredPoint.y, margin.top + 20), height - 100)
        } // Keep it inside the svg, and give it a bit of margin
        onClose={closePopup}
      />
    )}

    <Group top={margin.top} left={margin.left}>
      <GridRows
        scale={yScale}
        width={innerWidth}
        height={innerHeight}
        stroke="lightgray"
      />
      <GridColumns
        scale={xScale}
        width={innerWidth}
        height={innerHeight}
        stroke="lightgray"
      />
      {/* this data shows the PNL = 0 line */}

      <LinePath
        data={PNL_ZERO}
        x={(d) => xScale(d.strike) ?? 0}
        y={(d) => yScale(d.pnl) ?? 0}
        stroke="lightgray"
        strokeWidth={2}
        shapeRendering="geometricPrecision"
      />
      {/* Render the area under the chart */}
      {data.length > 0 && (
        <AreaClosed
            data={data}
            x={(d) => xScale(d.strike) ?? 0}
            y={(d) => yScale(d.pnl) ?? 0}
            yScale={yScale}
            y0={yScale(0)}
            fill="rgba(0, 128, 0, 0.3)"
            curve={curveLinear}
          />
      )}

      {/* Render the main chart line */}
      {data.length > 0 && (
        <LinePath
            data={data}
            x={(d) => xScale(d.strike) ?? 0}
            y={(d) => yScale(d.pnl) ?? 0}
            stroke="green"

            strokeWidth={2}
        shapeRendering="geometricPrecision"
        />
      )}

      {/* Render the x-axis */}
      <AxisBottom
        top={innerHeight}
        scale={xScale}
        numTicks={10}
        tickLabelProps={() => ({
          fill: 'black',
          fontSize: 10,
          textAnchor: 'middle',
        })}
      />

      {/* Render the y-axis */}
      <AxisLeft
        scale={yScale}
        numTicks={5}
        tickLabelProps={() => ({
          fill: 'black',
          fontSize: 10,
          textAnchor: 'end',
        })}
      />
    </Group>
    </svg>
  );
};

export default OptionsChart;
