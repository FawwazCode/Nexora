"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CategoryForm, type CategoryFormValues } from "@/components/admin/category-form";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<CategoryFormValues> | null>(null);

  useEffect(() => {
    const fetchCategory = async () => {
      const response = await fetch(`/api/admin/categories/${params.id}`);
      if (!response.ok) {
        router.replace("/dashboard/categories");
        return;
      }
      const category = await response.json();
      setInitialValues({
        name: category.name,
        slug: category.slug,
        description: category.description ?? "",
        isActive: category.isActive,
      });
    };

    if (params.id) {
      fetchCategory();
    }
  }, [params.id, router]);

  const handleSubmit = async (values: CategoryFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          isActive: Boolean(values.isActive),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      router.push("/dashboard/categories");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to update category");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Edit Category</h2>
        <p className="mt-2 text-sm text-gray-600">Update category details and visibility.</p>
      </div>
      <CategoryForm initialValues={initialValues} submitting={submitting} submitLabel="Save changes" onSubmit={handleSubmit} />
    </div>
  );
}
