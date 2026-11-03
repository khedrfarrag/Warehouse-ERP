# Contract: Material Image Upload API

**Feature**: [spec.md](../spec.md) | **Protocol**: Next.js Route Handler / Server Action

## Upload Material Image
* **Endpoint**: `POST /api/upload`
* **Content-Type**: `multipart/form-data`
* **Form Field**: `file` (File binary: PNG, JPEG, or WebP up to 5MB)

### Validation Rules
* Allowed MIME types: `image/jpeg`, `image/png`, `image/webp`.
* Maximum size: 5 MB (5,242,880 bytes).
* Output file saved to: `public/uploads/materials/[unique-id].[ext]`.

### Response `200 OK`
```json
{
  "success": true,
  "imageUrl": "/uploads/materials/mat-992a-16mm-rebar.webp",
  "fileName": "mat-992a-16mm-rebar.webp",
  "size": 412800
}
```

### Error Responses
* `400 Bad Request`: "Invalid file format. Only JPEG, PNG, and WebP images are permitted."
* `413 Payload Too Large`: "File size exceeds the 5MB limit."

