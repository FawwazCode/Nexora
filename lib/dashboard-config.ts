import { Role } from "@prisma/client";

export type DashboardMenuItem = {
  href: string;
  label: string;
};

export const dashboardMenus: Record<string, DashboardMenuItem[]> = {
  [Role.CUSTOMER]: [
    { href: "/customer", label: "Overview" },
    { href: "/customer/products", label: "Store Products" },
    { href: "/customer/wishlist", label: "Wishlist" },
    { href: "/orders", label: "My Orders" },
    { href: "/profile", label: "Profile" },
  ],
  [Role.CATALOG_ADMIN]: [
    { href: "/dashboard", label: "Overview" },
    { href: "/dashboard/products", label: "Products" },
    { href: "/dashboard/categories", label: "Categories" },
    { href: "/dashboard/brands", label: "Brands" },
    { href: "/dashboard/variants", label: "Product Variants" },
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
    { href: "/dashboard/brands", label: "Brands" },
    { href: "/dashboard/variants", label: "Product Variants" },
    { href: "/dashboard/inventory", label: "Inventory" },
    { href: "/dashboard/orders", label: "Orders" },
    { href: "/dashboard/customers", label: "Customers" },
    { href: "/dashboard/shipping", label: "Shipping" },
    { href: "/dashboard/users", label: "Users" },
    { href: "/dashboard/reports", label: "Reports" },
    { href: "/dashboard/settings", label: "Settings" },
  ],
};
