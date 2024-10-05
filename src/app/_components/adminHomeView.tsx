/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /app/(dashboard)/admin/page.tsx

'use client';

import { useState, useEffect } from 'react';

// Import updated chart components
import { WorkOrderStatusChart } from '~/components/charts/WorkOrderStatusChart';
import { EmployeeWorkloadChart } from '~/components/charts/EmployeeWorkloadChart';
import { TaskCompletionChart } from '~/components/charts/TaskCompletionChart';
import { AverageCompletionTimeChart } from '~/components/charts/AverageCompletionTimeChart';
import { TaskPriorityChart } from '~/components/charts/TaskPriorityChart';
import { MachineryStatusChart } from '~/components/charts/MachineryStatusChart';
import { ToolUsageChart } from '~/components/charts/ToolUsageChart';
import { PartUsageChart } from '~/components/charts/PartUsageChart';

import { KeyMetrics } from '~/app/_components/KeyMetrics';

export default function AdminHomeView() {
  const [chartData, setChartData] = useState<Record<string, any>>({});
  const [keyMetrics, setKeyMetrics] = useState({
    totalMachines: 0,
    totalParts: 0,
    totalTools: 0,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch key metrics
        const metricsResponse = await fetch('/api/keyMetrics');
        if (!metricsResponse.ok) {
          throw new Error('Failed to fetch key metrics');
        }
        const metricsData = await metricsResponse.json();
        setKeyMetrics(metricsData);

        // Fetch chart data
        const chartIds = [
          'workOrderStatus',
          'employeeWorkload',
          'taskCompletion',
          'averageCompletionTime',
          'taskPriority',
          'machineryStatus',
          'toolUsage',
          'partUsage',
        ];

        const dataPromises = chartIds.map(async (chartId) => {
          const response = await fetch(`/api/charts/${chartId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch data for chart ${chartId}`);
          }
          const data = await response.json();
          return { chartId, data };
        });

        const results = await Promise.all(dataPromises);
        const newChartData: Record<string, any> = {};
        results.forEach(({ chartId, data }) => {
          newChartData[chartId] = data;
        });
        setChartData(newChartData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    void fetchData();
  }, []);

  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {(keyMetrics &&
        keyMetrics.totalMachines > 0 &&
        keyMetrics.totalParts > 0 &&
        keyMetrics.totalTools > 0 && <KeyMetrics metrics={keyMetrics} />) ?? (
        <KeyMetrics metrics={{ totalMachines: 0, totalParts: 0, totalTools: 0 }} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {chartData.workOrderStatus && chartData.workOrderStatus.length > 0 && (
          <WorkOrderStatusChart data={chartData.workOrderStatus} />
        )}
        {chartData.taskPriority && chartData.taskPriority.length > 0 && (
          <TaskPriorityChart data={chartData.taskPriority} />
        )}
        {chartData.machineryStatus && chartData.machineryStatus.length > 0 && (
          <MachineryStatusChart data={chartData.machineryStatus} />
        )}
        {chartData.employeeWorkload && chartData.employeeWorkload.length > 0 && (
          <EmployeeWorkloadChart data={chartData.employeeWorkload} />
        )}
        {chartData.averageCompletionTime && chartData.averageCompletionTime.length > 0 && (
          <AverageCompletionTimeChart data={chartData.averageCompletionTime} />
        )}
        {chartData.toolUsage && chartData.toolUsage.length > 0 && (
          <ToolUsageChart data={chartData.toolUsage} />
        )}
        {chartData.taskCompletion && chartData.taskCompletion.length > 0 && (
          <div className="col-span-1 md:col-span-2">
            <TaskCompletionChart data={chartData.taskCompletion} />
          </div>
        )}
        {chartData.partUsage && chartData.partUsage.length > 0 && (
          <PartUsageChart data={chartData.partUsage} />
        )}
      </div>
    </div>
  );
}
