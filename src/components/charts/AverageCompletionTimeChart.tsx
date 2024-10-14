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

interface AverageCompletionTimeChartProps {
  data: Array<{ name: string; averageTime: number }>;
}

export function AverageCompletionTimeChart({ data }: AverageCompletionTimeChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <ChartWrapper title="Average Task Completion Time by Employee (Hours)">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart layout="vertical" data={data}>
          <XAxis
            type="number"
            allowDecimals={true}
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
            dataKey="averageTime"
            name="Avg Time (hrs)"
            fill="hsl(var(--chart-2))"
            animationDuration={800}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--chart-2))" />
            ))}
            <LabelList dataKey="averageTime" position="right" fill="hsl(var(--foreground))" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
