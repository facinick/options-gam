import { NextResponse } from 'next/server';

export async function GET() {
  const bankBalance = 100000;
  return NextResponse.json({ bankBalance });
}



