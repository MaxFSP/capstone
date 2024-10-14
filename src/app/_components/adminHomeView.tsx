/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */

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
import { MultiSelectCombobox } from '~/components/ui/MultiSelectCombobox';

export default function AdminHomeView() {
  const [chartData, setChartData] = useState<Record<string, any>>({});
  const [keyMetrics, setKeyMetrics] = useState({
    totalMachines: 0,
    totalParts: 0,
    totalTools: 0,
  });

  const [employeeOptions, setEmployeeOptions] = useState<Array<{ label: string; value: string }>>(
    []
  );
  const [toolOptions, setToolOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [partOptions, setPartOptions] = useState<Array<{ label: string; value: string }>>([]);

  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedParts, setSelectedParts] = useState<string[]>([]);

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

        // Extract options from chart data
        if (newChartData.employeeWorkload) {
          const employeeOpts = newChartData.employeeWorkload.map((emp: any) => ({
            label: emp.name,
            value: emp.id || emp.name, // Use ID if available, otherwise use name
          }));
          setEmployeeOptions(employeeOpts);
        }

        if (newChartData.toolUsage) {
          const toolOpts = newChartData.toolUsage.map((tool: any) => ({
            label: tool.name,
            value: tool.id || tool.name,
          }));
          setToolOptions(toolOpts);
        }

        if (newChartData.partUsage) {
          const partOpts = newChartData.partUsage.map((part: any) => ({
            label: part.name,
            value: part.id || part.name,
          }));
          setPartOptions(partOpts);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    void fetchData();
  }, []);

  // Apply filters to chart data
  const filteredChartData = {
    ...chartData,
    employeeWorkload:
      selectedEmployees.length > 0
        ? chartData.employeeWorkload?.filter((emp: any) =>
            selectedEmployees.includes(emp.id || emp.name)
          )
        : chartData.employeeWorkload,
    toolUsage:
      selectedTools.length > 0
        ? chartData.toolUsage?.filter((tool: any) => selectedTools.includes(tool.id || tool.name))
        : chartData.toolUsage,
    partUsage:
      selectedParts.length > 0
        ? chartData.partUsage?.filter((part: any) => selectedParts.includes(part.id || part.name))
        : chartData.partUsage,
  };

  return (
    <div className="p-6 space-y-6 bg-background text-foreground">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {keyMetrics ? (
        <KeyMetrics metrics={keyMetrics} />
      ) : (
        <KeyMetrics metrics={{ totalMachines: 0, totalParts: 0, totalTools: 0 }} />
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Employee Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Filter Employees</label>
          <MultiSelectCombobox
            options={employeeOptions}
            placeholder="Select employees..."
            selectedValues={selectedEmployees}
            onChange={setSelectedEmployees}
          />
        </div>

        {/* Tool Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Filter Tools</label>
          <MultiSelectCombobox
            options={toolOptions}
            placeholder="Select tools..."
            selectedValues={selectedTools}
            onChange={setSelectedTools}
          />
        </div>

        {/* Part Filter */}
        <div>
          <label className="block text-sm font-medium mb-1">Filter Parts</label>
          <MultiSelectCombobox
            options={partOptions}
            placeholder="Select parts..."
            selectedValues={selectedParts}
            onChange={setSelectedParts}
          />
        </div>
      </div>

      {/* Charts */}
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
        {filteredChartData.employeeWorkload && filteredChartData.employeeWorkload.length > 0 && (
          <EmployeeWorkloadChart data={filteredChartData.employeeWorkload} />
        )}
        {chartData.averageCompletionTime && chartData.averageCompletionTime.length > 0 && (
          <AverageCompletionTimeChart data={chartData.averageCompletionTime} />
        )}
        {filteredChartData.toolUsage && filteredChartData.toolUsage.length > 0 && (
          <ToolUsageChart data={filteredChartData.toolUsage} />
        )}
        {chartData.taskCompletion && chartData.taskCompletion.length > 0 && (
          <div className="col-span-1 md:col-span-2">
            <TaskCompletionChart data={chartData.taskCompletion} />
          </div>
        )}
        {filteredChartData.partUsage && filteredChartData.partUsage.length > 0 && (
          <PartUsageChart data={filteredChartData.partUsage} />
        )}
      </div>
    </div>
  );
}
