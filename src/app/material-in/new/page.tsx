import React from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { MaterialInForm } from "@/components/forms/material-in-form";

export default function NewMaterialInPage() {
  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          New Material In Voucher
        </h1>
        <p className="text-sm text-slate-500">
          Record inbound stock shipments. Inventory will be automatically increased and recorded in the audit ledger.
        </p>
      </div>

      <MaterialInForm />
    </PageTransition>
  );
}

