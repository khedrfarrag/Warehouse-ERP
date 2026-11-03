import { NextRequest, NextResponse } from "next/server";
import { getMaterialOutVouchers, createMaterialOutVoucher } from "@/server/actions/material-out";

export async function GET() {
  const result = await getMaterialOutVouchers();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createMaterialOutVoucher(body);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

