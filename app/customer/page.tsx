import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Role } from "@prisma/client";
import { listCustomerOrders } from "@/lib/customer/services";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingBag, Heart, User, ArrowRight, Clock, CheckCircle2, CreditCard } from "lucide-react";
import Navbar from "@/components/layout/navbar/navbar";

type CustomerUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  role?: string;
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function CustomerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as CustomerUser;

  if (user.role && user.role !== Role.CUSTOMER) {
    redirect("/dashboard");
  }

  const orders = await listCustomerOrders(user.id);
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "PENDING" || o.paymentStatus === "PENDING").length;
  const completedOrders = orders.filter((o) => o.status === "DELIVERED").length;
  const recentOrders = orders.slice(0, 5);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return <Badge className="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/15 border-0">Delivered</Badge>;
      case "SHIPPED":
        return <Badge className="bg-blue-500/15 text-blue-700 hover:bg-blue-500/15 border-0">Shipped</Badge>;
      case "PROCESSING":
        return <Badge className="bg-purple-500/15 text-purple-700 hover:bg-purple-500/15 border-0">Processing</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-500/15 text-red-700 hover:bg-red-500/15 border-0">Cancelled</Badge>;
      default:
        return <Badge className="bg-amber-500/15 text-amber-700 hover:bg-amber-500/15 border-0">Pending</Badge>;
    }
  };

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700">Paid</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-700">Unpaid</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Customer Welcome Header */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#7F46FA]">Customer Portal</p>
              <h1 className="mt-1 text-3xl font-bold text-zinc-900 sm:text-4xl">
                Welcome back, {user.name || "Customer"}!
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Manage your profile, view recent order history, and track shipping status.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/products">
                <Button className="bg-[#7F46FA] hover:bg-[#6B3DD9] text-white">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Explore Catalog
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-[#7F46FA]">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Total Orders</p>
              <p className="text-2xl font-bold text-zinc-900">{totalOrders}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Pending Action</p>
              <p className="text-2xl font-bold text-zinc-900">{pendingOrders}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completed Orders</p>
              <p className="text-2xl font-bold text-zinc-900">{completedOrders}</p>
            </div>
          </div>
        </div>

        {/* Quick Navigation Cards */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/orders" className="group block">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#7F46FA]/50 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-[#7F46FA] group-hover:text-white transition">
                  <Package className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-[#7F46FA] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="mt-4 font-bold text-zinc-900">My Orders</h3>
              <p className="mt-1 text-xs text-zinc-500">Track current and past purchases</p>
            </div>
          </Link>

          <Link href="/customer/wishlist" className="group block">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#7F46FA]/50 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-[#7F46FA] group-hover:text-white transition">
                  <Heart className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-[#7F46FA] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="mt-4 font-bold text-zinc-900">Wishlist</h3>
              <p className="mt-1 text-xs text-zinc-500">Saved items for future checkout</p>
            </div>
          </Link>

          <Link href="/customer/products" className="group block">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#7F46FA]/50 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-[#7F46FA] group-hover:text-white transition">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-[#7F46FA] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="mt-4 font-bold text-zinc-900">Store Products</h3>
              <p className="mt-1 text-xs text-zinc-500">Discover top tech gear & electronics</p>
            </div>
          </Link>

          <Link href="/profile" className="group block">
            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-[#7F46FA]/50 hover:shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 group-hover:bg-[#7F46FA] group-hover:text-white transition">
                  <User className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400 group-hover:text-[#7F46FA] group-hover:translate-x-1 transition" />
              </div>
              <h3 className="mt-4 font-bold text-zinc-900">Profile Settings</h3>
              <p className="mt-1 text-xs text-zinc-500">Manage account information & address</p>
            </div>
          </Link>
        </div>

        {/* Recent Orders Table / Card List */}
        <div className="mt-8 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Recent Orders</h2>
              <p className="text-xs text-zinc-500">Your latest purchases and current status</p>
            </div>
            <Link href="/orders">
              <Button variant="outline" size="sm">
                View All Orders
              </Button>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="mx-auto h-12 w-12 text-zinc-300 mb-3" />
              <p className="font-bold text-zinc-900">No orders placed yet</p>
              <p className="mt-1 text-xs text-zinc-500">Start browsing our catalog to place your first order.</p>
              <Link href="/products" className="mt-4 inline-block">
                <Button size="sm" className="bg-[#7F46FA] text-white hover:bg-[#6D3BE3]">
                  Browse Store
                </Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-zinc-100 p-4 transition hover:border-zinc-200"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">{order.orderNumber}</span>
                      {getStatusBadge(order.status)}
                      {getPaymentBadge(order.paymentStatus)}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} item(s)
                    </p>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-4">
                    <span className="font-bold text-[#7F46FA] text-base">
                      {currencyFormatter.format(Number(order.grandTotal))}
                    </span>

                    {order.paymentStatus === "PENDING" ? (
                      <Link href={`/payment/${order.id}`}>
                        <Button size="sm" className="bg-[#7F46FA] hover:bg-[#6B3DD9] text-white">
                          <CreditCard className="mr-1.5 h-3.5 w-3.5" />
                          Pay Now
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/orders/${order.id}`}>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
