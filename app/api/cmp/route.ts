import { NextResponse } from 'next/server';
import * as stockService from '../../../services/stockService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const underlyingId = searchParams.get('underlyingId');
  if (!underlyingId) {
    return NextResponse.json({ error: 'underlyingId is required' }, { status: 400 });
  }
  const cmp = stockService.getCMPByStockId(underlyingId);
  return NextResponse.json({ cmp });
}