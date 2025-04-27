// User-specific bank balance API route
import { NextResponse } from 'next/server';
import * as userService from '../../../../services/userService';

export async function GET() {
  // In a real app, get userId from auth/session
  const userId = '1';
  const bankBalance = userService.getUserBankBalance(userId);
  console.log("bankBalance", bankBalance);
  return NextResponse.json(bankBalance);
} 