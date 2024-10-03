'use client';

import React from 'react';
import { FaClipboardList, FaChartLine, FaTools } from 'react-icons/fa';

interface KeyMetricsProps {
  metrics: {
    totalMachines: number;
    totalParts: number;
    totalTools: number;
  };
}

export function KeyMetrics({ metrics }: KeyMetricsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <MetricCard
        icon={<FaClipboardList size={24} />}
        label="Total Machines"
        value={metrics.totalMachines}
      />
      <MetricCard icon={<FaChartLine size={24} />} label="Total Parts" value={metrics.totalParts} />
      <MetricCard icon={<FaTools size={24} />} label="Total Tools" value={metrics.totalTools} />
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
}

function MetricCard({ icon, label, value }: MetricCardProps) {
  return (
    <div className="flex items-center p-4 bg-card rounded-lg shadow-md">
      <div className="mr-4">{icon}</div>
      <div>
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold text-foreground">{value}</div>
      </div>
    </div>
  );
}
