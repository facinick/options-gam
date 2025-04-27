import { NextResponse } from 'next/server';
import { z } from 'zod';
import * as stockService from '../../../services/stockService';

/**
 * GET /api/positions?underlyingId=...&cmp=...
 * Returns all available strike prices for the given underlying and cmp.
 * Query params:
 *   - underlyingId: string (required)
 *   - cmp: number (required)
 */
export async function GET(request: Request) {
  // Parse query params
  const { searchParams } = new URL(request.url);
  const underlyingId = searchParams.get('underlyingId');
  const cmpStr = searchParams.get('cmp');

  // Validate params
  const schema = z.object({
    underlyingId: z.string().min(1),
    cmp: z.preprocess((v) => Number(v), z.number().finite()),
  });
  const parseResult = schema.safeParse({ underlyingId, cmp: cmpStr });
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 });
  }
  const { underlyingId: validUnderlyingId, cmp } = parseResult.data;
  try {
    const positions = stockService.getAvailableStrikes(validUnderlyingId, cmp);
    return NextResponse.json(positions);
  } catch {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
