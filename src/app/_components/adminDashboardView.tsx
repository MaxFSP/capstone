'use client';

import { useState, useEffect } from 'react';
import AdminKanbanHeader from './adminKanbanHeader';
import ListBoard from './ListBoard';
import { type RegularWorkOrder } from '~/server/types/IOrders';
import { type Employee } from '~/server/types/IEmployee';
import AdminKanbanBoard from './adminKanbanBoard';
import AdminListBoard from './adminListBoard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';

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
          <Tabs defaultValue="kanban">
            <TabsList className="m-4 grid grid-cols-2 rounded-lg border border-border bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] dark:bg-[hsl(var(--accent))] dark:text-[hsl(var(--accent-foreground))] sm:w-full md:w-1/2">
              <TabsTrigger
                value="kanban"
                className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--popover))] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] "
              >
                Kanban
              </TabsTrigger>
              <TabsTrigger
                value="list"
                className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--popover))] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] "
              >
                List
              </TabsTrigger>
            </TabsList>
            <TabsContent value="kanban">
              <AdminKanbanBoard workOrders={workOrder} fetchData={fetchData} />
            </TabsContent>
            <TabsContent value="list">
              <AdminListBoard workOrders={workOrder} />
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center rounded-lg p-6 shadow-md">
          <h1 className="mb-4 text-center text-3xl font-extrabold text-primary">Loading...</h1>
        </div>
      )}
    </div>
  );
}
