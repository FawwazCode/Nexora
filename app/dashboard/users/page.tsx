"use client";

import { useState, useEffect } from "react";
import { Role } from "@prisma/client";
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

type User = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
};

export default function DashboardUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      setUpdating(userId);
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: userId, role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update role");
      }

      await fetchUsers();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdating(null);
    }
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case Role.SUPER_ADMIN:
        return "bg-purple-100 text-purple-800 border-purple-200";
      case Role.CATALOG_ADMIN:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case Role.ORDER_SPECIALIST:
        return "bg-green-100 text-green-800 border-green-200";
      case Role.CUSTOMER:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="text-red-600">{error}</div>
        <Button onClick={fetchUsers}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">User Management</h2>
        <p className="mt-2 text-sm text-gray-600">Manage user roles and permissions.</p>
      </div>

      <div className="grid gap-4">
        {users.map((user) => (
          <div key={user.id} className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <p className="font-medium text-gray-900">{user.name || user.email}</p>
                  <Badge className={getRoleBadgeColor(user.role)}>{user.role}</Badge>
                  {!user.isActive && (
                    <Badge variant="outline" className="text-red-600 border-red-200">
                      Inactive
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{user.email}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Joined {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-4">
                <Select
                  value={user.role}
                  onValueChange={(value) => handleRoleChange(user.id, value as Role)}
                  disabled={updating === user.id || user.role === Role.SUPER_ADMIN}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Change role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.SUPER_ADMIN}>Super Admin</SelectItem>
                    <SelectItem value={Role.CATALOG_ADMIN}>Catalog Admin</SelectItem>
                    <SelectItem value={Role.ORDER_SPECIALIST}>Order Specialist</SelectItem>
                    <SelectItem value={Role.CUSTOMER}>Customer</SelectItem>
                  </SelectContent>
                </Select>
                {user.role === Role.SUPER_ADMIN && (
                  <p className="text-xs text-gray-400 mt-1">Cannot change own role</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
