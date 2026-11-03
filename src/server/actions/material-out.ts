"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { MaterialOutVoucherSchema, MaterialOutVoucherInput } from "@/lib/schemas/material-out";

export async function getMaterialOutVouchers() {
  try {
    const vouchers = await prisma.materialOutVoucher.findMany({
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
    console.error("Error fetching Material Out vouchers:", error);
    return { success: false, error: error.message };
  }
}

export async function createMaterialOutVoucher(input: MaterialOutVoucherInput) {
  try {
    const validated = MaterialOutVoucherSchema.parse(input);

    const voucherNumber =
      validated.voucherNo?.trim() ||
      `MO-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${Math.floor(
        1000 + Math.random() * 9000
      )}`;

    // Execute within atomic transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Validate stock availability for each item
      for (const line of validated.items) {
        const material = await tx.material.findUnique({
          where: { id: line.materialId },
        });

        if (!material) {
          throw new Error(`Material with ID "${line.materialId}" does not exist.`);
        }

        if (material.currentStock < line.quantity) {
          throw new Error(
            `Insufficient stock for "${material.name}" (${material.itemCode}). Available: ${material.currentStock} ${material.unit}, Requested: ${line.quantity} ${material.unit}.`
          );
        }
      }

      // 2. Create voucher header with siteLocation
      const voucher = await tx.materialOutVoucher.create({
        data: {
          voucherNo: voucherNumber,
          date: new Date(validated.date),
          projectName: validated.projectName,
          siteLocation: validated.siteLocation,
          requisitionNo: validated.requisitionNo,
          recipient: validated.recipient,
          notes: validated.notes || null,
          status: "COMPLETED",
        },
      });

      // 3. Process each line item with atomic conditional update
      for (const line of validated.items) {
        await tx.materialOutItem.create({
          data: {
            voucherId: voucher.id,
            materialId: line.materialId,
            quantity: line.quantity,
            notes: line.notes || null,
          },
        });

        // Decrement stock
        const updatedMaterial = await tx.material.update({
          where: { id: line.materialId },
          data: {
            currentStock: {
              decrement: line.quantity,
            },
          },
        });

        // Invariant guard
        if (updatedMaterial.currentStock < 0) {
          throw new Error(
            `Transaction aborted: Invariant violation. Stock would drop below zero.`
          );
        }

        // Append to immutable audit ledger with siteLocation
        await tx.inventoryLedger.create({
          data: {
            materialId: line.materialId,
            transactionType: "MATERIAL_OUT",
            voucherReference: voucher.voucherNo,
            quantityDelta: -line.quantity,
            balanceAfter: updatedMaterial.currentStock,
            operator: validated.recipient,
            notes: `Issued to ${validated.projectName} (Work Area: ${validated.siteLocation}, Recipient: ${validated.recipient}, Req: ${validated.requisitionNo})`,
          },
        });
      }

      return voucher;
    });

    revalidatePath("/material-out");
    revalidatePath("/materials");
    revalidatePath("/ledger");
    revalidatePath("/");

    return { success: true, data: result };
  } catch (error: any) {
    console.error("Error creating Material Out voucher:", error);
    return { success: false, error: error.message || "Failed to process Material Out issuance" };
  }
}

export async function cancelMaterialOutVoucher(voucherId: string, reason?: string) {
  try {
    const voucher = await prisma.materialOutVoucher.findUnique({
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

    // Execute cancellation atomically in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Mark voucher as CANCELLED
      await tx.materialOutVoucher.update({
        where: { id: voucherId },
        data: { status: "CANCELLED" },
      });

      // 2. Increment currentStock back and log compensating ledger entry
      for (const item of voucher.items) {
        const updated = await tx.material.update({
          where: { id: item.materialId },
          data: {
            currentStock: {
              increment: item.quantity,
            },
          },
        });

        await tx.inventoryLedger.create({
          data: {
            materialId: item.materialId,
            transactionType: "ADJUSTMENT",
            voucherReference: `REV-${voucher.voucherNo}`,
            quantityDelta: item.quantity,
            balanceAfter: updated.currentStock,
            operator: voucher.recipient || "Admin",
            notes: `Cancelled Material Out voucher ${voucher.voucherNo}${
              reason ? `: ${reason}` : ""
            }`,
          },
        });
      }
    });

    revalidatePath("/material-out");
    revalidatePath("/materials");
    revalidatePath("/ledger");
    revalidatePath("/");

    return { success: true, voucherNo: voucher.voucherNo };
  } catch (error: any) {
    console.error("Error cancelling Material Out voucher:", error);
    return { success: false, error: error.message || "Failed to cancel voucher" };
  }
}
