/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
'use client';

import { useState, useEffect, useMemo } from 'react';

import { Button } from '~/components/ui/button';

import { Input } from '~/components/ui/input';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

import { useMediaQuery } from '~/lib/use-media-query';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '~/components/ui/command';
import { Drawer, DrawerContent, DrawerTrigger } from '~/components/ui/drawer';

import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '~/components/ui/alert-dialog';

import { Label } from '~/components/ui/label';

import { CalendarIcon } from '@radix-ui/react-icons';
import { format, set } from 'date-fns';
import { type DateRange } from 'react-day-picker';

import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

import { type Employee } from '~/server/types/IEmployee';
import { Textarea } from '~/components/ui/textarea';
import { type Tool } from '~/server/types/ITool';
import { type Part } from '~/server/types/IPart';
import { type Task } from '~/server/types/ITasks';
import DeleteTaskDialog from './deleteTaskDialog';
import { useRouter } from 'next/navigation';

export default function KanbanTask(props: {
  task: Task;
  employees: Employee[];
  column_id: number;
  tools: Tool[];
  parts: Part[];
  onGone: () => void;
  triggerRefresh: () => void;
  type: string;
}) {
  type Priority = 'Low' | 'Medium' | 'High';

  const { task, employees, column_id, tools, parts, onGone, triggerRefresh, type } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState({ ...task });

  let assigned_to = employees.find((employee) => employee.employee_id === task.assigned_to);
  if (!assigned_to) {
    assigned_to = employees[0]!;
  }
  const [assigned_employee, setAssignedEmployee] = useState(
    assigned_to.firstName + ' ' + assigned_to.lastName
  );
  const [priority, setPriority] = useState(task.priority);

  const [openTool, setOpenTool] = useState(false);
  const [openPart, setOpenPart] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedTool, setSelectedTool] = useState(tools[0]!.brand + ': ' + tools[0]!.name);

  const [selectedPart, setSelectedPart] = useState(parts[0]!.name + ': ' + parts[0]!.part_number);

  const [partList, setPartList] = useState<Part[]>([]);
  const [toolList, setToolList] = useState<Tool[]>([]);
  const [initialPartList, setInitialPartList] = useState<Part[]>([]);
  const [initialToolList, setInitialToolList] = useState<Tool[]>([]);

  const [taskFormValue, setTaskFormValue] = useState({
    task_id: task.task_id,
    title: task.title,
    description: task.description,
    start_date: task.start_date,
    end_date: task.end_date,
    assigned_to: task.assigned_to,
    column_id: task.column_id,
    position: task.position,
    priority: task.priority,
    state: task.state,
  });

  // Calendar stuff
  const [date, setDate] = useState<DateRange | undefined>({
    from: task.start_date,
    to: task.end_date,
  });

  // Form stuff
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setTaskFormValue({ ...task });
      setAssignedEmployee(assigned_to.firstName + ' ' + assigned_to.lastName);
      setPriority(task.priority);
      setDate({
        from: initialFormData.start_date,
        to: initialFormData.end_date,
      });
      setToolList(initialToolList);
      setPartList(initialPartList);
    }
  }, [isEditing, task]);

  useEffect(() => {
    validateForm();
    checkForChanges();
  }, [taskFormValue, priority, date, assigned_employee, toolList, partList]);

  const validateForm = () => {
    const isNameValid = validateStringWithSpaces(taskFormValue.title);
    const isDescriptionValid = validateStringWithSpaces(taskFormValue.description);

    if (isNameValid && isDescriptionValid) {
      setIsFormValid(true);
    }
  };

  const checkForChanges = () => {
    const fromDate = date?.from?.toISOString().split('T')[0] ?? '';
    const toDate = date?.to?.toISOString().split('T')[0] ?? '';
    const hasChanges =
      JSON.stringify(taskFormValue) !== JSON.stringify(task) ||
      priority !== task.priority ||
      fromDate != task.start_date.toISOString().split('T')[0] ||
      toDate != task.end_date.toISOString().split('T')[0] ||
      assigned_employee !== assigned_to.firstName + ' ' + assigned_to.lastName ||
      toolList.length !== initialToolList.length ||
      partList.length !== initialPartList.length;
    setHasChanges(hasChanges);
  };

  const handleEditClick = () => {
    if (isEditing) {
      setInitialFormData({ ...taskFormValue });
    }
    setIsEditing(!isEditing);
  };

  const handleCancelClick = () => {
    setTaskFormValue(initialFormData);
    setIsEditing(false);
  };

  useEffect(() => {
    fetch('/api/getToolsAndParts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: task.task_id }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to get tools and parts');

        const { data } = await response.json();
        const toolsData: Tool[] = data.tools;
        const partsData: Part[] = data.parts;
        const toolIds = toolsData.map((tool: Tool) => tool.tool_id);
        const partIds = partsData.map((part: Part) => part.part_id);
        setToolList(tools.filter((tool: Tool) => toolIds.includes(tool.tool_id)));
        setInitialToolList(tools.filter((tool: Tool) => toolIds.includes(tool.tool_id)));
        setPartList(parts.filter((part: Part) => partIds.includes(part.part_id)));
        setInitialPartList(parts.filter((part: Part) => partIds.includes(part.part_id)));
      })
      .catch((error) => console.error(error));
  }, [task.task_id, tools, parts]);

  useEffect(() => {
    const isNameValid = validateStringWithSpaces(taskFormValue.title);
    const isDescriptionValid = validateStringWithSpaces(taskFormValue.description);

    if (isNameValid && isDescriptionValid) {
      setIsFormValid(true);
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
        (employee) => employee.firstName + ' ' + employee.lastName === assigned_employee
      )!.employee_id;

      taskFormValue.start_date = date!.from!;
      taskFormValue.end_date = date!.to!;

      taskFormValue.column_id = column_id;
      taskFormValue.priority = priority;
      taskFormValue.state = 1;

      await fetch('/api/updateTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskFormValue),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to update task');
        } else {
          const toolsAndParts = {
            task_id: taskFormValue.task_id,
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
            const addToolandPart = await fetch('/api/updateToolsAndPartsToTask', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(toolsAndParts),
            });
            if (!addToolandPart.ok) {
              throw new Error('Failed to add tools and parts to task');
            }
            triggerRefresh();
            router.refresh();
            setIsEditing(false);
          } catch (error) {
            console.error('Failed to add tools and parts to task:', error);
          }
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to create work order:', error);
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    await handleSaveClick();
    setTaskFormValue({
      task_id: task.task_id,
      title: task.title,
      description: task.description,
      start_date: task.start_date,
      end_date: task.end_date,
      assigned_to: task.assigned_to,
      column_id: task.column_id,
      position: task.position,
      priority: task.priority,
      state: task.state,
    });
  };

  const isNameInvalid = useMemo(
    () => taskFormValue.title !== '' && !validateStringWithSpaces(taskFormValue.title),
    [taskFormValue.title]
  );

  const isObservationsInvalid = useMemo(
    () => taskFormValue.description !== '' && !validateStringWithSpaces(taskFormValue.description),
    [taskFormValue.description]
  );

  return (
    <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <AlertDialogTrigger asChild>
        {type === 'kanban' ? (
          <div
            className={`rounded ${task.priority === 'Low' ? 'bg-green-600' : task.priority === 'Medium' ? 'bg-yellow-600' : 'bg-red-600'} p-4 transition-shadow duration-150 ease-in-out hover:z-10 hover:shadow-outline`}
            key={task.task_id + 'KanbanTask' + task.title}
          >
            <div className="cursor-pointer" onClick={(e) => e.stopPropagation()}>
              <h3 className="font-semibold">{task.title}</h3>
              <p>{task.start_date.toDateString() + ' - ' + task.end_date.toDateString()}</p>
            </div>
          </div>
        ) : (
          <p className="w-8 cursor-pointer text-small font-semibold">View</p>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] max-w-[95vw] overflow-auto bg-background text-foreground lg:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Edit Task</AlertDialogTitle>
          <AlertDialogDescription>
            Make sure you type the correct information before editing the task.
          </AlertDialogDescription>
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
                disabled={!isEditing}
                className={cn('w-full', isNameInvalid ? 'border-red-600' : '')}
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
                disabled={!isEditing}
                onChange={(e) =>
                  setTaskFormValue({
                    ...taskFormValue,
                    description: e.target.value,
                  })
                }
                className={cn('w-full', isObservationsInvalid ? 'border-red-600' : '')}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Assign an employee</Label>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button className="w-full border border-border bg-background text-foreground">
                    {assigned_employee}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-background text-foreground">
                  <DropdownMenuLabel>Employee</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={assigned_employee}
                    onValueChange={(value: string) => setAssignedEmployee(value)}
                  >
                    {employees.map((employee) => (
                      <DropdownMenuRadioItem
                        key={employee.employee_id + 'employee' + employee.firstName + employee.job}
                        value={employee.firstName + ' ' + employee.lastName}
                      >
                        {employee.firstName + ' ' + employee.lastName}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex-1">
              <Label>Priority</Label>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild disabled={!isEditing}>
                  <Button className="w-full border border-border bg-background text-foreground">
                    {priority}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-background text-foreground">
                  <DropdownMenuLabel>Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={priority}
                    onValueChange={(value: string) => setPriority(value as Priority)}
                  >
                    <DropdownMenuRadioItem value="Low">Low</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="Medium">Medium</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="High">High</DropdownMenuRadioItem>
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
                  <PopoverTrigger asChild disabled={!isEditing}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border border-border bg-background text-foreground"
                    >
                      <>+ Tools</>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full bg-background p-0 text-foreground"
                    align="start"
                  >
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
                  <DrawerTrigger asChild disabled={!isEditing}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border border-border bg-background text-foreground"
                    >
                      <>+ Tools</>
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-background text-foreground">
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
                  <PopoverTrigger asChild disabled={!isEditing}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border border-border bg-background text-foreground"
                    >
                      <>+ Parts</>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-full bg-background p-0 text-foreground"
                    align="start"
                  >
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
                  <DrawerTrigger asChild disabled={!isEditing}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border border-border bg-background text-foreground"
                    >
                      <>+ Parts</>
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-background text-foreground">
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
                    <div key={tool.tool_type + 'tool' + tool.name + tool.tool_id}>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p>{tool.brand + ': ' + tool.name}</p>
                        <Button
                          type="button"
                          variant={'destructive'}
                          className=" cursor-pointer rounded-md  bg-red-600  px-4 py-0  text-white"
                          disabled={!isEditing}
                          onClick={() => {
                            setToolList(toolList.filter((t) => t.tool_id !== tool.tool_id));
                          }}
                        >
                          X
                        </Button>
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
                    <div className="" key={part.part_id + 'part' + part.name}>
                      <div
                        key={part.part_id + 'part' + part.part_number + part.name}
                        className="mt-2 flex items-center justify-between gap-2"
                      >
                        <p>{part.name + ': ' + part.part_number}</p>
                        <Button
                          type="button"
                          disabled={!isEditing}
                          className=" cursor-pointer rounded-md  bg-red-600  px-4 py-0  text-white"
                          onClick={() => {
                            setPartList(partList.filter((p) => p.part_id !== part.part_id));
                          }}
                        >
                          X
                        </Button>
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
                  <PopoverTrigger asChild disabled={!isEditing}>
                    <Button
                      id="date"
                      variant={'outline'}
                      className={cn(
                        'w-[300px] justify-start border border-border bg-background text-left font-normal text-foreground',
                        !date && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date?.from ? (
                        date.to ? (
                          <>
                            {format(date.from, 'LLL dd, y')} - {format(date.to, 'LLL dd, y')}
                          </>
                        ) : (
                          format(date.from, 'LLL dd, y')
                        )
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto bg-background p-0 text-foreground"
                    align="start"
                  >
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
          {!isEditing && (
            <AlertDialogCancel asChild>
              <Button
                type="button"
                className="bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              >
                Close
              </Button>
            </AlertDialogCancel>
          )}
          <Button onClick={isEditing ? handleCancelClick : handleEditClick}>
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>

          {isEditing && (
            <>
              <AlertDialogCancel asChild>
                <Button
                  type="button"
                  variant={'default'}
                  onClick={handleSaveClick}
                  disabled={!isFormValid || !hasChanges}
                >
                  Save
                </Button>
              </AlertDialogCancel>
            </>
          )}

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
    <Command className="bg-background text-foreground">
      <CommandInput placeholder="Filter part..." className="bg-background text-foreground" />
      <CommandList className="bg-background text-foreground">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {parts.map((part) => (
            <CommandItem
              key={part.part_id + 'part' + part.name + part.part_number}
              value={part.name}
              onSelect={(_value: string) => {
                setSelectedPart(part.name + ': ' + part.part_number);
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
    <Command className="bg-background text-foreground">
      <CommandInput placeholder="Filter tool..." className="bg-background text-foreground" />
      <CommandList className="bg-background text-foreground">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {tools.map((tool) => (
            <CommandItem
              key={tool.tool_id + 'tool' + tool.tool_type}
              value={tool.name}
              onSelect={(_value: string) => {
                setSelectedTool(tool.brand + ': ' + tool.name);
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
