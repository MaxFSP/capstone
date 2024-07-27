// pages/api/userLoggedIn/route.ts

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAuth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = getAuth(req);
  if (!userId) {
    return NextResponse.json({ data: "Unauthorized" }, { status: 201 });
  }
  NextResponse.json({ data: "Authorized" }, { status: 200 });
}
