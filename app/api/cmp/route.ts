import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Hardcoding CMP for demonstration purposes.
    const cmp = {cmp:20000};

    // Returning the hardcoded CMP in the response.
    return NextResponse.json(cmp);
  } catch { return NextResponse.json({ error: "Something went wrong"}, { status: 500 })}
}