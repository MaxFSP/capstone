/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { createRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import { UTApi } from "uploadthing/server";
import { type DeleteImage } from "~/server/types/IImages";

// Export routes for Next App Router
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,

  // Apply an (optional) custom config:
  // config: { ... },
});
export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const data: DeleteImage = body;
    const utapi = new UTApi();
    await utapi.deleteFiles(data.image_key);

    return Response.json({ message: "ok" });
  } catch (error) {
    console.error(error);
    return Response.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
