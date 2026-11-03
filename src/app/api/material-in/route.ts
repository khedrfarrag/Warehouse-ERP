import { NextRequest, NextResponse } from "next/server";
import { getMaterialInVouchers, createMaterialInVoucher } from "@/server/actions/material-in";

export async function GET() {
  const result = await getMaterialInVouchers();
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createMaterialInVoucher(body);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

