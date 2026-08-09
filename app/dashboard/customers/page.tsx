"use client";

import { useState, useEffect } from "react";
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

type Customer = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  isActive: boolean;
  _count: { orders: number };
};

type CustomersResponse = {
  items: Customer[];
  total: number;
  page: number;
  pageSize: number;
};

export default function DashboardCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, [search, status, page]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      if (search) params.append("search", search);
      if (status !== "all") params.append("status", status);

      const response = await fetch(`/api/admin/customers?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
      const data: CustomersResponse = await response.json();
      setCustomers(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (customerId: string, newStatus: boolean) => {
    try {
      setUpdating(customerId);
      const response = await fetch("/api/admin/customers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: customerId, isActive: newStatus }),
      });
      if (!response.ok) throw new Error("Failed to update customer status");
      await fetchCustomers();
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update customer status");
    } finally {
      setUpdating(null);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  if (loading && customers.length === 0) {
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
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Customers Management</h2>
        <p className="mt-2 text-sm text-gray-600">Review customer accounts and service interactions.</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-xs"
        />
        <Select value={status} onValueChange={(value: "all" | "active" | "inactive" | null) => setStatus(value ?? "all")}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
          <Button variant="link" onClick={fetchCustomers} className="ml-2">
            Retry
          </Button>
        </div>
      )}

      <div className="grid gap-4">
        {customers.map((customer) => (
          <div key={customer.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{customer.name ?? customer.email}</p>
                  {!customer.isActive && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{customer.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Joined {new Date(customer.createdAt).toLocaleDateString()} • {customer._count.orders} orders
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="flex gap-2 mt-2 justify-end">
                  <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(customer)}>
                    View Details
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusToggle(customer.id, !customer.isActive)}
                    disabled={updating === customer.id}
                  >
                    {customer.isActive ? "Disable" : "Enable"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, total)} of {total} customers
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

      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Customer Details</h3>
              <Button variant="outline" onClick={() => setSelectedCustomer(null)}>
                Close
              </Button>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.name ?? "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium text-gray-900">{selectedCustomer.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <Badge className={selectedCustomer.isActive ? "bg-green-100 text-green-800 border-green-200" : "bg-red-100 text-red-800 border-red-200"}>
                    {selectedCustomer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="font-medium text-gray-900">{selectedCustomer._count.orders}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500">Joined Date</p>
                  <p className="font-medium text-gray-900">{new Date(selectedCustomer.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
