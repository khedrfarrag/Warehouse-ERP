"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, ArrowUpFromLine, Loader2, AlertCircle, Boxes, Image as ImageIcon } from "lucide-react";
import { MaterialOutVoucherSchema, MaterialOutVoucherInput } from "@/lib/schemas/material-out";
import { createMaterialOutVoucher } from "@/server/actions/material-out";
import { MaterialSelectorModal, SelectedMaterial } from "@/components/materials/material-selector-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export function MaterialOutForm() {
  const router = useRouter();
  const { t, direction } = useI18n();
  const [submitting, setSubmitting] = useState(false);
  const [selectorIndex, setSelectorIndex] = useState<number | null>(null);
  const [selectedMaterialsCache, setSelectedMaterialsCache] = useState<Record<number, SelectedMaterial>>({});

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MaterialOutVoucherInput>({
    resolver: zodResolver(MaterialOutVoucherSchema),
    defaultValues: {
      voucherNo: "",
      date: new Date().toISOString().split("T")[0],
      projectName: "",
      siteLocation: "",
      requisitionNo: "",
      recipient: "",
      notes: "",
      items: [{ materialId: "", quantity: 1, notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  const handleMaterialSelected = (material: SelectedMaterial) => {
    if (selectorIndex !== null) {
      setValue(`items.${selectorIndex}.materialId`, material.id, { shouldValidate: true });
      setSelectedMaterialsCache((prev) => ({ ...prev, [selectorIndex]: material }));
    }
  };

  const onSubmit = async (data: MaterialOutVoucherInput) => {
    setSubmitting(true);
    try {
      const res = await createMaterialOutVoucher(data);
      if (res.success) {
        toast.success(
          `Material Out voucher ${res.data?.voucherNo} recorded successfully! Inventory updated.`
        );
        router.push("/material-out");
      } else {
        toast.error(res.error || "Failed to create Material Out voucher");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpFromLine className="h-5 w-5 text-amber-600" />
              {t.vouchers.outTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.common.date} *
              </label>
              <Input type="date" {...register("date")} dir="ltr" />
              {errors.date && (
                <p className="text-xs text-rose-500 mt-1">{errors.date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.projectName} *
              </label>
              <Input
                {...register("projectName")}
                placeholder="e.g. Sinai Cement Line 2 Expansion"
              />
              {errors.projectName && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.projectName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.siteLocation} *
              </label>
              <Input
                {...register("siteLocation")}
                placeholder="e.g. Kiln Foundation Pier B, Section 4"
              />
              {errors.siteLocation && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.siteLocation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.requisitionNo} *
              </label>
              <Input
                {...register("requisitionNo")}
                placeholder="e.g. REQ-2026-081"
                dir="ltr"
              />
              {errors.requisitionNo && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.requisitionNo.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.recipient} *
              </label>
              <Input
                {...register("recipient")}
                placeholder="e.g. Eng. Ahmed / Electrical Team"
              />
              {errors.recipient && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.recipient.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.voucherNo} ({t.common.optional})
              </label>
              <Input
                {...register("voucherNo")}
                placeholder="Auto-generated e.g. MO-202610-001"
                dir="ltr"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {t.vouchers.itemsTable}
            </CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ materialId: "", quantity: 1, notes: "" })}
              className="gap-1.5 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-950"
            >
              <Plus className="h-4 w-4" />
              {t.common.add}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const selectedItem = selectedMaterialsCache[index];
              const enteredQty = watchedItems?.[index]?.quantity || 0;
              const hasInsufficientStock =
                selectedItem && enteredQty > selectedItem.currentStock;

              return (
                <div
                  key={field.id}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-3 p-3.5 rounded-xl border transition-colors ${
                    hasInsufficientStock
                      ? "border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                  }`}
                >
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t.materials.name} *
                    </label>
                    <input type="hidden" {...register(`items.${index}.materialId` as const)} />

                    {selectedItem ? (
                      <div className="flex items-center justify-between p-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {selectedItem.imageUrl ? (
                            <img
                              src={selectedItem.imageUrl}
                              alt={selectedItem.name}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center text-amber-600">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-mono text-xs font-bold text-amber-700 dark:text-amber-400" dir="ltr">
                              {selectedItem.itemCode}
                            </span>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                              {selectedItem.name} (Available: {selectedItem.currentStock} {selectedItem.unit})
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectorIndex(index)}
                          className="h-7 text-xs text-amber-600 hover:text-amber-700"
                        >
                          {t.common.edit}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setSelectorIndex(index)}
                        className="w-full justify-start text-xs text-slate-500 h-10 border-dashed gap-2"
                      >
                        <Boxes className="h-4 w-4 text-amber-600" />
                        {t.materials.catalogTitle}...
                      </Button>
                    )}

                    {errors.items?.[index]?.materialId && (
                      <p className="text-xs text-rose-500 mt-1">
                        Please select a material
                      </p>
                    )}
                  </div>

                  <div className="w-full md:w-36">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t.vouchers.quantity} *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      {...register(`items.${index}.quantity` as const)}
                      placeholder="Qty"
                      dir="ltr"
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-xs text-rose-500 mt-1">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                    {hasInsufficientStock && (
                      <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Exceeds on-hand stock ({selectedItem.currentStock})
                      </p>
                    )}
                  </div>

                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t.common.notes}
                    </label>
                    <Input
                      {...register(`items.${index}.notes` as const)}
                      placeholder={t.common.notes}
                    />
                  </div>

                  <div className="self-end md:self-center pt-2 md:pt-5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      disabled={fields.length === 1}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {errors.items?.root && (
              <p className="text-sm text-rose-500">{errors.items.root.message}</p>
            )}
          </CardContent>

          <CardFooter className="flex justify-between items-center py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/material-out")}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.vouchers.newMaterialOut}
            </Button>
          </CardFooter>
        </Card>
      </form>

      {/* Reusable Material Selector Modal */}
      <MaterialSelectorModal
        isOpen={selectorIndex !== null}
        onClose={() => setSelectorIndex(null)}
        onSelect={handleMaterialSelected}
      />
    </>
  );
}
