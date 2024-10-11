'use client';

import { useState, useEffect } from 'react';
import AdminKanbanHeader from './adminKanbanHeader';
import ListBoard from './ListBoard';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type Employee } from '~/server/types/IEmployee';
import AdminKanbanBoard from './adminKanbanBoard';
import AdminListBoard from './adminListBoard';

// Define the DashboardData interface
interface DashboardData {
  workOrder: RegularWorkOrder[];
  employees: Employee[];
}

export default function AdminDashboardView() {
  const [workOrder, setWorkOrder] = useState<RegularWorkOrder[] | undefined>(undefined);
  const [boardType, setBoardType] = useState('kanban');

  // Inside DashboardView
  async function fetchData() {
    try {
      const response = await fetch('/api/adminDashboardData');
      const data = (await response.json()) as DashboardData;

      setWorkOrder(data.workOrder);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  }

  useEffect(() => {
    void fetchData();
  }, []);

  return (
    <div className="min-h-screen p-4 flex flex-col">
      {workOrder ? (
        <div className="rounded-lg shadow-md flex flex-col flex-grow">
          <AdminKanbanHeader fetchData={fetchData} />
          {boardType === 'kanban' ? (
            <AdminKanbanBoard workOrders={workOrder} fetchData={fetchData} />
          ) : (
            <AdminListBoard workOrders={workOrder} />
          )}
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg p-6 shadow-md">
          <h1 className="mb-4 text-center text-3xl font-extrabold text-primary">
            No Work Order Found
          </h1>
          <p className="w-full max-w-lg text-center text-lg text-muted-foreground">
            Sit back and relax, we will create a work order for you soon.
          </p>
        </div>
      )}
    </div>
  );
}
