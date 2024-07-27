/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { deleteImageMachinery } from "~/server/queries/machinery/queries";
import { deleteImagePart } from "~/server/queries/part/queries";
import { deleteImageTool } from "~/server/queries/tool/queries";
import { type DeleteImage } from "~/server/types/IImages";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    // Type assertion
    const data: DeleteImage = body;

    if (data.type === "Machinery") {
      const result = await deleteImageMachinery(data.image_id);
      const utapi = new UTApi();
      await utapi.deleteFiles(data.image_key);
      return NextResponse.json({ data: result }, { status: 200 });
    } else if (data.type === "Part") {
      const result = await deleteImagePart(data.image_id);
      const utapi = new UTApi();
      await utapi.deleteFiles(data.image_key);
      return NextResponse.json({ data: result }, { status: 200 });
    } else if (data.type === "Tool") {
      const result = await deleteImageTool(data.image_id);
      const utapi = new UTApi();
      await utapi.deleteFiles(data.image_key);
      return NextResponse.json({ data: result }, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to create Machinery" },
      { status: 500 },
    );
  }
}
