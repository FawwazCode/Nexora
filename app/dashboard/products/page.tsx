"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const emptyForm = {
  name: "",
  slug: "",
  description: "",
  shortDescription: "",
  brandName: "",
  categoryName: "",
  isFeatured: false,
  isPublished: false,
  sku: "",
  price: 0,
  stock: 0,
  color: "Default",
  ram: "8GB",
  storage: "256GB",
  barcode: "",
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  isDeleted: boolean;
  createdAt: Date;
  brand: { id: string; name: string } | null;
  category: { id: string; name: string } | null;
  variants: Array<{
    id: string;
    price: number;
    stock: number;
    sku: string;
    isActive: boolean;
  }>;
};

type ProductsResponse = {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
};

export default function DashboardProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "published" | "draft">("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [form, setForm] = useState(emptyForm);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [search, status, page]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append("search", search);
      if (status !== "all") params.append("status", status);

      const response = await fetch(`/api/admin/products?${params.toString()}`);
      if (response.status === 403) {
        router.replace("/dashboard");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      const data: ProductsResponse = await response.json();
      setProducts(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingProductId(null);
    setShowForm(false);
  };

  const handleCreate = () => {
    router.push("/dashboard/products/new");
  };

  const handleEdit = (product: Product) => {
    router.push(`/dashboard/products/${product.id}/edit`);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        isFeatured: Boolean(form.isFeatured),
        isPublished: Boolean(form.isPublished),
      };

      const response = editingProductId
        ? await fetch(`/api/admin/products/${editingProductId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/products", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      if (!response.ok) {
        throw new Error("Failed to save product");
      }

      await fetchProducts();
      resetForm();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete product");
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleRestore = async (id: string) => {
    try {
      const response = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to restore product");
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to restore product");
    }
  };

  const handlePublishToggle = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isPublished: !product.isPublished }),
      });
      if (!response.ok) throw new Error("Failed to update product status");
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update product status");
    }
  };

  const handleFeaturedToggle = async (product: Product) => {
    try {
      const response = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, isFeatured: !product.isFeatured }),
      });
      if (!response.ok) throw new Error("Failed to update featured status");
      await fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update featured status");
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && products.length === 0) {
    return (
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Products Management</h2>
          <p className="mt-2 text-sm text-gray-600">Manage product catalog, pricing, and availability.</p>
        </div>
        <Button className="bg-[#7F46FA] hover:bg-[#6B3DD9]" onClick={handleCreate}>Add Product</Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 bg-gray-50 p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            <Input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} required />
            <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} required />
            <Input placeholder="Brand name" value={form.brandName} onChange={(e) => setForm({ ...form, brandName: e.target.value })} />
            <Input placeholder="Category name" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} />
            <Input placeholder="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })} />
          </div>
          <Input placeholder="Short description" value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} />
          <textarea
            className="min-h-24 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} />
              Published
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
              Featured
            </label>
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="bg-[#7F46FA] hover:bg-[#6B3DD9]" disabled={submitting}>
              {submitting ? "Saving..." : editingProductId ? "Save changes" : "Create product"}
            </Button>
            <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="flex gap-4">
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={(value: "all" | "published" | "draft" | null) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
          <Button variant="link" onClick={fetchProducts} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {products.map((product) => (
          <div key={product.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  {product.isFeatured && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-200">Featured</Badge>
                  )}
                  {product.isDeleted && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      Deleted
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{product.brand?.name ?? "Unbranded"}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {product.category?.name ?? "No category"} • SKU {product.variants[0]?.sku ?? "N/A"}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="font-medium text-gray-900">
                  ${product.variants[0]?.price ? Number(product.variants[0].price).toFixed(2) : "0.00"}
                </p>
                <p className="text-sm text-gray-500">
                  {product.variants[0]?.stock ?? 0} in stock
                </p>
                <div className="flex gap-2 mt-2 justify-end">
                  {product.isDeleted ? (
                    <Button size="sm" variant="outline" onClick={() => handleRestore(product.id)}>
                      Restore
                    </Button>
                  ) : (
                    <>
                      <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handlePublishToggle(product)}>
                        {product.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleFeaturedToggle(product)}>
                        {product.isFeatured ? "Unfeature" : "Feature"}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(product.id)}>
                        Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} products
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
