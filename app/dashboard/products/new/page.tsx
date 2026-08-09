"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { ArrowLeft, PackagePlus } from "lucide-react";
import { toast } from "sonner";

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          price: Number(values.price),
          stock: Number(values.stock),
          isFeatured: Boolean(values.isFeatured),
          isPublished: Boolean(values.isPublished),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create product");
      }

      toast.success(`Product "${values.name}" created successfully!`);
      router.push("/dashboard/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
            <PackagePlus className="w-7 h-7 text-[#7F46FA]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Product</h1>
            <p className="mt-0.5 text-sm text-indigo-200">
              Fill in product details, pricing, inventory stock, and classification.
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/products"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/10 transition shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products List
        </Link>
      </div>

      {/* Main Form Card */}
      <ProductForm submitting={submitting} submitLabel="Create Product" onSubmit={handleSubmit} />
    </div>
  );
}
