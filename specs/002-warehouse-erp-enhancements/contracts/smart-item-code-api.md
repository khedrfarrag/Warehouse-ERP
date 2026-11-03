# Contract: Smart Item Code Generator

**Feature**: [spec.md](../spec.md) | **Protocol**: Server Utility & Next.js Server Action

## Smart Code Specification
* **Pattern**: `${countryCode}-${categoryCode}${attributeCode}${unitCode}${sequenceNumber}`
* **Example**: `EGY-15200001`
  * `EGY`: Country Warehouse Code (default: `EGY`, selectable: `KSA`, `UAE`, `CHN`, etc.)
  * `1`: Category Numeric Code (from `Category.code`)
  * `5`: Attribute / Sub-class code (user-defined or default `0`-`9`)
  * `2`: Unit Numeric Code (from `UnitOfMeasure.code`)
  * `00001`: Padded 5-digit sequence computed from highest existing sequence in database.

### Invocation: `POST /api/materials/generate-code` or Server Action `generateSmartItemCode`
* **Input Schema**:
```typescript
z.object({
  countryCode: z.string().length(3).default("EGY"),
  categoryCode: z.string().min(1).max(3),
  attributeCode: z.string().min(1).max(3).default("0"),
  unitCode: z.string().min(1).max(3)
});
```

* **Response `200 OK`**:
```json
{
  "success": true,
  "generatedCode": "EGY-15200001",
  "nextSequence": 1
}
```

