// pages/api/allowUser/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  const { userId } = getAuth(req);

  if (!userId) return NextResponse.redirect("/sign-in");

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const identifier: string = await req.json();

    await clerkClient.allowlistIdentifiers.createAllowlistIdentifier({
      identifier: identifier,
      notify: false,
    });

    return NextResponse.json({
      message: "User allowed successfully",
    });
  } catch (error) {
    console.error("Failed to allowed user:", error);
    return NextResponse.json(
      { error: "Failed to allowed user" },
      { status: 500 },
    );
  }
}
