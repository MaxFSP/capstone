import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { promises as fs } from "fs";
import path from "path";
import { getWorkOrderById } from "~/server/queries/workOrder/queries";
import { getColumnTasksByWorkOrderId } from "~/server/queries/columnsWorkOrder/queries";
import { getTasksByWorkOrderId } from "~/server/queries/workTask/queries";
import { getMachineryById } from "~/server/queries/machinery/queries";
import { getUserById } from "~/server/queries/user/queries";
import { getEmployeeById } from "~/server/queries/employee/queries";

export async function POST(req: Request) {
  try {
    const { orderId } = await req.json();

    // Fetch work order data
    const workOrder = await getWorkOrderById(orderId);
    if (!workOrder) throw new Error("Work order not found");

    const columns = await getColumnTasksByWorkOrderId(orderId);
    if (!columns) throw new Error("Columns not found");

    const tasks = await getTasksByWorkOrderId(orderId);
    if (!tasks) throw new Error("Tasks not found");

    const machinery = await getMachineryById(workOrder.machine_id);
    if (!machinery) throw new Error("Machinery not found");

    const user = await getUserById(workOrder.assigned_user);
    if (!user) throw new Error("User not found");

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Read images directly from the file system
    const logoPath = path.join(process.cwd(), "public", "icons", "192.png");
    const watermarkPath = path.join(
      process.cwd(),
      "public",
      "icons",
      "512.png",
    );

    const logoBytes = await fs.readFile(logoPath);
    const watermarkBytes = await fs.readFile(watermarkPath);

    const logoImage = await pdfDoc.embedPng(logoBytes);
    const watermarkImage = await pdfDoc.embedPng(watermarkBytes);

    const logoDims = logoImage.scale(0.25);
    const watermarkDims = watermarkImage.scale(1);

    // Get the current date for the footer
    const currentDate = new Date().toLocaleDateString();

    // Function to add watermark and logo to each page
    const addPage = () => {
      const newPage = pdfDoc.addPage([600, 800]);

      // Draw the watermark at the center with reduced opacity
      newPage.drawImage(watermarkImage, {
        x: (newPage.getWidth() - watermarkDims.width) / 2,
        y: (newPage.getHeight() - watermarkDims.height) / 2,
        width: watermarkDims.width,
        height: watermarkDims.height,
        opacity: 0.15,
      });

      // Draw the header bar
      newPage.drawRectangle({
        x: 0,
        y: newPage.getHeight() - 50,
        width: newPage.getWidth(),
        height: 50,
        color: rgb(255 / 255, 196 / 255, 37 / 255),
      });

      // Header text
      newPage.drawText("Work Order Report", {
        x: 20,
        y: newPage.getHeight() - 35,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      // Draw logo on the top right corner above the header
      newPage.drawImage(logoImage, {
        x: newPage.getWidth() - logoDims.width, // Adjusted position
        y: newPage.getHeight() - logoDims.height,
        width: logoDims.width,
        height: logoDims.height,
      });

      // Add the current date in the top left
      newPage.drawText(`Generated on: ${currentDate}`, {
        x: 20,
        y: newPage.getHeight() - 65,
        size: 12,
        font,
        color: rgb(128 / 255, 128 / 255, 128 / 255),
      });

      // Footer with page number
      newPage.drawText(`Page ${pdfDoc.getPages().length}`, {
        x: newPage.getWidth() - 50,
        y: 20,
        size: 12,
        font,
        color: rgb(128 / 255, 128 / 255, 128 / 255),
      });

      return { page: newPage, yOffset: 70 };
    };

    let { page, yOffset } = addPage();

    // Add Work Order details
    page.drawRectangle({
      x: 40,
      y: page.getHeight() - yOffset - 160,
      width: page.getWidth() - 80,
      height: 160,
      borderColor: rgb(128 / 255, 128 / 255, 128 / 255),
      borderWidth: 2,
      color: rgb(240 / 255, 240 / 255, 240 / 255),
    });

    // Function to draw work order details
    const drawWorkOrderDetail = (label: string, value: string, y: number) => {
      page.drawText(label, {
        x: 50,
        y: page.getHeight() - y,
        size: 10,
        font: boldFont,
        color: rgb(128 / 255, 128 / 255, 128 / 255),
      });
      page.drawText(value, {
        x: 150,
        y: page.getHeight() - y,
        size: 12,
        font,
        color: rgb(0, 0, 0),
      });
    };

    // Work order details
    drawWorkOrderDetail(
      "Order ID:",
      workOrder.order_id.toString(),
      yOffset + 20,
    );
    drawWorkOrderDetail("Name:", workOrder.name, yOffset + 40);
    drawWorkOrderDetail(
      "Machine:",
      `${machinery.brand} ${machinery.model} (${machinery.serial_number})`,
      yOffset + 60,
    );
    drawWorkOrderDetail(
      "Assigned to:",
      `${user.first_name} ${user.last_name}`,
      yOffset + 80,
    );
    drawWorkOrderDetail(
      "Start Date:",
      workOrder.start_date.toDateString(),
      yOffset + 100,
    );

    if (workOrder.end_date) {
      drawWorkOrderDetail(
        "End Date:",
        workOrder.end_date.toDateString(),
        yOffset + 120,
      );
    } else {
      drawWorkOrderDetail("End Date:", "No end date", yOffset + 120);
    }

    drawWorkOrderDetail(
      "Status:",
      workOrder.state === 1 ? "Active" : "Completed",
      yOffset + 140,
    );

    yOffset += 160;

    // Section for Columns and Tasks
    page.drawRectangle({
      x: 40,
      y: page.getHeight() - yOffset - 40,
      width: page.getWidth() - 80,
      height: 30,
      color: rgb(255 / 255, 196 / 255, 37 / 255),
    });

    page.drawText("Columns and Tasks", {
      x: 50,
      y: page.getHeight() - yOffset - 30,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    yOffset += 60;

    // Iterate over columns and tasks
    for (const column of columns) {
      if (yOffset > page.getHeight() - 100) {
        ({ page, yOffset } = addPage());
      }

      if (column.state === 0) {
        continue;
      }

      // Draw column title with a separator line
      page.drawText(`Column: ${column.title}`, {
        x: 50,
        y: page.getHeight() - yOffset,
        size: 14,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yOffset += 10;

      page.drawLine({
        start: { x: 50, y: page.getHeight() - yOffset },
        end: { x: page.getWidth() - 50, y: page.getHeight() - yOffset },
        thickness: 1,
        color: rgb(128 / 255, 128 / 255, 128 / 255),
      });

      yOffset += 15;

      const columnTasks = tasks.filter(
        (task) => task.column_id === column.column_id,
      );
      for (const task of columnTasks) {
        if (yOffset > page.getHeight() - 120) {
          ({ page, yOffset } = addPage());
        }

        // Task box
        page.drawRectangle({
          x: 60,
          y: page.getHeight() - yOffset - 80,
          width: page.getWidth() - 120,
          height: 80,
          borderColor: rgb(128 / 255, 128 / 255, 128 / 255),
          borderWidth: 1,
          color: rgb(240 / 255, 240 / 255, 240 / 255),
        });

        page.drawText(`Task: ${task.title}`, {
          x: 70,
          y: page.getHeight() - yOffset - 15,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        const employee = await getEmployeeById(task.assigned_to);
        page.drawText(
          `Assigned to: ${employee ? `${employee.firstName} ${employee.lastName}` : "Unassigned"}`,
          {
            x: 70,
            y: page.getHeight() - yOffset - 35,
            size: 10,
            font,
            color: rgb(128 / 255, 128 / 255, 128 / 255),
          },
        );

        page.drawText(`Priority: ${task.priority}`, {
          x: 70,
          y: page.getHeight() - yOffset - 55,
          size: 10,
          font,
          color: rgb(128 / 255, 128 / 255, 128 / 255),
        });

        page.drawText(
          `Status: ${task.state === 1 ? "In Progress" : "Completed"}`,
          {
            x: 70,
            y: page.getHeight() - yOffset - 75,
            size: 10,
            font,
            color: rgb(128 / 255, 128 / 255, 128 / 255),
          },
        );

        yOffset += 110;
      }
    }

    // Serialize and return the PDF
    const pdfBytes = await pdfDoc.save();

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Work_Order_Report_${orderId}.pdf"`,
      },
    });
  } catch (error) {
    console.error(
      "Error generating work order report:",
      error instanceof Error ? error.stack : error,
    );
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 },
    );
  }
}
