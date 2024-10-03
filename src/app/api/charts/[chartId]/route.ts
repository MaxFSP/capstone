import { NextRequest, NextResponse } from 'next/server';
import {
  fetchWorkOrderStatusData,
  fetchEmployeeWorkloadData,
  fetchTaskCompletionData,
  fetchAverageCompletionTimeData,
  fetchTaskPriorityData,
  fetchMachineryStatusData,
  fetchToolUsageData,
  fetchPartUsageData,
  // Import other data fetching functions
} from '~/server/queries/chart/queries';

export async function GET(request: NextRequest, { params }: { params: { chartId: string } }) {
  const { chartId } = params;

  try {
    let data;

    switch (chartId) {
      case 'workOrderStatus':
        data = await fetchWorkOrderStatusData();
        break;
      case 'employeeWorkload':
        data = await fetchEmployeeWorkloadData();
        break;
      case 'taskCompletion':
        data = await fetchTaskCompletionData();
        break;
      case 'averageCompletionTime':
        data = await fetchAverageCompletionTimeData();
        break;
      case 'taskPriority':
        data = await fetchTaskPriorityData();
        break;
      case 'machineryStatus':
        data = await fetchMachineryStatusData();
        break;
      case 'toolUsage':
        data = await fetchToolUsageData();
        break;
      case 'partUsage':
        data = await fetchPartUsageData();
        break;
      // Add cases for other charts
      default:
        return NextResponse.json({ error: 'Invalid chart ID' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error(`Error fetching data for chart ${chartId}:`, error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
