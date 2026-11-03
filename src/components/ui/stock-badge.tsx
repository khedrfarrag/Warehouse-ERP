import React from "react";
import { Badge } from "./badge";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface StockBadgeProps {
  currentStock: number;
  minStock: number;
  unit: string;
}

export function StockBadge({ currentStock, minStock, unit }: StockBadgeProps) {
  const isLowStock = currentStock <= minStock;

  if (isLowStock) {
    return (
      <Badge variant="warning" className="gap-1 font-mono">
        <AlertTriangle className="h-3 w-3 text-amber-600" />
        <span suppressHydrationWarning dir="ltr">
          {formatNumber(currentStock)} {unit} (Low Stock ≤ {formatNumber(minStock)})
        </span>
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="gap-1 font-mono">
      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
      <span suppressHydrationWarning dir="ltr">
        {formatNumber(currentStock)} {unit}
      </span>
    </Badge>
  );
}
