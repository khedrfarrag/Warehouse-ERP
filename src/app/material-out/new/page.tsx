import React from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { MaterialOutForm } from "@/components/forms/material-out-form";

export default function NewMaterialOutPage() {
  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New Material Out Issuance
        </h1>
        <p className="text-sm text-slate-500">
          Authorize outbound stock dispatch. The system verifies stock availability in real time and guards against negative inventory.
        </p>
      </div>

      <MaterialOutForm />
    </PageTransition>
  );
}

