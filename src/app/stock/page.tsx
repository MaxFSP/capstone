import { getParts } from "~/server/queries/part/queries";
import { getTools } from "~/server/queries/tool/queries";
import { getMachineries } from "~/server/queries/machinery/queries";
import TableComponent from "../_components/tableComponent";
import {
  machineryStockColumns,
  partStockColumns,
  toolStockColumns,
} from "~/server/types/constants";

const partsColumns = [
  { key: "name", label: "Name" },
  { key: "condition", label: "Condition" },
  { key: "quantity", label: "Quantity" },
];

const toolsColumns = [
  { key: "name", label: "Name" },
  { key: "condition", label: "Condition" },
  { key: "quantity", label: "Quantity" },
];

const machineryColumns = [
  { key: "brand", label: "Brand" },
  { key: "model", label: "Model" },
  { key: "serial_number", label: "Serial Number" },
];

import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

export default async function StockPage() {
  const machineryData = await getMachineries();
  const partData = await getParts();
  const toolData = await getTools();
  return (
    <Tabs defaultValue="machines">
      <TabsList className="m-4 grid grid-cols-3 sm:w-full md:w-1/2">
        <TabsTrigger value="machines">Machines</TabsTrigger>
        <TabsTrigger value="parts">Parts</TabsTrigger>
        <TabsTrigger value="tools">Tools</TabsTrigger>
      </TabsList>
      <TabsContent value="machines">
        <TableComponent
          data={machineryData}
          columns={machineryColumns}
          dbColumns={machineryStockColumns}
        />
      </TabsContent>
      <TabsContent value="parts">
        <TableComponent
          data={partData}
          columns={partsColumns}
          dbColumns={partStockColumns}
        />
      </TabsContent>

      <TabsContent value="tools">
        <TableComponent
          data={toolData}
          columns={toolsColumns}
          dbColumns={toolStockColumns}
        />
      </TabsContent>
    </Tabs>
  );
}
