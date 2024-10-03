// components/CustomTooltip.tsx
'use client';

import React from 'react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: any;
  label?: string;
}

export const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-2 rounded shadow-lg"
        style={{
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))',
          border: '1px solid hsl(var(--border))',
        }}
      >
        <p className="text-sm font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`tooltip-item-${index}`} className="text-sm">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
