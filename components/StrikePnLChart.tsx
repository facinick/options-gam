"use client";

import { Button } from "@/components/ui/button";
import { useAddPosition, useGetAvailableStrikes, useGetCMP, useGetUser } from "@/lib/api";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Group } from "@visx/group";
import { scaleLinear } from "@visx/scale";
import { Circle, LinePath } from "@visx/shape";
import React, { useEffect, useRef, useState } from "react";

// Chart margins and fixed height
const height = 400;
const margin = { top: 40, right: 40, bottom: 40, left: 60 };

// How close (in px) the mouse must be to a strike price to trigger the popover
const STRIKE_HOVER_RADIUS = 24;

/**
 * StrikePnLChart displays a base chart with strike prices on the x-axis (centered around CMP)
 * and PnL on the y-axis (left side). Uses visx for rendering.
 * Accessible, responsive, and ready for extensibility.
 */
const StrikePnLChart: React.FC<{ underlyingId: string }> = ({ underlyingId }) => {
  const { data: cmpData } = useGetCMP(underlyingId);
  const cmp = cmpData?.cmp;

  // Fetch available strikes (x axis)
  const { data: availableStrikes } = useGetAvailableStrikes(underlyingId, cmp);

  // Fetch user data (positions, bank balance)
  const { data: userData } = useGetUser();
  const positions = userData?.positions;

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

  // Fetch positions from backend
  const addPosition = useAddPosition();

  // Transform positions to chart data: group by strike, sum PnL for each strike
  const chartData = React.useMemo(() => {
    if (!positions) return [];
    // Group by strike
    const map = new Map<number, number>();
    for (const pos of positions) {
      // For demo, treat net_price as PnL (real logic may differ)
      map.set(pos.strike, (map.get(pos.strike) || 0) + (pos.transaction_type === 'BUY' ? -pos.net_price : pos.net_price));
    }
    return Array.from(map.entries()).map(([strike, pnl]) => ({ strike, pnl }));
  }, [positions]);

  // Use available strikes for x axis, and merge with chartData for PnL
  const xValues = React.useMemo(() => {
    if (!availableStrikes) return [];
    return availableStrikes.slice().sort((a, b) => a - b);
  }, [availableStrikes]);

  // Map strike to PnL (default 0 if not present)
  const strikeToPnl = React.useMemo(() => {
    const map = new Map<number, number>();
    for (const d of chartData) map.set(d.strike, d.pnl);
    return map;
  }, [chartData]);

  // Chart data for all available strikes
  const mergedChartData = React.useMemo(() => {
    return xValues.map((strike) => ({ strike, pnl: strikeToPnl.get(strike) ?? 0 }));
  }, [xValues, strikeToPnl]);

  const yValues = mergedChartData.map((d) => d.pnl);

  // Scales
  const xScale = scaleLinear<number>({
    domain: xValues.length > 0 ? [xValues[0], xValues[xValues.length - 1]] : [0, 1],
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

  // Find the closest strike price to a given x pixel (use available strikes)
  function getClosestStrike(mouseX: number): { strike: number; x: number } | null {
    if (!xValues.length) return null;
    let minDist = Infinity;
    let closest: { strike: number; x: number } | null = null;
    for (const strike of xValues) {
      const sx = xScale(strike);
      const dist = Math.abs(mouseX - sx);
      if (dist < minDist) {
        minDist = dist;
        closest = { strike, x: sx };
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
  function CustomXAxisTick({ x, y, formattedValue }: { x?: number; y?: number; formattedValue?: string }): React.ReactNode {
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
  }

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
              tickComponent={CustomXAxisTick}
              labelProps={{
                fontSize: 14,
                fill: '#222',
                textAnchor: 'middle',
                dy: -28,
              }}
              stroke="#888"
              tickStroke="#888"
              hideAxisLine={false}
              hideTicks={true}
            />
            {/* PnL Line */}
            <LinePath
              data={mergedChartData}
              x={(d) => xScale(d.strike)}
              y={(d) => yScale(d.pnl)}
              stroke="#2563eb"
              strokeWidth={2}
            />
            {/* Dots for each point */}
            {mergedChartData.map((d) => (
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
            {cmp && (
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
            )}
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
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => addPosition.mutate({ strike: popover.strike!, instrument_type: 'CE', transaction_type: 'BUY', net_quantity: 1, net_price: 100, expiry: { date: 1, month: 1, year: 2026 }, underlyingId, timestamp: new Date().toISOString() })}>BUY CE</Button>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => addPosition.mutate({ strike: popover.strike!, instrument_type: 'PE', transaction_type: 'BUY', net_quantity: 1, net_price: 100, expiry: { date: 1, month: 1, year: 2026 }, underlyingId, timestamp: new Date().toISOString() })}>BUY PE</Button>
            </div>
            {/* Divider at x axis (invisible, just for spacing) */}
            <div style={{ height: 0, width: '100%' }} />
            {/* Bottom buttons: SELL PE/CE */}
            <div className="flex flex-col gap-1 mt-2">
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => addPosition.mutate({ strike: popover.strike!, instrument_type: 'PE', transaction_type: 'SELL', net_quantity: 1, net_price: 100, expiry: { date: 1, month: 1, year: 2026 }, underlyingId, timestamp: new Date().toISOString() })}>SELL PE</Button>
              <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" onClick={() => addPosition.mutate({ strike: popover.strike!, instrument_type: 'CE', transaction_type: 'SELL', net_quantity: 1, net_price: 100, expiry: { date: 1, month: 1, year: 2026 }, underlyingId, timestamp: new Date().toISOString() })}>SELL CE</Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StrikePnLChart; 