/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getAllUsers } from '~/server/queries/queries';

export async function GET(req: NextRequest) {
  try {
    const users = await getAllUsers();
    const usersWithoutAdmin = users.filter(
      (user) => Array.isArray(user.org) && user.org[0]!.name !== 'admin'
    );
    return NextResponse.json({ data: usersWithoutAdmin }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to get users' }, { status: 500 });
  }
}
