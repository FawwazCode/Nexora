import { Role } from "@prisma/client";

export type DashboardMenuItem = {
  href: string;
  label: string;
};

export const dashboardMenus: Record<string, DashboardMenuItem[]> = {
  [Role.CUSTOMER]: [
    { href: "/dashboard", label: "Overview" },
    { href: "/customer/products", label: "Store Products" },
    { href: "/customer/wishlist", label: "Wishlist" },
    { href: "/orders", label: "My Orders" },
    { href: "/profile", label: "Profile" },
  ],
  [Role.CATALOG_ADMIN]: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/categories", label: "Categories" },
    { href: "/dashboard/inventory", label: "Inventory" },
  ],
  [Role.ORDER_SPECIALIST]: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/customers", label: "Customers" },
    { href: "/dashboard/shipping", label: "Shipping" },
  ],
  [Role.SUPER_ADMIN]: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/categories", label: "Categories" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/customers", label: "Customers" },
    { href: "/dashboard/settings", label: "Settings" },
  ],
};
