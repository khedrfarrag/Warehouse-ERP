"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Loader2, Sparkles, Upload, Image as ImageIcon } from "lucide-react";
import { MaterialSchema, MaterialInput } from "@/lib/schemas/material";
import { createMaterial, generateNextItemCode } from "@/server/actions/materials";
import { getCategories } from "@/server/actions/categories";
import { getUnitsOfMeasure } from "@/server/actions/units";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

interface MaterialFormProps {
  onSuccess?: () => void;
}

export function MaterialModal({ onSuccess }: MaterialFormProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Smart SKU Generator Fields
  const [countryCode, setCountryCode] = useState("EGY");
  const [attributeCode, setAttributeCode] = useState("5");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<MaterialInput>({
    resolver: zodResolver(MaterialSchema),
    defaultValues: {
      itemCode: "",
      name: "",
      categoryId: "",
      unitId: "",
      imageUrl: "",
      minStock: 0,
      location: "",
      description: "",
    },
  });

  const selectedCategoryId = watch("categoryId");
  const selectedUnitId = watch("unitId");

  useEffect(() => {
    if (isOpen) {
      Promise.all([getCategories(), getUnitsOfMeasure()]).then(([cats, uoms]) => {
        if (cats.success && cats.data) {
          setCategories(cats.data);
          if (cats.data.length > 0 && !selectedCategoryId) {
            setValue("categoryId", cats.data[0].id);
          }
        }
        if (uoms.success && uoms.data) {
          setUnits(uoms.data);
          if (uoms.data.length > 0 && !selectedUnitId) {
            setValue("unitId", uoms.data[0].id);
          }
        }
      });
    }
  }, [isOpen]);

  // Trigger Smart Code Generation when Category or Unit changes
  useEffect(() => {
    if (selectedCategoryId && selectedUnitId && categories.length > 0 && units.length > 0) {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      const uom = units.find((u) => u.id === selectedUnitId);

      if (cat && uom) {
        generateNextItemCode({
          countryCode,
          categoryCode: cat.code,
          attributeCode,
          unitCode: uom.code,
        }).then((res) => {
          if (res.success && res.itemCode) {
            setValue("itemCode", res.itemCode);
          }
        });
      }
    }
  }, [selectedCategoryId, selectedUnitId, countryCode, attributeCode, categories, units]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to upload file");
      }

      const fileUrl = data.url || data.imageUrl;
      setValue("imageUrl", fileUrl);
      setPreviewImage(fileUrl);
      toast.success(t.common.success);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: MaterialInput) => {
    setLoading(true);
    try {
      const res = await createMaterial(data);
      if (res.success) {
        toast.success(
          `Material "${data.name}" (${data.itemCode}) registered successfully!`
        );
        reset();
        setPreviewImage(null);
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to create material");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
      >
        <Plus className="h-4 w-4" />
        {t.materials.newMaterial}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 my-8"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {t.materials.newMaterial}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Auto-computes normalized code and attaches item photo
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
                {/* Smart Code Generation Controls */}
                <div className="p-4 rounded-xl bg-sky-50/60 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/60 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5" />
                    Smart SKU Generator Parameters
                  </span>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Country Site
                      </label>
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        <option value="EGY">EGY (Egypt Site)</option>
                        <option value="KSA">KSA (Saudi Site)</option>
                        <option value="UAE">UAE (Dubai Site)</option>
                        <option value="CHN">CHN (Sinoma HQ)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.materials.category} *
                      </label>
                      <select
                        {...register("categoryId")}
                        className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            [{c.code}] {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        {t.materials.unit} *
                      </label>
                      <select
                        {...register("unitId")}
                        className="h-9 w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
                      >
                        {units.map((u) => (
                          <option key={u.id} value={u.id}>
                            [{u.code}] {u.abbreviation} - {u.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1">
                      {t.materials.itemCode} *
                    </label>
                    <Input
                      {...register("itemCode")}
                      placeholder="e.g. EGY-15200001"
                      dir="ltr"
                      className="font-mono text-base font-bold text-sky-700 dark:text-sky-300 tracking-wider uppercase bg-white dark:bg-slate-800"
                    />
                    {errors.itemCode && (
                      <p className="text-xs text-rose-500 mt-1">{errors.itemCode.message}</p>
                    )}
                  </div>
                </div>

                {/* Material Details */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {t.materials.name} *
                  </label>
                  <Input
                    {...register("name")}
                    placeholder="e.g. Deformed High-Tensile Steel Rebar 16mm"
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      {t.materials.minStock} *
                    </label>
                    <Input
                      type="number"
                      step="any"
                      {...register("minStock")}
                      placeholder="0"
                      dir="ltr"
                    />
                    {errors.minStock && (
                      <p className="text-xs text-rose-500 mt-1">{errors.minStock.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                      {t.materials.location} *
                    </label>
                    <Input
                      {...register("location")}
                      placeholder="e.g. Yard 2 - Bay C"
                    />
                    {errors.location && (
                      <p className="text-xs text-rose-500 mt-1">{errors.location.message}</p>
                    )}
                  </div>
                </div>

                {/* Photo Upload */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {t.materials.photo}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden bg-slate-50 dark:bg-slate-800/60 p-1">
                      {previewImage ? (
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <ImageIcon className="h-8 w-8 text-slate-400" />
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                          <Loader2 className="h-5 w-5 animate-spin text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 dark:file:bg-sky-950 file:text-sky-700 dark:file:text-sky-300 hover:file:bg-sky-100 cursor-pointer"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        {t.materials.photoHint}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {t.materials.description}
                  </label>
                  <Input
                    {...register("description")}
                    placeholder={t.materials.description}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    disabled={loading}
                  >
                    {t.common.cancel}
                  </Button>
                  <Button type="submit" disabled={loading} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t.common.create}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
