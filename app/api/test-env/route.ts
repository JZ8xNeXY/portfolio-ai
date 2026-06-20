import { NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  return NextResponse.json({
    hasToken: !!token,
    tokenPrefix: token ? token.substring(0, 20) + '...' : 'undefined',
    allEnvKeys: Object.keys(process.env).filter(key => key.includes('BLOB')),
  });
}
