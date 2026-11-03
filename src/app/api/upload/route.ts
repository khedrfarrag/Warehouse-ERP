import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 }
      );
    }

    // 1. Validate MIME type & file extension (support AVIF, WebP, PNG, JPEG, JFIF, SVG, BMP)
    const validMimes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/jpg",
      "image/avif",
      "image/jfif",
      "image/pjpeg",
      "image/bmp",
      "image/svg+xml",
      "image/gif",
    ];
    const validExtensions = ["jpg", "jpeg", "png", "webp", "avif", "jfif", "bmp", "svg", "gif"];
    const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";

    const isMimeValid = validMimes.includes(file.type.toLowerCase());
    const isExtValid = validExtensions.includes(fileExtension);

    if (!isMimeValid && !isExtValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Supported formats: AVIF, WebP, PNG, JPEG, JFIF, SVG, BMP.",
        },
        { status: 400 }
      );
    }

    // 2. Validate Size (30MB limit to comfortably accept high-res 4K/8K photos of any dimensions)
    const MAX_SIZE = 30 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "File exceeds 30MB limit" },
        { status: 413 }
      );
    }

    // 3. Prepare storage directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = join(process.cwd(), "public", "uploads", "materials");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    const extension = fileExtension || "jpg";
    const uniqueFileName = `mat-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 8)}.${extension}`;
    const filePath = join(uploadsDir, uniqueFileName);

    await writeFile(filePath, buffer);

    const imageUrl = `/uploads/materials/${uniqueFileName}`;
    return NextResponse.json({
      success: true,
      url: imageUrl,
      imageUrl,
      fileName: uniqueFileName,
    });
  } catch (error: any) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image" },
      { status: 500 }
    );
  }
}

