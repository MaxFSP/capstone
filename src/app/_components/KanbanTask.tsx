"use client";

import { useState, useEffect, useMemo } from "react";

import { Button } from "~/components/ui/button";

import { Input } from "~/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";

import { useMediaQuery } from "~/lib/use-media-query";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "~/components/ui/command";
import { Drawer, DrawerContent, DrawerTrigger } from "~/components/ui/drawer";

import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

import { Label } from "~/components/ui/label";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

import { cn } from "~/lib/utils";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";

import { type Employee } from "~/server/types/IEmployee";
import { useRouter } from "next/navigation";
import { Textarea } from "~/components/ui/textarea";
import { type Tool } from "~/server/types/ITool";
import { type Part } from "~/server/types/IPart";
import { type Task } from "~/server/types/ITasks";
import DeleteTaskDialog from "./deleteTaskDialog";

export default function KanbanTask(props: {
  task: Task;
  employees: Employee[];
  pos: number;
  column_id: number;
  tools: Tool[];
  parts: Part[];
  onGone: () => void;
}) {
  const { task, employees, pos, column_id, tools, parts, onGone } = props;
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  // ...

  const [assigned_employee, setAssignedEmployee] = useState(
    employees[0]!.firstName + " " + employees[0]!.lastName,
  );
  const [priority, setPriority] = useState("Low");

  const [openTool, setOpenTool] = useState(false);
  const [openPart, setOpenPart] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const [selectedTool, setSelectedTool] = useState(
    tools[0]!.brand + ": " + tools[0]!.name,
  );

  const [selectedPart, setSelectedPart] = useState(
    parts[0]!.name + ": " + parts[0]!.part_number,
  );

  useEffect(() => {
    fetch("/api/getToolsAndParts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ task_id: task.task_id }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to get tools and parts");

        const { data } = await response.json();
        const toolsData: Tool[] = data.tools;
        const partsData: Part[] = data.parts;
        const toolIds = toolsData.map((tool: Tool) => tool.tool_id);
        const partIds = partsData.map((part: Part) => part.part_id);
        setToolList(
          tools.filter((tool: Tool) => toolIds.includes(tool.tool_id)),
        );
        setPartList(
          parts.filter((part: Part) => partIds.includes(part.part_id)),
        );
      })
      .catch((error) => console.error(error));
  }, [task.task_id, tools, parts]);

  const [partList, setPartList] = useState<Part[]>([]);
  const [toolList, setToolList] = useState<Tool[]>([]);

  const [taskFormValue, setTaskFormValue] = useState({
    title: task.title,
    description: task.description,
    start_date: task.start_date,
    end_date: task.end_date,
    assigned_to: task.assigned_to,
    column_id: task.column_id,
    position: task.position,
    priority: task.priority,
  });

  const differenceInDays = (start: Date, end: Date) => {
    const millisecondsPerDay = 1000 * 60 * 60 * 24;
    return Math.round(
      Math.abs((end.getTime() - start.getTime()) / millisecondsPerDay),
    );
  };

  // get the difference between the start and end date in days
  const days = differenceInDays(task.end_date, task.start_date);

  // Calendar stuff
  const [date, setDate] = useState<DateRange | undefined>({
    from: task.start_date,
    to: task.end_date,
  });

  // Form stuff
  const [isOrderFormValid, setIsOrderFormValid] = useState(false);

  useEffect(() => {
    const isNameValid = validateStringWithSpaces(taskFormValue.title);
    const isDescriptionValid = validateStringWithSpaces(
      taskFormValue.description,
    );

    if (isNameValid && isDescriptionValid) {
      setIsOrderFormValid(true);
    }
  }, [taskFormValue]);

  const validateStringWithSpaces = (name: string) => /^[A-Za-z\s]+$/.test(name);

  const handleWorkOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTaskFormValue((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      taskFormValue.assigned_to = employees.find(
        (employee) =>
          employee.firstName + " " + employee.lastName === assigned_employee,
      )!.employee_id;

      taskFormValue.start_date = date!.from!;
      taskFormValue.end_date = date!.to!;

      taskFormValue.column_id = column_id;
      taskFormValue.position = pos;
      taskFormValue.priority = priority;

      // Set the assigned machine (only the id)
      const response = await fetch("/api/createTask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskFormValue),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error("Failed to create work order");
        } else {
          const { data } = await response.json();

          const toolsAndParts = {
            task_id: data.task_id,
            tools: [] as number[],
            parts: [] as number[],
          };

          if (toolList) {
            const toolListIds = toolList.map((tool) => tool.tool_id);
            toolsAndParts.tools = toolListIds;
          }

          if (partList) {
            const partListIds = partList.map((part) => part.part_id);
            toolsAndParts.parts = partListIds;
          }

          try {
            const addToolandPart = await fetch("/api/addToolsAndPartsToTask", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(toolsAndParts),
            });
            if (!addToolandPart.ok) {
              throw new Error("Failed to add tools and parts to task");
            }
          } catch (error) {
            console.error("Failed to add tools and parts to task:", error);
          }
        }
      });

      return true;
    } catch (error) {
      console.error("Failed to create work order:", error);
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setTaskFormValue({
      title: task.title,
      description: task.description,
      start_date: task.start_date,
      end_date: task.end_date,
      assigned_to: task.assigned_to,
      column_id: task.column_id,
      position: task.position,
      priority: task.priority,
    });
  };

  const isNameInvalid = useMemo(
    () =>
      taskFormValue.title !== "" &&
      !validateStringWithSpaces(taskFormValue.title),
    [taskFormValue.title],
  );

  const isObservationsInvalid = useMemo(
    () =>
      taskFormValue.description !== "" &&
      !validateStringWithSpaces(taskFormValue.description),
    [taskFormValue.description],
  );

  return (
    <div className="rounded bg-gray-800 p-4 transition-shadow duration-150 ease-in-out hover:z-10 hover:shadow-outline">
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogTrigger asChild>
          <div className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold">{task.title}</h3>
            <p>
              {task.start_date.toDateString() +
                " - " +
                task.end_date.toDateString()}
            </p>
          </div>
        </AlertDialogTrigger>
        <AlertDialogContent className="h-auto max-h-[90vh] overflow-auto lg:max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>{task.title}</AlertDialogTitle>
            <AlertDialogDescription>{task.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Label>Title</Label>
                <Input
                  required
                  type="text"
                  name="title"
                  value={taskFormValue.title}
                  onChange={handleWorkOrderChange}
                  color={isNameInvalid ? "danger" : "default"}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <Label>Observations</Label>
                <Textarea
                  required
                  name="observations"
                  value={taskFormValue.description}
                  onChange={(e) =>
                    setTaskFormValue({
                      ...taskFormValue,
                      description: e.target.value,
                    })
                  }
                  color={isObservationsInvalid ? "danger" : "default"}
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <Label>Assign an employee</Label>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full" variant="outline">
                      {assigned_employee}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Employee</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={assigned_employee}
                      onValueChange={(value: string) =>
                        setAssignedEmployee(value)
                      }
                    >
                      {employees.map((employee) => (
                        <DropdownMenuRadioItem
                          key={
                            employee.employee_id +
                            "employee" +
                            employee.firstName +
                            employee.job
                          }
                          value={employee.firstName + " " + employee.lastName}
                        >
                          {employee.firstName + " " + employee.lastName}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex-1">
                <Label>Priority</Label>
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button className="w-full" variant="outline">
                      {priority}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-full">
                    <DropdownMenuLabel>Priority</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={priority}
                      onValueChange={(value: string) => setPriority(value)}
                    >
                      <DropdownMenuRadioItem value="Low">
                        Low
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="Medium">
                        Medium
                      </DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="High">
                        High
                      </DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <Label>Select tools to use</Label>
                {isDesktop ? (
                  <Popover open={openTool} onOpenChange={setOpenTool}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <>+ Tools</>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <ToolList
                        setOpenTool={setOpenTool}
                        setSelectedTool={setSelectedTool}
                        setToolList={setToolList}
                        tools={tools}
                        toolList={toolList}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Drawer open={openTool} onOpenChange={setOpenTool}>
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <>+ Tools</>
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mt-4 border-t">
                        <ToolList
                          setOpenTool={setOpenTool}
                          setSelectedTool={setSelectedTool}
                          setToolList={setToolList}
                          tools={tools}
                          toolList={toolList}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </div>

              <div className="flex-1">
                <Label>Select parts to use</Label>
                {isDesktop ? (
                  <Popover open={openPart} onOpenChange={setOpenPart}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <>+ Parts</>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <PartList
                        setOpenPart={setOpenTool}
                        setSelectedPart={setSelectedPart}
                        setPartList={setPartList}
                        parts={parts}
                        partList={partList}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <Drawer open={openPart} onOpenChange={setOpenPart}>
                    <DrawerTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <>+ Parts</>
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <div className="mt-4 border-t">
                        <PartList
                          setOpenPart={setOpenTool}
                          setSelectedPart={setSelectedPart}
                          setPartList={setPartList}
                          parts={parts}
                          partList={partList}
                        />
                      </div>
                    </DrawerContent>
                  </Drawer>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              {toolList.length > 0 ? (
                <ScrollArea className="h-32 w-full flex-1 rounded-md border">
                  <Label className="p-2">Selected tools to use</Label>
                  <div className="p-2">
                    {toolList.map((tool) => (
                      <div>
                        <div
                          key={
                            tool.tool_id + "tool" + tool.name + tool.tool_type
                          }
                          className="mt-2 flex items-center justify-between gap-2"
                        >
                          <p>{tool.brand + ": " + tool.name}</p>
                          <a
                            className="cursor-pointer  rounded-md bg-red-600  px-2  text-white"
                            onClick={() => {
                              setToolList(
                                toolList.filter(
                                  (t) => t.tool_id !== tool.tool_id,
                                ),
                              );
                            }}
                          >
                            X
                          </a>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1"></div>
              )}

              {partList.length > 0 ? (
                <ScrollArea className="h-32 w-full flex-1 rounded-md border">
                  <Label className="p-2">Selected parts to use</Label>
                  <div className="p-2">
                    {partList.map((part) => (
                      <div className="">
                        <div
                          key={
                            part.part_id + "part" + part.part_number + part.name
                          }
                          className="mt-2 flex items-center justify-between gap-2 "
                        >
                          <p>{part.name + ": " + part.part_number}</p>
                          <a
                            className="cursor-pointer  rounded-md bg-red-600  px-2  text-white"
                            onClick={() => {
                              setPartList(
                                partList.filter(
                                  (p) => p.part_id !== part.part_id,
                                ),
                              );
                            }}
                          >
                            X
                          </a>
                        </div>
                        <Separator className="my-2" />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex-1"></div>
              )}
            </div>

            <div className="flex space-x-4">
              <div className="flex-1">
                <Label>Date Range</Label>
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                          "w-[300px] justify-start text-left font-normal",
                          !date && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                          date.to ? (
                            <>
                              {format(date.from, "LLL dd, y")} -{" "}
                              {format(date.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(date.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          <AlertDialogFooter className="sm:justify-start">
            <AlertDialogCancel asChild>
              <Button type="button" variant="secondary">
                Close
              </Button>
            </AlertDialogCancel>
            <AlertDialogCancel asChild>
              <DeleteTaskDialog
                task={props.task}
                onDelete={() => {
                  setDialogOpen(false);
                  onGone();
                }}
              />
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PartList({
  setOpenPart,
  setSelectedPart,
  setPartList,
  parts,
  partList,
}: {
  setOpenPart: (open: boolean) => void;
  setSelectedPart: (part: string) => void;
  setPartList: (partList: Part[]) => void;
  parts: Part[];
  partList: Part[];
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter part..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {parts.map((part) => (
            <CommandItem
              key={part.part_id + "part" + part.name}
              value={part.part_id}
              onSelect={(value: string) => {
                setSelectedPart(part.name + ": " + part.part_number);
                if (!partList.some((p) => p.part_id === part.part_id)) {
                  setPartList([...partList, part]);
                }
                setOpenPart(false);
              }}
            >
              {part.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function ToolList({
  setOpenTool,
  setSelectedTool,
  setToolList,
  tools,
  toolList,
}: {
  setOpenTool: (open: boolean) => void;
  setSelectedTool: (tool: string) => void;
  setToolList: (toolList: Tool[]) => void;
  tools: Tool[];
  toolList: Tool[];
}) {
  return (
    <Command>
      <CommandInput placeholder="Filter tool..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {tools.map((tool) => (
            <CommandItem
              key={tool.tool_id + "tool" + tool.tool_type}
              value={tool.tool_id}
              onSelect={(value: string) => {
                setSelectedTool(tool.brand + ": " + tool.name);
                if (!toolList.some((t) => t.tool_id === tool.tool_id)) {
                  setToolList([...toolList, tool]);
                }
                setOpenTool(false);
              }}
            >
              {tool.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}
