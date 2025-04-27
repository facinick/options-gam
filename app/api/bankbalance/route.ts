import { NextResponse } from 'next/server';
import * as bankBalanceService from '../../../services/bankBalanceService';

export async function GET() {
  const bankBalance = await bankBalanceService.getBankBalance();
  return NextResponse.json(bankBalance);
}



