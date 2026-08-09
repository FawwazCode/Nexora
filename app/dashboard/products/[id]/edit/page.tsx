"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ProductForm, type ProductFormValues } from "@/components/admin/product-form";
import { ArrowLeft, Edit3, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<Partial<ProductFormValues> | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${params.id}`);
        if (!response.ok) {
          toast.error("Product not found");
          router.replace("/dashboard/products");
          return;
        }
        const product = await response.json();
        setInitialValues({
          name: product.name,
          slug: product.slug,
          description: product.description,
          shortDescription: product.shortDescription ?? "",
          brandName: product.brand?.name ?? "",
          categoryId: product.category?.id ?? "",
          categoryName: product.category?.name ?? "",
          isFeatured: product.isFeatured,
          isPublished: product.isPublished,
          sku: product.variants?.[0]?.sku ?? "",
          price: Number(product.variants?.[0]?.price ?? 0),
          stock: Number(product.variants?.[0]?.stock ?? 0),
          color: product.variants?.[0]?.color ?? "",
          ram: product.variants?.[0]?.ram ?? "",
          storage: product.variants?.[0]?.storage ?? "",
          barcode: product.variants?.[0]?.barcode ?? "",
          thumbnail: product.thumbnail ?? "",
        });
      } catch {
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id, router]);

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PATCH",
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
        throw new Error(data.message || "Failed to update product");
      }

      toast.success(`Product "${values.name}" updated successfully!`);
      router.push("/dashboard/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update product");
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
            <Edit3 className="w-7 h-7 text-[#7F46FA]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            <p className="mt-0.5 text-sm text-indigo-200">
              Update pricing, inventory stock, images, and visibility.
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

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#7F46FA] mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">Loading product details...</p>
        </div>
      ) : (
        <ProductForm
          initialValues={initialValues}
          submitting={submitting}
          submitLabel="Save changes"
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
