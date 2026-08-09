"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Loader2, Edit, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

type Brand = {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  createdAt: string;
  _count: { products: number };
};

type BrandsResponse = {
  items: Brand[];
  total: number;
  page: number;
  pageSize: number;
};

export default function DashboardBrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    logo: "",
  });

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/brands?${params.toString()}`);
      if (response.status === 403) {
        router.replace("/dashboard");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch brands");
      }
      const data: BrandsResponse = await response.json();
      setBrands(data.items);
      setTotal(data.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, [search, page]);

  const handleOpenAddModal = () => {
    setEditingBrand(null);
    setFormData({ name: "", slug: "", logo: "" });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (brand: Brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || "",
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (name: string) => {
    const slug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    setFormData((prev) => ({ ...prev, name, slug: editingBrand ? prev.slug : slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.slug.trim()) {
      toast.error("Brand name and slug are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingBrand ? `/api/admin/brands/${editingBrand.id}` : "/api/admin/brands";
      const method = editingBrand ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Operation failed");
      }

      toast.success(editingBrand ? "Brand updated successfully" : "Brand created successfully");
      setIsModalOpen(false);
      await fetchBrands();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (brand: Brand) => {
    if (brand._count.products > 0) {
      toast.error("Cannot delete brand associated with products");
      return;
    }

    if (!confirm(`Are you sure you want to delete brand "${brand.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/brands/${brand.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete brand");
      }

      toast.success("Brand deleted successfully");
      await fetchBrands();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete brand");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Brands Management</h2>
          <p className="mt-1 text-sm text-gray-600">Organize and manage manufacturer product brands.</p>
        </div>
        <Button className="bg-[#7F46FA] hover:bg-[#6B3DD9]" onClick={handleOpenAddModal}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search brands..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      {loading && brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-[#7F46FA]" />
          <p className="mt-3 text-sm text-gray-500">Loading brands...</p>
        </div>
      ) : brands.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <Tag className="mx-auto h-10 w-10 text-gray-300 mb-2" />
          <p className="font-medium text-gray-900">No brands found</p>
          <p className="mt-1 text-sm text-gray-500">
            {search ? "Try a different search term" : "Create your first brand to group catalog items."}
          </p>
          <Button className="mt-4 bg-[#7F46FA] hover:bg-[#6B3DD9]" onClick={handleOpenAddModal}>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {brands.map((brand) => (
            <div
              key={brand.id}
              className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#7F46FA]/40"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center">
                    {brand.logo ? (
                      <Image src={brand.logo} alt={brand.name} fill className="object-contain p-1" unoptimized />
                    ) : (
                      <Tag className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                  <span className="text-xs font-semibold bg-purple-50 text-[#7F46FA] px-2.5 py-1 rounded-full">
                    {brand._count.products} products
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900">{brand.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Slug: {brand.slug}</p>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 border-t border-gray-100 pt-3">
                <Button size="sm" variant="outline" onClick={() => handleOpenEditModal(brand)}>
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(brand)}
                  disabled={brand._count.products > 0}
                  className="text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, total)} of {total} brands
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

      {/* Add / Edit Brand Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">
              {editingBrand ? "Edit Brand" : "Add New Brand"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="brandName">Brand Name *</Label>
                <Input
                  id="brandName"
                  placeholder="e.g. Apple"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brandSlug">Slug *</Label>
                <Input
                  id="brandSlug"
                  placeholder="e.g. apple"
                  value={formData.slug}
                  onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="brandLogo">Logo URL (Optional)</Label>
                <Input
                  id="brandLogo"
                  placeholder="https://example.com/logo.png"
                  value={formData.logo}
                  onChange={(e) => setFormData((prev) => ({ ...prev, logo: e.target.value }))}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="bg-[#7F46FA] hover:bg-[#6B3DD9]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : null}
                  {editingBrand ? "Update Brand" : "Create Brand"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
