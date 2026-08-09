"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StoreSettings = {
  id?: string;
  storeName: string;
  storeTagline: string | null;
  storeLogo: string | null;
  supportEmail: string | null;
  supportPhone: string | null;
  taxRate: number | null;
  shippingFee: number | null;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
};

export default function DashboardSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    storeName: "Nexora",
    storeTagline: "",
    storeLogo: "",
    supportEmail: "",
    supportPhone: "",
    taxRate: "",
    shippingFee: "",
    currency: "USD",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/settings");
      if (!response.ok) {
        throw new Error("Failed to fetch settings");
      }
      const data: StoreSettings = await response.json();
      setSettings(data);
      setFormData({
        storeName: data.storeName,
        storeTagline: data.storeTagline ?? "",
        storeLogo: data.storeLogo ?? "",
        supportEmail: data.supportEmail ?? "",
        supportPhone: data.supportPhone ?? "",
        taxRate: data.taxRate?.toString() ?? "",
        shippingFee: data.shippingFee?.toString() ?? "",
        currency: data.currency,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: formData.storeName,
          storeTagline: formData.storeTagline || null,
          storeLogo: formData.storeLogo || null,
          supportEmail: formData.supportEmail || null,
          supportPhone: formData.supportPhone || null,
          taxRate: formData.taxRate ? parseFloat(formData.taxRate) : null,
          shippingFee: formData.shippingFee ? parseFloat(formData.shippingFee) : null,
          currency: formData.currency,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Settings</h2>
        <p className="mt-2 text-sm text-gray-600">Manage system configuration and platform settings.</p>
      </div>

      {error && (
        <div className="text-red-600 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="text-green-600 p-4 bg-green-50 rounded-lg">
          Settings saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="storeName">Store Name</Label>
            <Input
              id="storeName"
              value={formData.storeName}
              onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeTagline">Store Tagline</Label>
            <Input
              id="storeTagline"
              value={formData.storeTagline}
              onChange={(e) => setFormData({ ...formData, storeTagline: e.target.value })}
              placeholder="Your store tagline"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="storeLogo">Store Logo URL</Label>
            <Input
              id="storeLogo"
              value={formData.storeLogo}
              onChange={(e) => setFormData({ ...formData, storeLogo: e.target.value })}
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input
              id="supportEmail"
              type="email"
              value={formData.supportEmail}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              placeholder="support@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="supportPhone">Support Phone</Label>
            <Input
              id="supportPhone"
              value={formData.supportPhone}
              onChange={(e) => setFormData({ ...formData, supportPhone: e.target.value })}
              placeholder="+1 234 567 890"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              step="0.01"
              min="0"
              value={formData.taxRate}
              onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
              placeholder="10.00"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingFee">Shipping Fee</Label>
            <Input
              id="shippingFee"
              type="number"
              step="0.01"
              min="0"
              value={formData.shippingFee}
              onChange={(e) => setFormData({ ...formData, shippingFee: e.target.value })}
              placeholder="5.00"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-[#7F46FA] hover:bg-[#6B3DD9]"
          >
            {saving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
