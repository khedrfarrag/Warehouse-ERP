import { NextRequest, NextResponse } from "next/server";
import { getMaterials, createMaterial, generateNextItemCode } from "@/server/actions/materials";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  const result = await getMaterials({ query, categoryId, page, limit });
  return NextResponse.json(result, { status: result.success ? 200 : 500 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === "generate-code") {
      const codeResult = await generateNextItemCode(body);
      return NextResponse.json(codeResult);
    }
    const result = await createMaterial(body);
    return NextResponse.json(result, { status: result.success ? 201 : 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
