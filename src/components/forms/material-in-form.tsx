"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Plus, Trash2, ArrowDownToLine, Loader2, Boxes, Image as ImageIcon } from "lucide-react";
import { MaterialInVoucherSchema, MaterialInVoucherInput } from "@/lib/schemas/material-in";
import { createMaterialInVoucher } from "@/server/actions/material-in";
import { MaterialSelectorModal, SelectedMaterial } from "@/components/materials/material-selector-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { useI18n } from "@/lib/i18n";

export function MaterialInForm() {
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
    formState: { errors },
  } = useForm<MaterialInVoucherInput>({
    resolver: zodResolver(MaterialInVoucherSchema),
    defaultValues: {
      voucherNo: "",
      date: new Date().toISOString().split("T")[0],
      supplierName: "",
      poNumber: "",
      deliveryNote: "",
      receivedBy: "",
      notes: "",
      items: [{ materialId: "", quantity: 1, unitPrice: 0, notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const handleMaterialSelected = (material: SelectedMaterial) => {
    if (selectorIndex !== null) {
      setValue(`items.${selectorIndex}.materialId`, material.id, { shouldValidate: true });
      setSelectedMaterialsCache((prev) => ({ ...prev, [selectorIndex]: material }));
    }
  };

  const onSubmit = async (data: MaterialInVoucherInput) => {
    setSubmitting(true);
    try {
      const res = await createMaterialInVoucher(data);
      if (res.success) {
        toast.success(
          `Material In voucher ${res.data?.voucherNo} created successfully! Stock updated.`
        );
        router.push("/material-in");
      } else {
        toast.error(res.error || "Failed to create Material In voucher");
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
              <ArrowDownToLine className="h-5 w-5 text-emerald-600" />
              {t.vouchers.inTitle}
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
                {t.vouchers.supplierName} *
              </label>
              <Input
                {...register("supplierName")}
                placeholder="e.g. Sinoma Building Materials"
              />
              {errors.supplierName && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.supplierName.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.receivedBy} *
              </label>
              <Input
                {...register("receivedBy")}
                placeholder="e.g. Warehouse Clerk Name"
              />
              {errors.receivedBy && (
                <p className="text-xs text-rose-500 mt-1">
                  {errors.receivedBy.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.deliveryNote}
              </label>
              <Input {...register("deliveryNote")} placeholder="e.g. DN-2026-99" dir="ltr" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.poNumber}
              </label>
              <Input {...register("poNumber")} placeholder="e.g. PO-8472" dir="ltr" />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                {t.vouchers.voucherNo} ({t.common.optional})
              </label>
              <Input
                {...register("voucherNo")}
                placeholder="Auto-generated e.g. MI-202610-001"
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
              onClick={() =>
                append({ materialId: "", quantity: 1, unitPrice: 0, notes: "" })
              }
              className="gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950"
            >
              <Plus className="h-4 w-4" />
              {t.common.add}
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            {fields.map((field, index) => {
              const selectedItem = selectedMaterialsCache[index];

              return (
                <div
                  key={field.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40"
                >
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t.materials.name} *
                    </label>
                    <input type="hidden" {...register(`items.${index}.materialId` as const)} />

                    {selectedItem ? (
                      <div className="flex items-center justify-between p-2 rounded-lg border border-sky-200 dark:border-sky-800 bg-white dark:bg-slate-800">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          {selectedItem.imageUrl ? (
                            <img
                              src={selectedItem.imageUrl}
                              alt={selectedItem.name}
                              className="h-8 w-8 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-lg bg-sky-100 dark:bg-sky-900 flex items-center justify-center text-sky-600">
                              <ImageIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div>
                            <span className="font-mono text-xs font-bold text-sky-700 dark:text-sky-300" dir="ltr">
                              {selectedItem.itemCode}
                            </span>
                            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate">
                              {selectedItem.name} ({selectedItem.unit})
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectorIndex(index)}
                          className="h-7 text-xs text-sky-600 hover:text-sky-700"
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
                        <Boxes className="h-4 w-4 text-emerald-600" />
                        {t.materials.catalogTitle}...
                      </Button>
                    )}

                    {errors.items?.[index]?.materialId && (
                      <p className="text-xs text-rose-500 mt-1">
                        Please select a material
                      </p>
                    )}
                  </div>

                  <div className="w-full md:w-32">
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
                  </div>

                  <div className="w-full md:w-32">
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">
                      {t.vouchers.unitPrice}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      {...register(`items.${index}.unitPrice` as const)}
                      placeholder="Price"
                      dir="ltr"
                    />
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
              onClick={() => router.push("/material-in")}
            >
              {t.common.cancel}
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.vouchers.newMaterialIn}
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
