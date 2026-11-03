import { NextRequest, NextResponse } from "next/server";
import { getInventoryLedger } from "@/server/actions/ledger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const materialId = searchParams.get("materialId") || undefined;
  const transactionType = searchParams.get("transactionType") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const result = await getInventoryLedger({
    materialId,
    transactionType,
    startDate,
    endDate,
  });

  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

