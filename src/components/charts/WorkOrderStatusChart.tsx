'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Label } from 'recharts';
import { ChartWrapper } from '~/app/_components/ChartWrapper';
import { CustomTooltip } from '~/app/_components/CustomTooltip';

interface WorkOrderStatusChartProps {
  data: Array<{ name: string; value: number }>;
}

export function WorkOrderStatusChart({ data }: WorkOrderStatusChartProps) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  // Define colors using CSS variables from globals.css
  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <ChartWrapper title="Work Order Status Overview">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={90}
            paddingAngle={5}
            labelLine={false}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            animationDuration={800}
            animationEasing="ease-out"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} iconType="circle" />
          <Label
            value={`Total\n${total}`}
            position="center"
            className="text-center text-lg font-semibold"
            fill="hsl(var(--foreground))"
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}