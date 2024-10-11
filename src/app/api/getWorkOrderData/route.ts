import { NextResponse } from 'next/server';
import { getMachineries } from '~/server/queries/machinery/queries';
import { getUsers } from '~/server/queries/user/queries';

export async function GET(request: Request) {
  const machinery = await getMachineries();
  const users = await getUsers();
  return NextResponse.json({
    machinery,
    users,
  });
}
