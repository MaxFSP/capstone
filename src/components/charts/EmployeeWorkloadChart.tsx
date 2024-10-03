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

interface EmployeeWorkloadChartProps {
  data: Array<{ name: string; tasks: number }>;
}

export function EmployeeWorkloadChart({ data }: EmployeeWorkloadChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <ChartWrapper title="Employee Workload Distribution">
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
          <Bar dataKey="tasks" name="Tasks" fill="hsl(var(--chart-1))" animationDuration={800}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill="hsl(var(--chart-1))" />
            ))}
            <LabelList dataKey="tasks" position="right" fill="hsl(var(--foreground))" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}
