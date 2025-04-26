"use client";

import { Button } from "@/components/ui/button";
import { useGetCMP } from "@/lib/api";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle, LinePath } from "@visx/shape";
import React, { useEffect, useRef, useState } from "react";

// Chart margins and fixed height
const height = 400;
const margin = { top: 40, right: 40, bottom: 40, left: 60 };

// Mock data: strike prices and corresponding PnL values
const mockData = [
  { strike: 10000, pnl: -200 },
  { strike: 10150, pnl: -100 },
  { strike: 10300, pnl: 0 },
  { strike: 10450, pnl: 150 },
  { strike: 10600, pnl: 300 },
  { strike: 10750, pnl: 200 },
  { strike: 10900, pnl: 0 },
  { strike: 11050, pnl: -100 },
  { strike: 11200, pnl: -250 },
];

// How close (in px) the mouse must be to a strike price to trigger the popover
const STRIKE_HOVER_RADIUS = 24;

/**
 * StrikePnLChart displays a base chart with strike prices on the x-axis (centered around CMP)
 * and PnL on the y-axis (left side). Uses visx for rendering.
 * Accessible, responsive, and ready for extensibility.
 */
const StrikePnLChart: React.FC = () => {
  const { data: cmpData } = useGetCMP();
  const cmp = cmpData?.cmp ?? 10600; // fallback to a value if loading

  // Responsive width
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(600);
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new window.ResizeObserver(() => {
      setWidth(containerRef.current!.offsetWidth);
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Center the x axis ticks around CMP
  const sortedData = [...mockData].sort((a, b) => a.strike - b.strike);
  const xValues = sortedData.map((d) => d.strike);
  const yValues = sortedData.map((d) => d.pnl);

  // Scales
  const xScale = scaleLinear<number>({
    domain: [xValues[0], xValues[xValues.length - 1]],
    range: [margin.left, width - margin.right],
  });
  const yMin = Math.min(...yValues, 0);
  const yMax = Math.max(...yValues, 0);
  const yScale = scaleLinear<number>({
    domain: [yMin - 50, yMax + 50],
    range: [height - margin.bottom, margin.top],
  });

  // Find y=0 position for x axis
  const zeroY = yScale(0);

  // Popover state
  const [popover, setPopover] = useState<{
    open: boolean;
    x: number;
    y: number;
    strike: number | null;
  }>({ open: false, x: 0, y: 0, strike: null });
  const svgRef = useRef<SVGSVGElement>(null);
  const popoverTimeout = useRef<NodeJS.Timeout | null>(null);

  // Find the closest strike price to a given x pixel
  function getClosestStrike(mouseX: number): { strike: number; x: number } | null {
    let minDist = Infinity;
    let closest: { strike: number; x: number } | null = null;
    for (const d of sortedData) {
      const sx = xScale(d.strike);
      const dist = Math.abs(mouseX - sx);
      if (dist < minDist) {
        minDist = dist;
        closest = { strike: d.strike, x: sx };
      }
    }
    if (minDist <= STRIKE_HOVER_RADIUS) return closest;
    return null;
  }

  // Mouse move handler for the SVG
  function handleMouseMove(e: React.MouseEvent<SVGSVGElement, MouseEvent>) {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    // Only trigger popover if mouse is near the x axis (within 32px vertically)
    if (Math.abs(mouseY - zeroY) > 32) {
      if (popover.open) setPopover((p) => ({ ...p, open: false }));
      return;
    }
    const closest = getClosestStrike(mouseX);
    if (closest) {
      if (!popover.open || popover.strike !== closest.strike) {
        setPopover({ open: true, x: closest.x, y: zeroY, strike: closest.strike });
      }
    } else {
      if (popover.open) setPopover((p) => ({ ...p, open: false }));
    }
  }

  // Hide popover when mouse leaves SVG or popover
  function handleMouseLeave() {
    popoverTimeout.current = setTimeout(() => {
      setPopover((p) => ({ ...p, open: false }));
    }, 80);
  }
  function handlePopoverEnter() {
    if (popoverTimeout.current) clearTimeout(popoverTimeout.current);
  }
  function handlePopoverLeave() {
    setPopover((p) => ({ ...p, open: false }));
  }

  // Custom tick label for x axis with white background
  const CustomXAxisTick = ({ x, y, formattedValue }: { x?: number; y?: number; formattedValue?: string }) => {
    if (x === undefined || y === undefined || !formattedValue) return null;
    const rectHeight = 22;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={-rectHeight / 2}
          fontSize={12}
          fill="#222"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fontWeight: 600 }}
        >
          {formattedValue}
        </text>
      </g>
    );
  };

  return (
    <section aria-label="Strike Price vs PnL Chart" className="w-full max-w-7xl mx-auto my-8">
      <h2 className="text-xl font-semibold mb-4">PnL vs Strike Price</h2>
      <div
        ref={containerRef}
        role="img"
        aria-label="PnL versus Strike Price chart"
        className="bg-white rounded shadow border w-full"
        style={{ height, position: "relative", minWidth: 320 }}
      >
        <svg
          ref={svgRef}
          width={width}
          height={height}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ cursor: "pointer", width: "100%", height }}
        >
          <Group>
            {/* Y Axis */}
            <AxisLeft
              scale={yScale}
              left={margin.left}
              top={0}
              label="PnL"
              tickLabelProps={() => ({
                fontSize: 12,
                fill: '#222',
                dx: -4,
                dy: 0,
                textAnchor: 'end',
              })}
              labelProps={{
                fontSize: 14,
                fill: '#222',
                textAnchor: 'middle',
                fontWeight: 600,
                dy: -30,
              }}
              stroke="#888"
              tickStroke="#888"
            />
            {/* X Axis at y=0 (centered) */}
            <AxisBottom
              scale={xScale}
              top={zeroY}
              left={0}
              label=""
              tickValues={xValues}
              tickFormat={(v) => v.toString()}
              tickComponent={CustomXAxisTick as any}
              labelProps={{
                fontSize: 14,
                fill: '#222',
                textAnchor: 'middle',
                dy: -28,
              }}
              hideAxisLine={false}
              hideTicks={true}
            />
            {/* PnL Line */}
            <LinePath
              data={sortedData}
              x={(d) => xScale(d.strike)}
              y={(d) => yScale(d.pnl)}
              stroke="#2563eb"
              strokeWidth={2}
            />
            {/* Dots for each point */}
            {sortedData.map((d) => (
              <Circle
                key={d.strike}
                cx={xScale(d.strike)}
                cy={yScale(d.pnl)}
                r={4}
                fill="#fff"
                stroke="#2563eb"
                strokeWidth={2}
                aria-label={`Strike ${d.strike}, PnL ${d.pnl}`}
              />
            ))}
            {/* Highlight CMP with a vertical line */}
            <line
              x1={xScale(cmp)}
              x2={xScale(cmp)}
              y1={margin.top}
              y2={height - margin.bottom}
              stroke="#f59e42"
              strokeDasharray="4 2"
              strokeWidth={2}
              aria-label="Current Market Price"
            />
          </Group>
        </svg>
        {/* Popover for strike price actions */}
        {popover.open && popover.strike !== null && (
          <div
            style={{
              position: "absolute",
              left: popover.x,
              top: popover.y,
              transform: "translate(-50%, -50%)",
              zIndex: 10,
              pointerEvents: "auto",
            }}
            onMouseEnter={handlePopoverEnter}
            onMouseLeave={handlePopoverLeave}
            tabIndex={-1}
            aria-label={`Actions for strike price ${popover.strike}`}
            className="min-w-32 flex flex-col items-center"
          >
            {/* Popover background with opacity */}
            <div
              className="absolute inset-0 rounded"
              style={{
                background: "rgba(255,255,255,0)",
                zIndex: -1,
              }}
              aria-hidden="true"
            />
            {/* Top buttons: BUY CE/PE */}
            <div className="flex flex-col gap-1 mb-2">
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => alert(`BUY CE @ ${popover.strike}`)}>BUY CE</Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => alert(`BUY PE @ ${popover.strike}`)}>BUY PE</Button>
            </div>
            {/* Divider at x axis (invisible, just for spacing) */}
            <div style={{ height: 15, width: '100%' }} />
            {/* Bottom buttons: SELL PE/CE */}
            <div className="flex flex-col gap-1 mt-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => alert(`SELL PE @ ${popover.strike}`)}>SELL PE</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => alert(`SELL CE @ ${popover.strike}`)}>SELL CE</Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StrikePnLChart; 