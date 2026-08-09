"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  _count: { products: number };
};

type CategoriesResponse = {
  items: Category[];
  total: number;
  page: number;
  pageSize: number;
};

export default function DashboardCategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    fetchCategories();
  }, [search, page]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/categories?${params.toString()}`);
      if (response.status === 403) {
        router.replace("/dashboard");
        return;
      }
      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }
      const data: CategoriesResponse = await response.json();
      setCategories(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    router.push("/dashboard/categories/new");
  };

  const handleEdit = (category: Category) => {
    router.push(`/dashboard/categories/${category.id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const response = await fetch(`/api/admin/categories?id=${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(typeof data?.message === "string" ? data.message : "Failed to delete category");
      }
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  const handleActiveToggle = async (category: Category) => {
    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: category.id, isActive: !category.isActive }),
      });
      if (!response.ok) throw new Error("Failed to update category status");
      await fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update category status");
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && categories.length === 0) {
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
          <h2 className="text-xl font-semibold text-gray-900">Categories Management</h2>
          <p className="mt-2 text-sm text-gray-600">Organize product categories and taxonomy.</p>
        </div>
        <Button className="bg-[#7F46FA] hover:bg-[#6B3DD9]" onClick={handleCreate}>
          Add Category
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
          <Button variant="link" onClick={fetchCategories} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      {!error && categories.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
          <p className="font-medium text-gray-900">No categories found</p>
          <p className="mt-2 text-sm text-gray-500">
            {search ? "Try a different search term or create a new category." : "Create your first category to organize products."}
          </p>
          <Button className="mt-4 bg-[#7F46FA] hover:bg-[#6B3DD9]" onClick={handleCreate}>
            Add Category
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {categories.map((category) => (
            <div key={category.id} className="rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{category.name}</p>
                    {!category.isActive && (
                      <Badge variant="outline" className="text-gray-600 border-gray-300">
                        Inactive
                      </Badge>
                    )}
                    {category.isDeleted && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        Deleted
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{category.description ?? "No description"}</p>
                  <p className="text-xs text-gray-400 mt-1">Slug: {category.slug}</p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-medium text-gray-900">{category._count.products} products</p>
                  <div className="flex gap-2 mt-2 justify-end">
                    {category.isDeleted ? (
                      <span className="text-sm text-gray-400">Cannot restore deleted categories</span>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(category)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handleActiveToggle(category)}>
                          {category.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(category.id)}
                          disabled={category._count.products > 0}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                  {category._count.products > 0 && !category.isDeleted && (
                    <p className="text-xs text-gray-400 mt-1">Cannot delete with products</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} categories
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
    </div>
  );
}
