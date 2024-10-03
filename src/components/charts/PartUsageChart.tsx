'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Legend,
} from 'recharts';
import { ChartWrapper } from '~/app/_components/ChartWrapper';
import { CustomTooltip } from '~/app/_components/CustomTooltip';

interface PartUsageChartProps {
  data: Array<{ name: string; usage: number }>;
}

export function PartUsageChart({ data }: PartUsageChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <ChartWrapper title="Part Usage Frequency">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart layout="vertical" data={data}>
          <XAxis
            type="number"
            allowDecimals={false}
            stroke="hsl(var(--foreground))"
            tick={{ fill: 'hsl(var(--foreground))' }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: 'hsl(var(--foreground))' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} iconType="circle" />
          <Bar
            dataKey="usage"
            name="Usage Count"
            fill="hsl(var(--chart-4))"
            animationDuration={800}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--chart-4))" />
            ))}
            <LabelList dataKey="usage" position="right" fill="hsl(var(--foreground))" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
