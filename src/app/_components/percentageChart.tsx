"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart";

interface PercentageChartProps {
  completedTasks: number;
  tasksOngoing: number;
}

export function PercentageChart({
  completedTasks,
  tasksOngoing,
}: PercentageChartProps) {
  const totalTasks = completedTasks + tasksOngoing;

  const chartData = React.useMemo(
    () => [
      {
        status: "completed",
        tasks: completedTasks,
        fill: "#ECB365",
      }, // Yellow
      { status: "ongoing", tasks: tasksOngoing, fill: "hsl(210, 100%, 20%)" }, // Navy Blue
    ],
    [completedTasks, tasksOngoing],
  );

  const chartConfig = {
    tasks: {
      label: "Tasks",
    },
    completed: {
      label: "Completed",
      color: "hsl(45, 100%, 50%)",
    },
    ongoing: {
      label: "Ongoing",
      color: "hsl(210, 100%, 20%)",
    },
  } satisfies ChartConfig;

  const completedPercentage = React.useMemo(() => {
    return ((completedTasks / totalTasks) * 100).toFixed(2);
  }, [completedTasks, totalTasks]);

  return (
    <Card className="mx-auto flex w-full max-w-md flex-col bg-[#04293A] text-white md:max-w-full">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-[#ECB365]">Tasks Completion</CardTitle>
        <CardDescription className="text-[#ECB365]">
          Current Task Status
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] sm:max-h-[350px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="tasks"
              nameKey="status"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-[#ECB365] text-3xl font-bold"
                        >
                          {completedPercentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy ?? 0) + 24}
                          className="fill-[#ECB365]"
                        >
                          Completed
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="leading-none text-[#ECB365]">
          Showing task completion percentage
        </div>
      </CardFooter>
    </Card>
  );
}
