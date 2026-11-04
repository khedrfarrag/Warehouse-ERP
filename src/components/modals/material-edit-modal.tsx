"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2, Upload, Image as ImageIcon, Trash2 } from "lucide-react";
import { UpdateMaterialSchema, UpdateMaterialInput } from "@/lib/schemas/material";
import { updateMaterial } from "@/server/actions/materials";
import { getCategories } from "@/server/actions/categories";
import { getUnitsOfMeasure } from "@/server/actions/units";
import { parseSinomaItemCode } from "@/lib/sinoma-coding-system";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

interface MaterialEditModalProps {
  material: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function MaterialEditModal({
  material,
  isOpen,
  onClose,
  onSuccess,
}: MaterialEditModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateMaterialInput>({
    resolver: zodResolver(UpdateMaterialSchema),
  });

  useEffect(() => {
    if (isOpen && material) {
      Promise.all([getCategories(), getUnitsOfMeasure()]).then(([cats, uoms]) => {
        if (cats.success && cats.data) setCategories(cats.data);
        if (uoms.success && uoms.data) setUnits(uoms.data);
      });

      reset({
        name: material.name,
        categoryId: material.categoryId || undefined,
        unitId: material.unitId || undefined,
        location: material.location,
        minStock: material.minStock,
        imageUrl: material.imageUrl || null,
        description: material.description || null,
      });

      setPreviewImage(material.imageUrl || null);
    }
  }, [isOpen, material, reset]);

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
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const fileUrl = data.url || data.imageUrl;
      setPreviewImage(fileUrl);
      setValue("imageUrl", fileUrl);
      toast.success(t.common.success);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const removePhoto = () => {
    setPreviewImage(null);
    setValue("imageUrl", null);
  };

  const onSubmit = async (data: UpdateMaterialInput) => {
    if (!material) return;
    setLoading(true);
    try {
      const res = await updateMaterial(material.id, data);
      if (res.success) {
        toast.success(t.materials.editSuccess);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to update material");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !material) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.materials.editMaterial}
              </h2>
              <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400" dir="ltr">
                  {material.itemCode}
                </span>
                {(() => {
                  const parsed = parseSinomaItemCode(material.itemCode);
                  if (!parsed) return null;
                  return (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-semibold border border-sky-200 dark:border-sky-800">
                      [{parsed.mainCode}] {parsed.mainCategory?.name} • [{parsed.subCode}] {parsed.subCategory?.name} • [{parsed.unitCode}] {parsed.unit?.abbreviation}
                    </span>
                  );
                })()}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.materials.name} <span className="text-rose-500">*</span>
              </label>
              <Input {...register("name")} placeholder={t.materials.name} />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Category & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.materials.category}
                </label>
                <select
                  {...register("categoryId")}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">{t.common.select}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.materials.unit}
                </label>
                <select
                  {...register("unitId")}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">{t.common.select}</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.abbreviation})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Safety Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.materials.location} <span className="text-rose-500">*</span>
                </label>
                <Input {...register("location")} placeholder="e.g. Bay 3, Rack B" />
                {errors.location && (
                  <p className="text-xs text-rose-500 mt-1">{errors.location.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  {t.materials.minStock}
                </label>
                <Input type="number" step="any" {...register("minStock")} dir="ltr" />
                {errors.minStock && (
                  <p className="text-xs text-rose-500 mt-1">{errors.minStock.message}</p>
                )}
              </div>
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.materials.photo}
              </label>
              {previewImage ? (
                <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1 group">
                  <img
                    src={previewImage}
                    alt="Material photo"
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute top-1 right-1 p-1 rounded-full bg-rose-600 text-white shadow hover:bg-rose-700 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-xs font-medium text-slate-600 dark:text-slate-400">
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                    ) : (
                      <Upload className="h-4 w-4 text-sky-600" />
                    )}
                    <span>{t.materials.uploadPhoto}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                  </label>
                  <span className="text-[11px] text-slate-400">{t.materials.photoHint}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.materials.description}
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder={t.materials.description}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.common.save}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

