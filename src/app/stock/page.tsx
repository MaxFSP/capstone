import { getParts } from '~/server/queries/part/queries';
import { getTools } from '~/server/queries/tool/queries';
import { getMachineries } from '~/server/queries/machinery/queries';
import { getLocations } from '~/server/queries/location/queries';
import TableComponent from '../_components/tableComponent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs';

const partsColumns = [
  { key: 'name', label: 'Name' },
  { key: 'condition', label: 'Condition' },
  { key: 'quantity', label: 'Quantity' },
];

const toolsColumns = [
  { key: 'name', label: 'Name' },
  { key: 'condition', label: 'Condition' },
  { key: 'quantity', label: 'Quantity' },
];

const machineryColumns = [
  { key: 'brand', label: 'Brand' },
  { key: 'model', label: 'Model' },
  { key: 'serial_number', label: 'Serial Number' },
  { key: 'state', label: 'State' },
];

export default async function StockPage() {
  const machineryData = await getMachineries();
  const partData = await getParts();
  const toolData = await getTools();
  const locations = await getLocations();

  return (
    <Tabs defaultValue="machines">
      <TabsList className="m-4 grid grid-cols-3 rounded-lg border border-border bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] dark:bg-[hsl(var(--accent))] dark:text-[hsl(var(--accent-foreground))] sm:w-full md:w-1/2">
        <TabsTrigger
          value="machines"
          className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--popover))] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] "
        >
          Machines
        </TabsTrigger>
        <TabsTrigger
          value="parts"
          className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--popover))] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] "
        >
          Parts
        </TabsTrigger>
        <TabsTrigger
          value="tools"
          className="rounded-lg bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--popover))] data-[state=active]:bg-[hsl(var(--primary))] data-[state=active]:text-[hsl(var(--primary-foreground))] "
        >
          Tools
        </TabsTrigger>
      </TabsList>
      <TabsContent value="machines">
        {machineryData.length > 0 ? (
          <TableComponent
            data={machineryData}
            columns={machineryColumns}
            valueType="Machinery"
            locations={locations}
          />
        ) : (
          <TableComponent
            data={[]}
            columns={machineryColumns}
            valueType="Machinery"
            locations={locations}
          />
        )}
      </TabsContent>
      <TabsContent value="parts">
        {partData.length > 0 ? (
          <TableComponent
            data={partData}
            columns={partsColumns}
            valueType="Part"
            locations={locations}
          />
        ) : (
          <TableComponent data={[]} columns={partsColumns} valueType="Part" locations={locations} />
        )}
      </TabsContent>

      <TabsContent value="tools">
        {toolData.length > 0 ? (
          <TableComponent
            data={toolData}
            columns={toolsColumns}
            valueType="Tool"
            locations={locations}
          />
        ) : (
          <TableComponent data={[]} columns={toolsColumns} valueType="Tool" locations={locations} />
        )}
      </TabsContent>
    </Tabs>
  );
}
