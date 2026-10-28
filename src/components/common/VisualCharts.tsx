'use client';

import React, { useState } from 'react';
import { Box, Typography, Paper, Tooltip, useTheme } from '@mui/material';

// --- 1. Area Trend Chart (SVG) ---
interface AreaTrendChartProps {
  data: { date: string; registrations: number }[];
  height?: number;
}

export const AreaTrendChart: React.FC<AreaTrendChartProps> = ({ data, height = 240 }) => {
  const theme = useTheme();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No registration data recorded yet
        </Typography>
      </Box>
    );
  }

  const values = data.map((d) => d.registrations);
  const maxVal = Math.max(...values, 5);
  const paddingX = 40;
  const paddingY = 30;
  const chartWidth = 600;
  const chartHeight = height;

  const points = data.map((d, i) => {
    const x = paddingX + (i / Math.max(data.length - 1, 1)) * (chartWidth - 2 * paddingX);
    const y = chartHeight - paddingY - (d.registrations / maxVal) * (chartHeight - 2 * paddingY);
    return { x, y, ...d };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <Box sx={{ width: '100%', position: 'relative' }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1556A3" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1556A3" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal gridlines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
          const y = chartHeight - paddingY - ratio * (chartHeight - 2 * paddingY);
          const val = Math.round(ratio * maxVal);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke={
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                }
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill={theme.palette.text.secondary}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Filled gradient area */}
        <path d={areaD} fill="url(#areaGradient)" />

        {/* Smooth stroke line */}
        <path d={pathD} fill="none" stroke="#1556A3" strokeWidth="2.5" />

        {/* Data points */}
        {points.map((pt, i) => (
          <g
            key={i}
            onMouseEnter={() => setHoverIndex(i)}
            onMouseLeave={() => setHoverIndex(null)}
            style={{ cursor: 'pointer' }}
          >
            <circle
              cx={pt.x}
              cy={pt.y}
              r={hoverIndex === i ? 6 : 4}
              fill="#ffffff"
              stroke="#1556A3"
              strokeWidth="2.5"
            />
            {/* X-axis labels */}
            <text
              x={pt.x}
              y={chartHeight - 10}
              textAnchor="middle"
              fontSize="10"
              fontWeight={hoverIndex === i ? 700 : 400}
              fill={hoverIndex === i ? '#1556A3' : theme.palette.text.secondary}
            >
              {pt.date}
            </text>
            {/* Value tooltip label on hover */}
            {hoverIndex === i && (
              <g>
                <rect x={pt.x - 24} y={pt.y - 30} width="48" height="22" rx="4" fill="#111c2e" />
                <text
                  x={pt.x}
                  y={pt.y - 15}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight="bold"
                  fill="#ffffff"
                >
                  {pt.registrations}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </Box>
  );
};

// --- 2. Bar Chart Component (SVG) ---
interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
}

export const BarChartComponent: React.FC<BarChartProps> = ({
  data,
  height = 240,
  barColor = '#1556A3',
}) => {
  const theme = useTheme();
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No records found
        </Typography>
      </Box>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 5);
  const chartWidth = 500;
  const paddingX = 40;
  const paddingBottom = 40;
  const paddingTop = 20;

  const availableWidth = chartWidth - 2 * paddingX;
  const barWidth = Math.min(availableWidth / data.length - 12, 40);

  return (
    <Box sx={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${chartWidth} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
      >
        {/* Horizontal gridlines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = height - paddingBottom - ratio * (height - paddingBottom - paddingTop);
          const val = Math.round(ratio * maxVal);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke={
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                }
                strokeDasharray="4 4"
              />
              <text
                x={paddingX - 8}
                y={y + 4}
                textAnchor="end"
                fontSize="10"
                fill={theme.palette.text.secondary}
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, i) => {
          const x =
            paddingX +
            i * (availableWidth / data.length) +
            (availableWidth / data.length - barWidth) / 2;
          const barHeight = (item.value / maxVal) * (height - paddingBottom - paddingTop);
          const y = height - paddingBottom - barHeight;
          const isHovered = hoverIndex === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
              style={{ cursor: 'pointer' }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(barHeight, 2)}
                rx="4"
                fill={isHovered ? '#198847' : barColor}
                opacity={isHovered ? 1 : 0.85}
                style={{ transition: 'all 0.2s' }}
              />
              {/* Value text above bar */}
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                fontSize="11"
                fontWeight={600}
                fill={theme.palette.text.primary}
              >
                {item.value}
              </text>
              {/* X label */}
              <text
                x={x + barWidth / 2}
                y={height - 15}
                textAnchor="middle"
                fontSize="10"
                fill={theme.palette.text.secondary}
              >
                {item.label.length > 8 ? `${item.label.slice(0, 7)}…` : item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </Box>
  );
};

// --- 3. Donut Chart Component (SVG) ---
interface DonutChartProps {
  data: { label: string; value: number; color?: string }[];
  centerLabel?: string;
  size?: number;
}

export const DonutChartComponent: React.FC<DonutChartProps> = ({
  data,
  centerLabel = 'Total',
  size = 200,
}) => {
  const theme = useTheme();
  const defaultColors = ['#1556A3', '#198847', '#f59e0b', '#8b5cf6', '#ec4899'];
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <Box sx={{ height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No data recorded
        </Typography>
      </Box>
    );
  }

  const radius = 65;
  const strokeWidth = 24;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((slice, i) => {
            const percent = slice.value / total;
            const strokeDasharray = `${percent * circumference} ${circumference}`;
            const strokeDashoffset = -accumulatedPercent * circumference;
            accumulatedPercent += percent;
            const color = slice.color || defaultColors[i % defaultColors.length];

            return (
              <circle
                key={i}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                transform={`rotate(-90 ${center} ${center})`}
                style={{ transition: 'stroke-dasharray 0.5s ease' }}
              />
            );
          })}
        </svg>

        {/* Center label */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
            {total}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
            {centerLabel}
          </Typography>
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {data.map((item, i) => {
          const color = item.color || defaultColors[i % defaultColors.length];
          const pct = Math.round((item.value / total) * 100);
          return (
            <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: color,
                }}
              />
              <Typography
                variant="body2"
                sx={{ fontSize: '0.8125rem', fontWeight: 500, minWidth: 70 }}
              >
                {item.label}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}
              >
                {item.value} ({pct}%)
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

// --- 4. Camp Process Funnel Chart ---
interface FunnelChartProps {
  stages: { stage: string; count: number }[];
}

export const FunnelChartComponent: React.FC<FunnelChartProps> = ({ stages }) => {
  const max = Math.max(...stages.map((s) => s.count), 1);
  const colors = ['#1556A3', '#2574d4', '#198847', '#eab308', '#ec4899'];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, width: '100%' }}>
      {stages.map((st, idx) => {
        const percent = Math.round((st.count / max) * 100);
        const color = colors[idx % colors.length];

        return (
          <Box key={idx}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                {st.stage}
              </Typography>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8125rem' }}
              >
                {st.count} patients ({percent}%)
              </Typography>
            </Box>
            <Box
              sx={{
                width: '100%',
                height: 10,
                borderRadius: 5,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  width: `${percent}%`,
                  height: '100%',
                  borderRadius: 5,
                  backgroundColor: color,
                  transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};
