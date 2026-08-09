"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  User,
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Star,
  ArrowLeft,
  Loader2,
  Save,
  Phone,
  Mail,
  Shield,
  X,
  Package,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/layout/navbar/navbar";

type Address = {
  id: string;
  label: string;
  receiverName: string;
  phone: string;
  province: string;
  city: string;
  district: string;
  postalCode: string;
  fullAddress: string;
  isDefault: boolean;
};

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  addresses: Address[];
};

export default function ProfilePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [nameInput, setNameInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Address Modal State
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isSubmittingAddress, setIsSubmittingAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    label: "Home",
    receiverName: "",
    phone: "",
    province: "",
    city: "",
    district: "District",
    postalCode: "",
    fullAddress: "",
    isDefault: false,
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/profile");
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) {
        throw new Error("Failed to load profile data");
      }
      const data: UserProfile = await res.json();
      setProfile(data);
      setNameInput(data.name || "");
      setPhoneInput(data.phone || "");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error loading profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle Update Personal Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingProfile) return;

    try {
      setIsSavingProfile(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: nameInput.trim(),
          phone: phoneInput.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Profile update failed");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Open Add Address Modal
  const openAddAddressModal = () => {
    setSelectedAddress(null);
    setAddressForm({
      label: "Home",
      receiverName: profile?.name || "",
      phone: profile?.phone || "",
      province: "",
      city: "",
      district: "District",
      postalCode: "",
      fullAddress: "",
      isDefault: profile?.addresses.length === 0,
    });
    setIsAddressModalOpen(true);
  };

  // Open Edit Address Modal
  const openEditAddressModal = (addr: Address) => {
    setSelectedAddress(addr);
    setAddressForm({
      label: addr.label,
      receiverName: addr.receiverName,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      postalCode: addr.postalCode,
      fullAddress: addr.fullAddress,
      isDefault: addr.isDefault,
    });
    setIsAddressModalOpen(true);
  };

  // Handle Save / Create Address
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAddress) return;

    try {
      setIsSubmittingAddress(true);
      const isEditing = Boolean(selectedAddress);
      const url = isEditing ? `/api/addresses/${selectedAddress!.id}` : "/api/addresses";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addressForm),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to save address");
      }

      toast.success(`Address ${isEditing ? "updated" : "added"} successfully!`);
      setIsAddressModalOpen(false);
      fetchProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Address operation failed");
    } finally {
      setIsSubmittingAddress(false);
    }
  };

  // Set Address as Default
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (!res.ok) {
        throw new Error("Failed to set default address");
      }

      toast.success("Default address updated!");
      fetchProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    }
  };

  // Delete Address
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const res = await fetch(`/api/addresses/${addressId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete address");
      }

      toast.success("Address deleted!");
      fetchProfile();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/customer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-600 hover:text-[#7F46FA] transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Customer Portal
          </Link>
        </div>

        {/* Profile Header Banner */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-[#7F46FA]/10 text-[#7F46FA] rounded-2xl flex items-center justify-center font-bold text-2xl">
                {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">
                    {profile?.name || "Customer Profile"}
                  </h1>
                  <Badge className="bg-[#7F46FA] text-white">
                    {profile?.role || "CUSTOMER"}
                  </Badge>
                </div>
                <p className="text-sm text-zinc-500 mt-1">{profile?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/orders">
                <Button variant="outline" className="gap-2">
                  <Package className="w-4 h-4 text-purple-600" /> My Orders
                </Button>
              </Link>
              <Link href="/customer/wishlist">
                <Button variant="outline" className="gap-2">
                  <Heart className="w-4 h-4 text-red-500" /> Wishlist
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7F46FA] mb-3" />
            <p className="text-sm font-medium text-zinc-600">Loading your profile details...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Personal Info Form */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-100">
                  <User className="w-5 h-5 text-[#7F46FA]" />
                  <h2 className="font-bold text-zinc-900 text-lg">Personal Details</h2>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs font-semibold text-zinc-600 uppercase">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="Enter your name"
                      className="mt-1"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-xs font-semibold text-zinc-600 uppercase">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile?.email || ""}
                      disabled
                      className="mt-1 bg-zinc-100 text-zinc-500 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">Email address is linked to account authentication.</p>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs font-semibold text-zinc-600 uppercase">
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="e.g. +1 555 0192"
                      className="mt-1 font-mono text-sm"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    className="w-full bg-[#7F46FA] hover:bg-[#6D3BE3] text-white gap-2 font-medium"
                  >
                    {isSavingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>Save Changes</span>
                  </Button>
                </form>
              </div>

              {/* Quick Links Card */}
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-3">
                <h3 className="font-bold text-zinc-900 text-sm">Account Shortcuts</h3>
                <div className="space-y-2 text-sm">
                  <Link
                    href="/customer"
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-purple-50 hover:text-[#7F46FA] transition font-medium text-zinc-700"
                  >
                    <span>Customer Dashboard</span>
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                  </Link>
                  <Link
                    href="/cart"
                    className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 hover:bg-purple-50 hover:text-[#7F46FA] transition font-medium text-zinc-700"
                  >
                    <span>Shopping Cart</span>
                    <ShoppingBag className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Address Book Management */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-zinc-100">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#7F46FA]" />
                    <div>
                      <h2 className="font-bold text-zinc-900 text-lg">Address Book</h2>
                      <p className="text-xs text-zinc-500">Manage your shipping and delivery addresses.</p>
                    </div>
                  </div>
                  <Button
                    onClick={openAddAddressModal}
                    className="bg-[#7F46FA] hover:bg-[#6D3BE3] text-white gap-2 font-medium"
                  >
                    <Plus className="w-4 h-4" /> Add New Address
                  </Button>
                </div>

                {profile?.addresses.length === 0 ? (
                  <div className="py-12 border border-dashed border-zinc-300 rounded-2xl text-center bg-zinc-50/50">
                    <MapPin className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="font-bold text-zinc-800">No saved addresses</p>
                    <p className="text-xs text-zinc-500 mt-1">Add your shipping address for fast order checkout.</p>
                    <Button
                      onClick={openAddAddressModal}
                      variant="outline"
                      className="mt-4 gap-2 text-[#7F46FA] border-[#7F46FA]"
                    >
                      <Plus className="w-4 h-4" /> Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {profile?.addresses.map((addr) => (
                      <div
                        key={addr.id}
                        className={`p-5 rounded-2xl border transition space-y-3 ${
                          addr.isDefault
                            ? "bg-purple-50/40 border-[#7F46FA] shadow-xs"
                            : "bg-white border-zinc-200 hover:border-zinc-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 text-sm">{addr.label}</span>
                            {addr.isDefault && (
                              <Badge className="bg-[#7F46FA] text-white text-[10px] gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Default Address
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {!addr.isDefault && (
                              <Button
                                onClick={() => handleSetDefaultAddress(addr.id)}
                                variant="ghost"
                                size="sm"
                                className="text-xs text-zinc-600 hover:text-[#7F46FA]"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              onClick={() => openEditAddressModal(addr)}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-zinc-600 hover:text-zinc-900"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteAddress(addr.id)}
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-xs text-zinc-700 space-y-1">
                          <p className="font-semibold text-zinc-900">{addr.receiverName} ({addr.phone})</p>
                          <p className="text-zinc-600 leading-relaxed">
                            {addr.fullAddress}, {addr.district}, {addr.city}, {addr.province} - {addr.postalCode}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ADDRESS FORM MODAL */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-purple-50 text-[#7F46FA] rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-900 text-lg">
                    {selectedAddress ? "Edit Shipping Address" : "Add New Shipping Address"}
                  </h3>
                  <p className="text-xs text-zinc-500">Provide accurate delivery details for checkout</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddressModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1.5 rounded-lg hover:bg-zinc-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="addrLabel" className="text-xs font-semibold uppercase text-zinc-600">
                    Address Label
                  </Label>
                  <Input
                    id="addrLabel"
                    type="text"
                    value={addressForm.label}
                    onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                    placeholder="e.g. Home, Office"
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="receiverName" className="text-xs font-semibold uppercase text-zinc-600">
                    Receiver Name
                  </Label>
                  <Input
                    id="receiverName"
                    type="text"
                    value={addressForm.receiverName}
                    onChange={(e) => setAddressForm({ ...addressForm, receiverName: e.target.value })}
                    placeholder="Full name"
                    className="mt-1 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="addrPhone" className="text-xs font-semibold uppercase text-zinc-600">
                    Phone Number
                  </Label>
                  <Input
                    id="addrPhone"
                    type="text"
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    placeholder="Phone number"
                    className="mt-1 font-mono text-xs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-xs font-semibold uppercase text-zinc-600">
                    Postal Code
                  </Label>
                  <Input
                    id="postalCode"
                    type="text"
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    placeholder="Zip / Postal code"
                    className="mt-1 font-mono text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="province" className="text-xs font-semibold uppercase text-zinc-600">
                    Province
                  </Label>
                  <Input
                    id="province"
                    type="text"
                    value={addressForm.province}
                    onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
                    placeholder="Province"
                    className="mt-1 text-xs"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-xs font-semibold uppercase text-zinc-600">
                    City
                  </Label>
                  <Input
                    id="city"
                    type="text"
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    placeholder="City"
                    className="mt-1 text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="fullAddress" className="text-xs font-semibold uppercase text-zinc-600">
                  Full Street Address
                </Label>
                <textarea
                  id="fullAddress"
                  value={addressForm.fullAddress}
                  onChange={(e) => setAddressForm({ ...addressForm, fullAddress: e.target.value })}
                  placeholder="Street name, house number, apartment/suite..."
                  className="w-full mt-1 px-3 py-2 bg-white border border-zinc-300 rounded-xl text-xs focus:ring-2 focus:ring-[#7F46FA] focus:outline-none"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  id="isDefaultToggle"
                  type="checkbox"
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded border-zinc-300 text-[#7F46FA] focus:ring-[#7F46FA]"
                />
                <Label htmlFor="isDefaultToggle" className="text-xs font-medium text-zinc-700 cursor-pointer">
                  Set as default shipping address
                </Label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddressModalOpen(false)}
                  disabled={isSubmittingAddress}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingAddress}
                  className="bg-[#7F46FA] hover:bg-[#6D3BE3] text-white min-w-[120px]"
                >
                  {isSubmittingAddress ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Save Address"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
