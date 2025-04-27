import { NextResponse } from 'next/server';
import * as userService from '../../../services/userService';

export async function GET() {
  // In a real app, get userId from auth/session
  const userId = '1';
  const user = userService.getUserById(userId);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  const positions = userService.getUserPositions(userId);
  const bankBalance = userService.getUserBankBalance(userId);
  return NextResponse.json({ user, positions, bankBalance });
}
