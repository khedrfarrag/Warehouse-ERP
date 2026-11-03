"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MaterialInVoucherSchema, MaterialInVoucherInput } from "@/lib/schemas/material-in";

export async function getMaterialInVouchers() {
  try {
    const vouchers = await prisma.materialInVoucher.findMany({
      include: {
        items: {
          include: {
            material: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: vouchers };
  } catch (error: any) {
    console.error("Error fetching Material In vouchers:", error);
    return { success: false, error: error.message };
  }
}

export async function createMaterialInVoucher(input: MaterialInVoucherInput) {
  try {
    const validated = MaterialInVoucherSchema.parse(input);

    const voucherNumber =
      validated.voucherNo?.trim() ||
      `MI-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    // Execute within atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create voucher header
      const voucher = await tx.materialInVoucher.create({
        data: {
          voucherNo: voucherNumber,
          date: new Date(validated.date),
          supplierName: validated.supplierName,
          poNumber: validated.poNumber || null,
          deliveryNote: validated.deliveryNote || null,
          receivedBy: validated.receivedBy,
          notes: validated.notes || null,
          status: "COMPLETED",
        },
      });

      // 2. Process each line item
      for (const line of validated.items) {
        // Create line item record
        await tx.materialInItem.create({
          data: {
            voucherId: voucher.id,
            materialId: line.materialId,
            quantity: line.quantity,
            unitPrice: line.unitPrice || 0,
            notes: line.notes || null,
          },
        });

        // Increment current stock atomically
        const updatedMaterial = await tx.material.update({
          where: { id: line.materialId },
          data: {
            currentStock: {
              increment: line.quantity,
            },
          },
        });

        // Append to immutable audit ledger
        await tx.inventoryLedger.create({
          data: {
            materialId: line.materialId,
            transactionType: "MATERIAL_IN",
            voucherReference: voucher.voucherNo,
            quantityDelta: line.quantity,
            balanceAfter: updatedMaterial.currentStock,
            operator: validated.receivedBy,
            notes: `Received from ${validated.supplierName}${
              validated.deliveryNote ? ` (DN: ${validated.deliveryNote})` : ""
            }`,
          },
        });
      }

      return voucher;
    });

    revalidatePath("/material-in");
    revalidatePath("/materials");
    revalidatePath("/ledger");
    revalidatePath("/");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating Material In voucher:", error);
    return { success: false, error: error.message || "Failed to process Material In receipt" };
  }
}

export async function cancelMaterialInVoucher(voucherId: string, reason?: string) {
  try {
    const voucher = await prisma.materialInVoucher.findUnique({
      where: { id: voucherId },
      include: {
        items: {
          include: {
            material: true,
          },
        },
      },
    });

    if (!voucher) {
      return { success: false, error: "Voucher not found" };
    }

    if (voucher.status === "CANCELLED") {
      return { success: false, error: "Voucher is already cancelled" };
    }

    // Invariance Check: Verify reducing currentStock by item.quantity won't cause negative stock
    for (const item of voucher.items) {
      if (item.material.currentStock < item.quantity) {
        return {
          success: false,
          error: `Cannot cancel voucher: Material "${item.material.name}" only has ${item.material.currentStock} on hand, but received ${item.quantity}. Cancelling would cause negative stock.`,
        };
      }
    }

    // Execute cancellation atomically in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark voucher as CANCELLED
      await tx.materialInVoucher.update({
        where: { id: voucherId },
        data: { status: "CANCELLED" },
      });

      // 2. Decrement currentStock and log compensating ledger entry
      for (const item of voucher.items) {
        const updated = await tx.material.update({
          where: { id: item.materialId },
          data: {
            currentStock: {
              decrement: item.quantity,
            },
          },
        });

        await tx.inventoryLedger.create({
          data: {
            materialId: item.materialId,
            transactionType: "ADJUSTMENT",
            voucherReference: `REV-${voucher.voucherNo}`,
            quantityDelta: -item.quantity,
            balanceAfter: updated.currentStock,
            operator: voucher.receivedBy || "Admin",
            notes: `Cancelled Material In voucher ${voucher.voucherNo}${
              reason ? `: ${reason}` : ""
            }`,
          },
        });
      }
    });

    revalidatePath("/material-in");
    revalidatePath("/materials");
    revalidatePath("/ledger");
    revalidatePath("/");

    return { success: true, voucherNo: voucher.voucherNo };
  } catch (error: any) {
    console.error("Error cancelling Material In voucher:", error);
    return { success: false, error: error.message || "Failed to cancel voucher" };
  }
}
