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
import { SingleSelectCombobox } from '~/components/ui/SingleSelectCombobox';

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
import { addDays, format } from 'date-fns';
import { type DateRange } from 'react-day-picker';

import { cn } from '~/lib/utils';
import { Calendar } from '~/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '~/components/ui/popover';

import { type Employee } from '~/server/types/IEmployee';
import { useRouter } from 'next/navigation';
import { Textarea } from '~/components/ui/textarea';
import { type Tool } from '~/server/types/ITool';
import { type Part } from '~/server/types/IPart';
import { useToast } from '~/components/hooks/use-toast';

import { ScrollArea } from '~/components/ui/scroll-area';
import { Separator } from '~/components/ui/separator';

export function CreateTaskDialog(props: {
  employees: Employee[];
  pos: number;
  column_id: number;
  tools: Tool[];
  parts: Part[];
  type: string;
  fetchData: () => Promise<void>;
}) {
  const { employees, pos, column_id, tools, parts, type, fetchData } = props;
  const router = useRouter();
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(
    employees[0]?.employee_id.toString() ?? ''
  );

  const [priority, setPriority] = useState('Low');

  const [openTool, setOpenTool] = useState(false);
  const [openPart, setOpenPart] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const [selectedTool, setSelectedTool] = useState(tools[0]?.brand + ': ' + tools[0]?.name ?? '');

  const [selectedPart, setSelectedPart] = useState(
    parts[0]?.name + ': ' + parts[0]?.part_number ?? ''
  );

  const [partList, setPartList] = useState<Part[]>([]);
  const [toolList, setToolList] = useState<Tool[]>([]);

  const { toast } = useToast();
  const [taskFormValue, setTaskFormValue] = useState({
    title: '',
    description: '',
    start_date: new Date(),
    end_date: new Date(),
    assigned_to: employees[0]?.employee_id ?? 0,
    column_id: column_id,
    position: pos,
    priority: priority,
  });

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 20),
  });

  const [isOrderFormValid, setIsOrderFormValid] = useState(false);

  useEffect(() => {
    const isNameValid = validateStringWithSpaces(taskFormValue.title);
    const isDescriptionValid = validateStringWithSpaces(taskFormValue.description);

    if (isNameValid && isDescriptionValid) {
      setIsOrderFormValid(true);
    } else {
      setIsOrderFormValid(false);
    }
  }, [taskFormValue]);

  const validateStringWithSpaces = (name: string) => /^[A-Za-z\s]+$/.test(name);

  const handleWorkOrderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskFormValue((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleSaveClick = async (): Promise<boolean> => {
    try {
      const newTask = {
        ...taskFormValue,
        assigned_to: parseInt(assignedEmployeeId),
        start_date: date?.from ?? new Date(),
        end_date: date?.to ?? new Date(),
        column_id: column_id,
        position: pos,
        priority: priority,
      };

      const response = await fetch('/api/createTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      const { data } = await response.json();
      const taskId = data[0].task_id;

      const toolListIds = toolList.map((tool) => tool.tool_id);
      const partListIds = partList.map((part) => part.part_id);

      const toolsAndParts = {
        task_id: taskId,
        tools: toolListIds,
        parts: partListIds,
      };

      const addToolAndPartResponse = await fetch('/api/addToolsAndPartsToTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(toolsAndParts),
      });

      if (!addToolAndPartResponse.ok) {
        throw new Error('Failed to add tools and parts to task');
      }

      toast({
        title: 'Success',
        description: 'Task created and tools/parts added successfully.',
      });
      router.refresh();
      await fetchData();

      return true;
    } catch (error) {
      console.error('Error creating task:', error);
      toast({
        title: 'Error',
        description: 'Task could not be created.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const handleSaveAndCloseClick = async () => {
    const success = await handleSaveClick();
    if (success) {
      setTaskFormValue({
        title: '',
        description: '',
        start_date: new Date(),
        end_date: new Date(),
        assigned_to: employees[0]?.employee_id ?? 0,
        column_id: column_id,
        position: pos,
        priority: 'Low',
      });
      setToolList([]);
      setPartList([]);
      setPriority('Low');
      setAssignedEmployeeId(employees[0]?.employee_id.toString() ?? '');
    }
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
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {type === 'kanban' ? (
          <Button className="bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-2 rounded-md transition-colors duration-200 ease-in-out flex items-center space-x-2">
            + Add Task
          </Button>
        ) : type === 'edit' ? (
          <Button variant="outline" size="sm">
            Open Task Information
          </Button>
        ) : (
          <Button className="bg-primary text-primary-foreground hover:bg-primary-dark px-4 py-2 rounded-md transition-colors duration-200 ease-in-out flex items-center space-x-2">
            + Add Task
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="h-auto max-h-[90vh] max-w-[95vw] overflow-auto bg-background text-foreground lg:max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle>Create Task</AlertDialogTitle>
          <AlertDialogDescription>
            Make sure you type the correct information before creating the task.
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
                className={cn(
                  'border border-border bg-background text-foreground',
                  isNameInvalid && 'border-destructive'
                )}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Observations</Label>
              <Textarea
                required
                name="description"
                value={taskFormValue.description}
                onChange={handleWorkOrderChange}
                className={cn(
                  'border border-border bg-background text-foreground',
                  isObservationsInvalid && 'border-destructive'
                )}
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <Label>Assign an employee</Label>
              <SingleSelectCombobox
                options={employees.map((employee) => ({
                  label: `${employee.firstName} ${employee.lastName}`,
                  value: employee.employee_id.toString(),
                }))}
                placeholder="Select an employee..."
                selectedValue={assignedEmployeeId}
                onChange={setAssignedEmployeeId}
              />
            </div>
            <div className="flex-1">
              <Label>Priority</Label>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full border border-border bg-background text-foreground"
                    variant="outline"
                  >
                    {priority}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full bg-background text-foreground">
                  <DropdownMenuLabel>Priority</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={priority}
                    onValueChange={(value: string) => setPriority(value)}
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
                  <PopoverTrigger asChild>
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
                  <DrawerTrigger asChild>
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
                  <PopoverTrigger asChild>
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
                      setOpenPart={setOpenPart}
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
                      className="w-full justify-start border border-border bg-background text-foreground"
                    >
                      <>+ Parts</>
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent className="bg-background text-foreground">
                    <div className="mt-4 border-t">
                      <PartList
                        setOpenPart={setOpenPart}
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

          {/* Scroll Areas for Selected Tools and Parts */}
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
                          className="cursor-pointer rounded-md bg-red-600 px-4 py-0 text-white"
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
                    <div key={part.part_id + 'part' + part.name}>
                      <div
                        key={part.part_id + 'part' + part.part_number + part.name}
                        className="mt-2 flex items-center justify-between gap-2"
                      >
                        <p>{part.name + ': ' + part.part_number}</p>
                        <Button
                          type="button"
                          className="cursor-pointer rounded-md bg-red-600 px-4 py-0 text-white"
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
                  <PopoverTrigger asChild>
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
          <AlertDialogCancel asChild>
            <Button
              type="button"
              variant="secondary"
              className="bg-secondary text-secondary-foreground"
              onClick={() => {
                setTaskFormValue({
                  title: '',
                  description: '',
                  start_date: new Date(),
                  end_date: new Date(),
                  assigned_to: employees[0]?.employee_id ?? 0,
                  column_id: column_id,
                  position: pos,
                  priority: 'Low',
                });
                setToolList([]);
                setPartList([]);
                setPriority('Low');
                setAssignedEmployeeId(employees[0]?.employee_id.toString() ?? '');
              }}
            >
              Close
            </Button>
          </AlertDialogCancel>

          <Button
            onClick={handleSaveAndCloseClick}
            disabled={!isOrderFormValid}
            className="bg-primary text-primary-foreground"
          >
            Save
          </Button>
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
      <CommandInput placeholder="Filter part..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {parts.map((part) => (
            <CommandItem
              key={part.part_id}
              value={part.name}
              onSelect={() => {
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
      <CommandInput placeholder="Filter tool..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup>
          {tools.map((tool) => (
            <CommandItem
              key={tool.tool_id}
              value={tool.name}
              onSelect={() => {
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
