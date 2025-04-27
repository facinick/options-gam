// User-specific positions API route
import { NextResponse } from 'next/server';
import { zodSchemas } from '../../../../lib/zod';
import * as userService from '../../../../services/userService';

const userId = '1'; // In a real app, get userId from auth/session

export async function GET() {
  try {
    const positions = userService.getUserPositions(userId);
    return NextResponse.json(positions);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parseResult = zodSchemas.position.omit({ id: true }).safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const newPosition = userService.addUserPosition(userId, parseResult.data);
    return NextResponse.json(newPosition);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const deletedPosition = userService.deleteUserPosition(userId, id);
    if (!deletedPosition) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }
    return NextResponse.json(deletedPosition);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parseResult = zodSchemas.position.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const updatedPosition = userService.updateUserPosition(userId, parseResult.data);
    if (!updatedPosition) {
      return NextResponse.json({ error: "Position not found" }, { status: 404 });
    }
    return NextResponse.json(updatedPosition);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return NextResponse.json({ message: "Options request received" }, { status: 200 });
}
