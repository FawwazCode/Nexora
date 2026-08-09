"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CategoryForm, type CategoryFormValues } from "@/components/admin/category-form";

export default function NewCategoryPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          isActive: Boolean(values.isActive),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      router.push("/dashboard/categories");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to create category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Create Category</h2>
        <p className="mt-2 text-sm text-gray-600">Add a new category to organize your product catalog.</p>
      </div>
      <CategoryForm submitting={submitting} submitLabel="Create category" onSubmit={handleSubmit} />
    </div>
  );
}
