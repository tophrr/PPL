import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const body = await request.json();

  const { email, password } = body;

  // contoh validasi sederhana
  if (email === 'admin@gmail.com' && password === '123456') {
    return NextResponse.json({
      success: true,
      message: 'Login successful',
    });
  }

  return NextResponse.json(
    {
      success: false,
      message: 'Invalid email or password',
    },
    { status: 401 },
  );
}
