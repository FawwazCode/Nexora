"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2, Edit, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";

type ProductSummary = {
  id: string;
  name: string;
  slug: string;
};

type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  barcode: string | null;
  color: string;
  ram: string;
  storage: string;
  weight: number | null;
  price: number;
  stock: number;
  isActive: boolean;
  product: ProductSummary;
};

type VariantsResponse = {
  items: ProductVariant[];
  total: number;
  page: number;
  pageSize: number;
};

export default function DashboardVariantsPage() {
  const router = useRouter();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [productsList, setProductsList] = useState<ProductSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    productId: "",
    sku: "",
    barcode: "",
    color: "Default",
    ram: "8GB",
    storage: "256GB",
    price: 0,
    stock: 10,
    isActive: true,
  });

  const fetchVariants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/variants?${params.toString()}`);
      if (response.status === 403) {
        router.replace("/dashboard");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch variants");
      }
      const data: VariantsResponse = await response.json();
      setVariants(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load variants");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsForSelect = async () => {
    try {
      const res = await fetch("/api/admin/products?pageSize=50");
      if (res.ok) {
        const data = await res.json();
        setProductsList(data.items.map((p: { id: string; name: string; slug: string }) => ({ id: p.id, name: p.name, slug: p.slug })));
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [search, page]);

  useEffect(() => {
    fetchProductsForSelect();
  }, []);

  const handleOpenAddModal = () => {
    setEditingVariant(null);
    setFormData({
      productId: productsList[0]?.id || "",
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      barcode: "",
      color: "Default",
      ram: "8GB",
      storage: "256GB",
      price: 99.99,
      stock: 10,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (variant: ProductVariant) => {
    setEditingVariant(variant);
    setFormData({
      productId: variant.productId,
      sku: variant.sku,
      barcode: variant.barcode || "",
      color: variant.color,
      ram: variant.ram,
      storage: variant.storage,
      price: Number(variant.price),
      stock: variant.stock,
      isActive: variant.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productId) {
      toast.error("Please select a product");
      return;
    }
    if (!formData.sku.trim()) {
      toast.error("SKU is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingVariant ? `/api/admin/variants/${editingVariant.id}` : "/api/admin/variants";
      const method = editingVariant ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Operation failed");
      }

      toast.success(editingVariant ? "Variant updated successfully" : "Variant created successfully");
      setIsModalOpen(false);
      await fetchVariants();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save variant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (variant: ProductVariant) => {
    if (!confirm(`Are you sure you want to delete variant SKU "${variant.sku}"?`)) return;

    try {
      const res = await fetch(`/api/admin/variants/${variant.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete variant");
      }

      toast.success("Variant deleted successfully");
      await fetchVariants();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete variant");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product Variants</h2>
          <p className="mt-1 text-sm text-gray-600">Manage pricing, stock levels, and SKUs for product options.</p>
        </div>
        <Button className="bg-[#7F46FA] hover:bg-[#6B3DD9]" onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Variant
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by SKU, color, or product..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {loading && variants.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#7F46FA]" />
          <p className="mt-3 text-sm text-gray-500">Loading product variants...</p>
        </div>
      ) : variants.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <Layers className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <p className="font-medium text-gray-900">No product variants found</p>
          <p className="mt-1 text-sm text-gray-500">
            {search ? "Try a different search query" : "Create a variant for your products to manage stock & price."}
          </p>
          <Button className="mt-4 bg-[#7F46FA] hover:bg-[#6B3DD9]" onClick={handleOpenAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Variant
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Color / RAM / Storage</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {variants.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 font-semibold text-gray-900">
                    {v.product?.name || "Unknown Product"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{v.sku}</td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-medium text-gray-800">{v.color}</span> • {v.ram} • {v.storage}
                  </td>
                  <td className="px-4 py-3 font-semibold text-gray-900">${Number(v.price).toFixed(2)}</td>
                  <td className="px-4 py-3">
                    <span className={v.stock <= 5 ? "font-bold text-amber-600" : "text-gray-900"}>
                      {v.stock} pcs
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {v.isActive ? (
                      <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="border-gray-300 text-gray-500">
                        Disabled
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEditModal(v)}>
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(v)}
                        className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} variants
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add / Edit Variant Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              {editingVariant ? "Edit Product Variant" : "Add Product Variant"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingVariant && (
                <div className="space-y-1.5">
                  <Label htmlFor="productId">Parent Product *</Label>
                  <select
                    id="productId"
                    value={formData.productId}
                    onChange={(e) => setFormData((prev) => ({ ...prev, productId: e.target.value }))}
                    className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[#7F46FA] focus:outline-none"
                    required
                  >
                    {productsList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="variantSku">SKU Code *</Label>
                  <Input
                    id="variantSku"
                    placeholder="e.g. NXR-APL-256"
                    value={formData.sku}
                    onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="variantBarcode">Barcode</Label>
                  <Input
                    id="variantBarcode"
                    placeholder="e.g. 194253000000"
                    value={formData.barcode}
                    onChange={(e) => setFormData((prev) => ({ ...prev, barcode: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="variantColor">Color *</Label>
                  <Input
                    id="variantColor"
                    placeholder="Space Gray"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="variantRam">RAM *</Label>
                  <Input
                    id="variantRam"
                    placeholder="16GB"
                    value={formData.ram}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ram: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="variantStorage">Storage *</Label>
                  <Input
                    id="variantStorage"
                    placeholder="512GB"
                    value={formData.storage}
                    onChange={(e) => setFormData((prev) => ({ ...prev, storage: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="variantPrice">Price ($) *</Label>
                  <Input
                    id="variantPrice"
                    type="number"
                    step="0.01"
                    placeholder="999.00"
                    value={formData.price}
                    onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="variantStock">Initial Stock *</Label>
                  <Input
                    id="variantStock"
                    type="number"
                    placeholder="10"
                    value={formData.stock}
                    onChange={(e) => setFormData((prev) => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="variantActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-[#7F46FA] focus:ring-[#7F46FA]"
                />
                <Label htmlFor="variantActive" className="text-sm font-medium text-gray-700">
                  Active for Store Display
                </Label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#7F46FA] hover:bg-[#6B3DD9]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  {editingVariant ? "Update Variant" : "Create Variant"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
