import { NextResponse } from 'next/server';
import { zodSchemas } from '../../../lib/zod';
import * as positionsService from '../../../services/positionsService';

export async function GET() {
  try {
    const positions = await positionsService.getAllPositions();
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
    const newPosition = await positionsService.addPosition(parseResult.data);
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
    const deletedPosition = await positionsService.deletePosition(id);
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
    const updatedPosition = await positionsService.updatePosition(parseResult.data);
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
