/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { auth } from "@clerk/nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import { db } from "~/server/db";
import { machineryImages, partImages, toolImages } from "~/server/db/schema";
import {
  addImageToEmployee,
  updateEmployee,
} from "~/server/queries/employee/queries";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // imageUploader: f({ image: { maxFileSize: "4MB" } })
  //   // Set permissions and file types for this FileRoute
  //   .middleware(async () => {
  //     // This code runs on your server before upload

  //     const user = auth();

  //     // If you throw, the user will not be able to upload
  //     if (!user.userId) throw new UploadThingError("Unauthorized");

  //     // Whatever is returned here is accessible in onUploadComplete as `metadata`
  //     return { userId: user.userId };
  //   })
  //   .onUploadComplete(async ({ metadata, file }) => {
  //     // This code RUNS ON YOUR SERVER after upload

  //     console.log("upload complete to the user id:", metadata.userId);
  //     // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
  //   }),

  // MACHINERY IMAGE UPLOADER --------------------------------------------------------------------------------------------

  // Define as many FileRoutes as you like, each with a unique routeSlug
  machineryImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .input(
      z.object({
        machine_id: z.number(),
      }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload

      const user = auth();

      // If you throw, the user will not be able to upload
      if (!user.userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId, input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      await db.insert(machineryImages).values({
        machine_id: metadata.input.machine_id,
        image_url: file.url,
        image_key: file.key,
      });
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

  // TOOL IMAGE UPLOADER --------------------------------------------------------------------------------------------

  toolImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .input(
      z.object({
        tool_id: z.number(),
      }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload

      const user = auth();

      // If you throw, the user will not be able to upload
      if (!user.userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId, input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      await db.insert(toolImages).values({
        tool_id: metadata.input.tool_id,
        image_url: file.url,
        image_key: file.key,
      });
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

  // PART IMAGE UPLOADER --------------------------------------------------------------------------------------------

  partImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .input(
      z.object({
        part_id: z.number(),
      }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload

      const user = auth();

      // If you throw, the user will not be able to upload
      if (!user.userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId, input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      await db.insert(partImages).values({
        part_id: metadata.input.part_id,
        image_url: file.url,
        image_key: file.key,
      });
      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { uploadedBy: metadata.userId };
    }),

  // EMPLOYEE IMAGE UPLOADER --------------------------------------------------------------------------------------------
  employeeImageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 10 } })
    .input(
      z.object({
        employee_id: z.number(),
      }),
    )
    // Set permissions and file types for this FileRoute
    .middleware(async ({ input }) => {
      // This code runs on your server before upload

      const user = auth();

      // If you throw, the user will not be able to upload
      if (!user.userId) throw new UploadThingError("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: user.userId, input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      await addImageToEmployee(metadata.input.employee_id, file.url, file.key);
      return { uploadedBy: metadata.userId };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
