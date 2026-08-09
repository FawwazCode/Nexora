# NEXORA ROLE & ACCESS AUDIT

## 1. Overall Progress

| Role | Progress | Summary |
|---|---|---|
| **SUPER_ADMIN** | 65% | Memiliki akses ke sebagian besar halaman admin (Products, Categories, Orders, Customers, Users, Reports, Settings). Namun belum memiliki UI/Logic khusus untuk Brands, Product Variants, Inventory/Stock management, dan Shipping management (masih static placeholder). |
| **CATALOG_ADMIN** | 50% | Memiliki UI & API untuk CRUD Products dan Categories. Namun fitur Inventory (`/dashboard/inventory`) masih berupa placeholder tanpa logic/UI. Brands dan Product Variants belum memiliki menu/halaman terpisah. Pada `/dashboard` overview, CATALOG_ADMIN secara tidak sengaja dapat melihat ringkasan order dan customer yang bukan haknya. |
| **ORDER_SPECIALIST** | 50% | Memiliki UI & API untuk melihat dan meng-update Orders (`/dashboard/orders`) dan Customers (`/dashboard/customers`). Namun fitur Shipping (`/dashboard/shipping`) masih berupa placeholder tanpa UI/logic pelacakan/perubahan status kurir. Selain itu, permission `PATCH /api/admin/customers` mengizinkan ORDER_SPECIALIST mengubah status aktif user (disable account), yang melampaui kewenangannya. |
| **CUSTOMER** | 70% | Memiliki alur belanja lengkap (Catalog, Cart, Checkout, Order History, Order Detail, Manual Payment dengan kalkulasi kembalian & penolakan nominal kurang). Namun **CRITICAL AUTHORIZATION ISSUE**: Customer diizinkan oleh `lib/rbac.ts` masuk ke `/dashboard` (Admin Dashboard) dan melihat Recent Orders customer lain serta data ringkasan platform. Halaman Profile (`/profile`) masih placeholder 4 baris kode, dan belum ada Customer Dashboard khusus (`/customer`). |

---

## 2. SUPER_ADMIN

| Feature | UI | Logic | Authorization | Status |
|---|---|---|---|---|
| Dashboard Admin | ✅ | ✅ | ⚠️ NEEDS FIX | 🟡 PARTIAL |
| Products | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Categories | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Brands | 🔴 MISSING | 🟡 PARTIAL | 🟡 PARTIAL | 🔴 MISSING |
| Product Variants | 🔴 MISSING | 🟡 PARTIAL | 🟡 PARTIAL | 🔴 MISSING |
| Inventory / Stock | 🟡 PARTIAL | 🔴 MISSING | ✅ | 🟡 PARTIAL |
| Orders | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Customers | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Shipping | 🟡 PARTIAL | 🔴 MISSING | ✅ | 🟡 PARTIAL |
| Reports | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Users | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Settings | ✅ | ✅ | ✅ | ✅ COMPLETE |

> **Catatan SUPER_ADMIN:**
> - Feature Products, Categories, Orders, Customers, Users, Reports, dan Settings sudah berfungsi dengan API & Authorization yang benar.
> - Halaman `/dashboard/inventory` dan `/dashboard/shipping` baru sebatas placeholder UI statis (hanya memuat judul dan deskripsi).
> - Belum ada menu/halaman khusus untuk manajemen Brands dan Product Variants secara terpisah (hanya bisa input inline saat membuat product).

---

## 3. CATALOG_ADMIN

| Feature | UI | Logic | Authorization | Status |
|---|---|---|---|---|
| Dashboard Admin | ✅ | ⚠️ NEEDS FIX | ⚠️ NEEDS FIX | ⚠️ NEEDS FIX |
| Products | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Categories | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Brands | 🔴 MISSING | 🟡 PARTIAL | 🟡 PARTIAL | 🔴 MISSING |
| Product Variants | 🔴 MISSING | 🟡 PARTIAL | 🟡 PARTIAL | 🔴 MISSING |
| Inventory / Stock | 🟡 PARTIAL | 🔴 MISSING | ✅ | 🟡 PARTIAL |

> **Catatan CATALOG_ADMIN:**
> - CATALOG_ADMIN berhasil mengakses dan mengelola Products (`/dashboard/products`) dan Categories (`/dashboard/categories`).
> - CATALOG_ADMIN dilarang mengakses Users, Settings, Reports (Sudah benar di API layer).
> - **Masalah Authorization pada Overview (`/dashboard`)**: Saat CATALOG_ADMIN membuka `/dashboard`, `app/dashboard/page.tsx` mengeksekusi `getAdminRecentOrders()` dan `getAdminRecentCustomers()`, sehingga CATALOG_ADMIN dapat melihat nama customer, email, dan order history platform yang seharusnya bukan haknya.
> - Halaman `/dashboard/inventory` belum memiliki UI pergerakan stok (StockMovement) atau form update stok.

---

## 4. ORDER_SPECIALIST

| Feature | UI | Logic | Authorization | Status |
|---|---|---|---|---|
| Dashboard Admin | ✅ | ⚠️ NEEDS FIX | ⚠️ NEEDS FIX | ⚠️ NEEDS FIX |
| Orders | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Customers | ✅ | ✅ | ⚠️ NEEDS FIX | 🟡 PARTIAL |
| Shipping | 🟡 PARTIAL | 🔴 MISSING | ✅ | 🟡 PARTIAL |

> **Catatan ORDER_SPECIALIST:**
> - ORDER_SPECIALIST berhasil melihat dan memperbarui status Order (`/dashboard/orders`) serta melihat data Customer (`/dashboard/customers`).
> - ORDER_SPECIALIST dilarang mengakses Products, Categories, Users, Settings, Reports (Sudah benar di API layer).
> - **Masalah Privilege Escalation**: Endpoint `PATCH /api/admin/customers` menggunakan `canManageOrders()`, sehingga ORDER_SPECIALIST dapat mematikan/mengaktifkan status akun customer (`isActive: false`), yang seharusnya hanya hak SUPER_ADMIN.
> - **Shipping (`/dashboard/shipping`)**: Belum ada UI/Logic untuk mengelola kurir, memasukkan nomor resi (tracking number), atau memperbarui status pengiriman (`NOT_YET_SHIPPED` → `PACKED` → `SHIPPED` → `DELIVERED`).

---

## 5. CUSTOMER

| Feature | UI | Logic | Authorization | Status |
|---|---|---|---|---|
| Customer Dashboard | 🔴 MISSING | 🔴 MISSING | 🔴 MISSING | 🔴 MISSING |
| Products / Catalog | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Cart | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Wishlist | 🟡 PARTIAL | 🟡 PARTIAL | ✅ | 🟡 PARTIAL |
| Checkout | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Orders | ✅ | ✅ | ✅ | ✅ COMPLETE |
| Profile | 🔴 MISSING | 🔴 MISSING | 🔴 MISSING | 🔴 MISSING |

> **Catatan CUSTOMER:**
> - Alur transaksi utama Customer (Catalog → Cart → Checkout → Create Order → Payment Manual → Order History & Detail) sudah berjalan sangat baik dengan transaksi Prisma (`$transaction`), isolasi data milik sendiri, dan validasi nominal pembayaran.
> - **VULNERABILITY CRITICAL**: `lib/rbac.ts` baris 110 menyatakan `if (role === Role.CUSTOMER) return true;` di fungsi `canAccessRoute` untuk rute `/dashboard`. CUSTOMER yang berhasil login dapat membuka `/dashboard` (Admin Dashboard) dan membaca data Recent Orders milik customer lain serta Recent Customers platform!
> - Halaman Profile (`app/profile/page.tsx`) hanya berisi placeholder `<div>Profile</div>` tanpa UI atau form edit profile/address.
> - Belum ada Customer Dashboard tersendiri (misalnya `/customer` atau ringkasan pesanan/profil customer).

---

## 6. Authorization Audit

Berikut adalah daftar celah keamanan dan masalah authorization yang ditemukan dalam pemeriksaan codebase:

1. **Rute `/dashboard` Dapat Diakses oleh Role `CUSTOMER` (CRITICAL)**
   - **Lokasi File**: [lib/rbac.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/rbac.ts#L110)
   - **Masalah**: `canAccessRoute()` mengembalikan `true` untuk `Role.CUSTOMER` pada rute dashboard. `getDashboardRedirect()` mengembalikan `null` untuk CUSTOMER.
   - **Dampak**: CUSTOMER dapat menavigasi ke `http://localhost:3000/dashboard` dan melihat Admin Overview.

2. **Kebocoran Data Sensitif di Halaman Overview (`app/dashboard/page.tsx`) (HIGH)**
   - **Lokasi File**: [app/dashboard/page.tsx](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/dashboard/page.tsx#L51-L57)
   - **Masalah**: Halaman overview utama menjalankan `getAdminRecentOrders(5)` dan `getAdminRecentCustomers(5)` untuk **semua** role yang membuka `/dashboard` (termasuk `CATALOG_ADMIN` dan `CUSTOMER`).
   - **Dampak**: CATALOG_ADMIN dapat melihat data transaksi & email customer. CUSTOMER dapat melihat data transaksi customer lain.

3. **Over-privileged Action di Customer Management (MEDIUM)**
   - **Lokasi File**: [app/api/admin/customers/route.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/api/admin/customers/route.ts#L46)
   - **Masalah**: `PATCH /api/admin/customers` mengizinkan siapapun dengan izin `canManageOrders` (termasuk `ORDER_SPECIALIST`) untuk mengubah status aktif akun user (`isActive`).
   - **Dampak**: `ORDER_SPECIALIST` dapat menonaktifkan akun user secara langsung.

4. **Navigasi Sidebar Admin Menampilkan Menu Mengaburkan Akses (MEDIUM)**
   - **Lokasi File**: [lib/dashboard-config.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/dashboard-config.ts#L9-L15)
   - **Masalah**: `dashboardMenus[Role.CUSTOMER]` mencantumkan link `{ href: "/dashboard", label: "Overview" }`, sehingga sidebar mengarahkan CUSTOMER ke Admin Dashboard. Selain itu, menu SUPER_ADMIN & CATALOG_ADMIN kehilangan link `Brands` dan `Product Variants`.

5. **Kurangnya Validasi Transisi Status Order & Shipping (MEDIUM)**
   - **Lokasi File**: [app/api/admin/orders/route.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/api/admin/orders/route.ts#L43-L75)
   - **Masalah**: `PATCH /api/admin/orders` dapat menerima perubahan status tanpa memvalidasi alur bisnis (misal dari `DELIVERED` kembali ke `PROCESSING`, atau dari `PAID` kembali ke `PENDING`).

---

## 7. Route Access Matrix

Tabel berikut menunjukkan hak akses rute nyata yang terdeteksi di codebase saat ini:

| Route | SUPER_ADMIN | CATALOG_ADMIN | ORDER_SPECIALIST | CUSTOMER | Publik / Unauthenticated | Status Keamanan Rute |
|---|---|---|---|---|---|---|
| `/` | ✅ | ✅ | ✅ | ✅ | ✅ | Safe |
| `/login` | ✅ | ✅ | ✅ | ✅ | ✅ | Safe |
| `/register` | ✅ | ✅ | ✅ | ✅ | ✅ | Safe |
| `/products` | ✅ | ✅ | ✅ | ✅ | ✅ | Safe |
| `/products/[slug]` | ✅ | ✅ | ✅ | ✅ | ✅ | Safe |
| `/categories` | ✅ | ✅ | ✅ | ✅ | ✅ | Safe |
| `/about` | ✅ | ✅ | ✅ | ✅ | ✅ | Safe |
| `/dashboard` | ✅ | ✅ | ✅ | ⚠️ **BOLEH (VULNERABLE)** | ❌ | 🔴 **MUST FIX** (Customer harus dilarang) |
| `/dashboard/products` | ✅ | ✅ | ❌ | ❌ | ❌ | Safe |
| `/dashboard/products/new` | ✅ | ✅ | ❌ | ❌ | ❌ | Safe |
| `/dashboard/products/[id]/edit` | ✅ | ✅ | ❌ | ❌ | ❌ | Safe |
| `/dashboard/categories` | ✅ | ✅ | ❌ | ❌ | ❌ | Safe |
| `/dashboard/categories/new` | ✅ | ✅ | ❌ | ❌ | ❌ | Safe |
| `/dashboard/categories/[id]/edit` | ✅ | ✅ | ❌ | ❌ | ❌ | Safe |
| `/dashboard/inventory` | ✅ | ✅ | ❌ | ❌ | ❌ | Safe (Halaman masih placeholder) |
| `/dashboard/orders` | ✅ | ❌ | ✅ | ❌ | ❌ | Safe |
| `/dashboard/customers` | ✅ | ❌ | ✅ | ❌ | ❌ | Safe |
| `/dashboard/shipping` | ✅ | ❌ | ✅ | ❌ | ❌ | Safe (Halaman masih placeholder) |
| `/dashboard/reports` | ✅ | ❌ | ❌ | ❌ | ❌ | Safe |
| `/dashboard/users` | ✅ | ❌ | ❌ | ❌ | ❌ | Safe |
| `/dashboard/settings` | ✅ | ❌ | ❌ | ❌ | ❌ | Safe |
| `/customer/products` | ✅ | ✅ | ✅ | ✅ | ❌ | Safe |
| `/customer/wishlist` | ✅ | ✅ | ✅ | ✅ | ❌ | Safe |
| `/cart` | ✅ | ✅ | ✅ | ✅ | ❌ | Safe |
| `/checkout` | ✅ | ✅ | ✅ | ✅ | ❌ | Safe |
| `/orders` | ✅ | ✅ | ✅ | ✅ | ❌ | Safe (Mengembalikan order milik user session) |
| `/orders/[id]` | ✅ | ✅ | ✅ | ✅ | ❌ | Safe (Hanya bisa lihat order milik sendiri) |
| `/payment/[orderId]` | ✅ | ✅ | ✅ | ✅ | ❌ | Safe (Hanya bisa bayar order milik sendiri) |
| `/profile` | ✅ | ✅ | ✅ | ✅ | ❌ | Safe (Halaman masih placeholder) |

---

## 8. API / Server Action Access Matrix

Tabel berikut menunjukkan otorisasi nyata pada endpoint API saat ini:

| Endpoint API | SUPER_ADMIN | CATALOG_ADMIN | ORDER_SPECIALIST | CUSTOMER | Publik | Proteksi API Layer |
|---|---|---|---|---|---|---|
| `GET /api/admin/dashboard` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ | Safe (`assertSuperAdmin`) |
| `GET /api/admin/products` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `POST /api/admin/products` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `PATCH /api/admin/products` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `DELETE /api/admin/products` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `PUT /api/admin/products` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `GET /api/admin/categories` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `POST /api/admin/categories` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `PATCH /api/admin/categories` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `DELETE /api/admin/categories` | ✅ | ✅ | ❌ (403) | ❌ (403) | ❌ | Safe (`canManageProducts`) |
| `GET /api/admin/orders` | ✅ | ❌ (403) | ✅ | ❌ (403) | ❌ | Safe (`canManageOrders`) |
| `PATCH /api/admin/orders` | ✅ | ❌ (403) | ✅ | ❌ (403) | ❌ | Safe (`canManageOrders`) |
| `GET /api/admin/customers` | ✅ | ❌ (403) | ✅ | ❌ (403) | ❌ | Safe (`canManageOrders`) |
| `PATCH /api/admin/customers` | ✅ | ❌ (403) | ⚠️ **BOLEH** | ❌ (403) | ❌ | ⚠️ **TOO BROAD** (ORDER_SPECIALIST bisa disable user) |
| `GET /api/admin/reports` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ | Safe (`assertSuperAdmin`) |
| `GET /api/admin/settings` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ | Safe (`assertSuperAdmin`) |
| `POST /api/admin/settings` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ | Safe (`assertSuperAdmin`) |
| `GET /api/admin/users` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ | Safe (`assertSuperAdmin`) |
| `PATCH /api/admin/users` | ✅ | ❌ (403) | ❌ (403) | ❌ (403) | ❌ | Safe (`assertSuperAdmin`) |
| `GET /api/cart` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Filter by `session.user.id`) |
| `DELETE /api/cart` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Filter by `session.user.id`) |
| `PATCH /api/cart/[id]` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Filter by `session.user.id`) |
| `DELETE /api/cart/[id]` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Filter by `session.user.id`) |
| `POST /api/checkout` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Isolasi data & Prisma transaction) |
| `GET /api/orders` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Filter by `session.user.id`) |
| `GET /api/orders/[id]` | ✅ | ✅ | ✅ | ✅ (Only own) | ❌ (401) | Safe (Filter by `session.user.id` & `id`) |
| `POST /api/orders/[id]/payment` | ✅ | ✅ | ✅ | ✅ (Only own) | ❌ (401) | Safe (Filter by `session.user.id` & manual payment rules) |
| `GET /api/wishlist` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Filter by `session.user.id`) |
| `POST /api/wishlist` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Filter by `session.user.id`) |
| `DELETE /api/wishlist` | ✅ | ✅ | ✅ | ✅ | ❌ (401) | Safe (Filter by `session.user.id`) |
| `POST /api/auth/register` | ✅ | ✅ | ✅ | ✅ | ✅ | Safe (Customer registration) |

*Catatan: Tidak ditemukan Server Actions (`'use server'`) di codebase ini. Seluruh logika server-side menggunakan API Route Handlers (`app/api/...`).*

---

## 9. Security Issues

### 🔴 CRITICAL
1. **Unrestricted Route Access to Admin Dashboard for `CUSTOMER` Role**
   - **File**: [lib/rbac.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/rbac.ts#L110)
   - **Penjelasan**: `lib/rbac.ts` mengembalikan `true` saat `CUSTOMER` mengakses `/dashboard`. CUSTOMER yang login dapat langsung membuka `/dashboard` dan mengakses halaman Admin Overview.

### 🟠 HIGH
2. **Platform Data Leakage on Dashboard Overview**
   - **File**: [app/dashboard/page.tsx](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/dashboard/page.tsx#L51-L57)
   - **Penjelasan**: Data recent orders (berisi nama & total belanja customer lain), recent registered customers (berisi nama & email), low stock items, dan best selling products dipanggil di komponen Server Page tanpa memfilter role pengguna.

### 🟡 MEDIUM
3. **Privilege Escalation on User Status Toggle**
   - **File**: [app/api/admin/customers/route.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/api/admin/customers/route.ts#L46)
   - **Penjelasan**: Endpoint `PATCH /api/admin/customers` mengizinkan `ORDER_SPECIALIST` untuk menonaktifkan akun user (`isActive: false`), padahal manajemen user adalah kewenangan `SUPER_ADMIN`.
4. **Missing Status Transition Enforcement on Orders**
   - **File**: [app/api/admin/orders/route.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/api/admin/orders/route.ts#L61-L69)
   - **Penjelasan**: Tidak ada validasi yang mencegah perubahan status ilegal (seperti mengubah order `DELIVERED` menjadi `PROCESSING` atau `PAID` menjadi `PENDING`).

### 🔵 LOW
5. **Incomplete Sidebar Configuration & Link Mismatch**
   - **File**: [lib/dashboard-config.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/dashboard-config.ts)
   - **Penjelasan**: Navigasi sidebar CUSTOMER mengarahkan ke `/dashboard` alih-alih rute customer tersendiri. Menu Brands dan Product Variants juga tidak tersedia pada sidebar SUPER_ADMIN dan CATALOG_ADMIN.

---

## 10. Yang Sudah Selesai

- ✅ **Authentication System**: Auth.js / NextAuth berbasis session dengan Next.js App Router.
- ✅ **Prisma Database Schema**: Schema lengkap dengan enum Role (`SUPER_ADMIN`, `CATALOG_ADMIN`, `ORDER_SPECIALIST`, `CUSTOMER`), OrderStatus, PaymentStatus, ShipmentStatus, StockMovementType, dan model-model terkait.
- ✅ **Catalog & Public Store**: Rute catalog produk (`/products`, `/products/[slug]`, `/categories`) dapat diakses oleh publik dan customer.
- ✅ **Cart System**: API & UI keranjang belanja lengkap (Tambah, Ubah Qty, Hapus Item, Clear Cart) berbasis session user.
- ✅ **Checkout & Order Creation**: `POST /api/checkout` menggunakan `$transaction` Prisma untuk membuat address, order, order items, memotong stok variant, mencatat `StockMovement` (`OUT`), dan mengosongkan cart.
- ✅ **Manual Payment System**:
  - Validasi nominal (jika kurang dari Grand Total → Tolak dengan pesan `"Nominal pembayaran kurang"`, status tetap `PENDING`).
  - Jika nominal pas/lebih → `paymentStatus = PAID`, `status = PROCESSING`, simpan `paidAmount` & `changeAmount`, simpan `paidAt`.
  - Prevent double payment (Order yang sudah `PAID` tidak bisa dibayar ulang).
- ✅ **Customer Orders Isolation**: Customer hanya dapat melihat daftar pesanan (`/orders`) dan detail pesanan (`/orders/[id]`) miliknya sendiri.
- ✅ **Admin Products & Categories Management**: CRUD Produk dan Kategori berjalan penuh dengan proteksi permission `canManageProducts`.
- ✅ **Admin Users, Reports, Settings Management**: Rute API & UI terproteksi ketat dengan `assertSuperAdmin`.

---

## 11. Yang Masih Kurang

### Missing (Belum ada sama sekali)
1. **Customer Dashboard Page (`/customer` atau `/customer/dashboard`)**: Belum ada halaman ringkasan khusus customer (pesanan aktif, status pengiriman, alamat default).
2. **Customer Profile Page (`/profile`)**: Baru berupa file placeholder 4 baris kode (`<div>Profile</div>`). Belum ada UI form profil atau manajemen alamat.
3. **Shipping Operations Module (`/dashboard/shipping`)**: Belum ada UI/Logic untuk memilih kurir, menginput nomor resi (tracking number), dan mengubah status shipment (`NOT_YET_SHIPPED` → `PACKED` → `SHIPPED` → `DELIVERED`).
4. **Inventory & Stock Movement UI (`/dashboard/inventory`)**: Halaman `/dashboard/inventory` masih berupa placeholder statis tanpa tabel stok atau form penyesuaian stok.
5. **Dedicated Brands & Product Variants Pages**: Belum ada halaman terpisah untuk mengelola Brands dan Product Variants secara independen.

### Partial (Sudah ada sebagian tetapi belum lengkap)
1. **Wishlist**: API backend sudah ada (`/api/wishlist`), namun UI customer (`/customer/wishlist`) belum terintegrasi secara utuh dengan tombol Add to Wishlist di katalog produk.
2. **Dashboard Overview Role Tailoring**: Halaman overview `/dashboard` menggunakan komponen statis yang sama untuk semua role, belum menyesuaikan widget berdasarkan statistik spesifik role (misal: widget khusus catalog untuk CATALOG_ADMIN, widget pesanan untuk ORDER_SPECIALIST).

### Needs Fix (Sudah ada tetapi implementasinya salah / tidak aman)
1. **`lib/rbac.ts` Route Protection**: `canAccessRoute` & `getDashboardRedirect` mengizinkan `CUSTOMER` mengakses `/dashboard`. CUSTOMER harus di-redirect ke `/` atau `/orders`.
2. **`app/dashboard/page.tsx` Data Querying**: Server component memanggil query admin tanpa mengecek role pengguna terlebih dahulu.
3. **`app/api/admin/customers/route.ts` Permission**: Status toggle customer mengizinkan `ORDER_SPECIALIST`, seharusnya hanya `SUPER_ADMIN`.
4. **Order Status Transition Rules**: Perlu ditambahkan state machine / validation guard untuk mencegah transisi status order dan payment yang tidak valid.

---

## 12. PRIORITAS PEKERJAAN SELANJUTNYA (ROADMAP)

### PHASE 1 — Critical Authorization & Access Control Repair
- **File / Route**: [lib/rbac.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/rbac.ts), [middleware.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/middleware.ts), [lib/dashboard-config.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/dashboard-config.ts), [app/dashboard/page.tsx](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/dashboard/page.tsx), [app/api/admin/customers/route.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/api/admin/customers/route.ts)
- **Masalah**:
  1. CUSTOMER bisa masuk Admin Dashboard (`/dashboard`).
  2. Data sensitif platform bocor pada `/dashboard` overview untuk role non-SUPER_ADMIN.
  3. ORDER_SPECIALIST bisa mematikan akun customer via API.
- **Apa yang Perlu Dibuat / Diperbaiki**:
  - Update `lib/rbac.ts`: Melarang `Role.CUSTOMER` dari `isDashboardRoute`. Redirect `CUSTOMER` dari `/dashboard` ke `/` atau `/customer`.
  - Update `app/dashboard/page.tsx`: Hanya panggil data ringkasan admin jika pengguna adalah `SUPER_ADMIN`, `CATALOG_ADMIN`, atau `ORDER_SPECIALIST`, serta sesuaikan widget yang ditampilkan berdasarkan role masing-masing.
  - Update `app/api/admin/customers/route.ts`: Pisahkan permission `PATCH` (toggle active) agar hanya bisa dilakukan oleh `SUPER_ADMIN`.
  - Update `lib/dashboard-config.ts`: Hapus link `/dashboard` dari menu CUSTOMER.
- **Role Terdampak**: `CUSTOMER`, `SUPER_ADMIN`, `CATALOG_ADMIN`, `ORDER_SPECIALIST`.

### PHASE 2 — SUPER_ADMIN Operational Completeness
- **File / Route**: [lib/dashboard-config.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/dashboard-config.ts), `app/dashboard/brands/page.tsx`, `app/dashboard/variants/page.tsx`
- **Masalah**: SUPER_ADMIN belum memiliki halaman dedicated untuk Brands dan Product Variants.
- **Apa yang Perlu Dibuat / Diperbaiki**:
  - Buat UI & API manajemen Brands (List, Create, Edit, Delete).
  - Buat UI & API manajemen Product Variants (List, Create, Edit, Delete).
  - Tambahkan link `Brands`, `Product Variants`, `Inventory`, dan `Shipping` ke sidebar SUPER_ADMIN.
- **Role Terdampak**: `SUPER_ADMIN`.

### PHASE 3 — CATALOG_ADMIN Management Features
- **File / Route**: `app/dashboard/inventory/page.tsx`, `app/api/admin/inventory/route.ts`, [lib/admin/services.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/admin/services.ts)
- **Masalah**: Feature Inventory & Stock Management pada `/dashboard/inventory` masih static placeholder.
- **Apa yang Perlu Dibuat / Diperbaiki**:
  - Implemen tabel stok variant produk, pencarian stok tipis (low stock), dan form penyesuaian stok (ADJUSTMENT).
  - Buat API endpoint `/api/admin/inventory` untuk mencatat pergerakan stok (`StockMovement`) secara manual oleh CATALOG_ADMIN/SUPER_ADMIN.
  - Tambahkan akses ke Brands & Product Variants untuk `CATALOG_ADMIN`.
- **Role Terdampak**: `CATALOG_ADMIN`, `SUPER_ADMIN`.

### PHASE 4 — ORDER_SPECIALIST Shipping & Order Rules
- **File / Route**: `app/dashboard/shipping/page.tsx`, `app/api/admin/shipping/route.ts`, [app/api/admin/orders/route.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/app/api/admin/orders/route.ts), [lib/admin/services.ts](file:///d:/PROJECT_UBUNTU/BIG_PROJECT/Nexora-1/lib/admin/services.ts)
- **Masalah**: Feature Shipping (`/dashboard/shipping`) masih static placeholder. Belum ada validasi alur status order.
- **Apa yang Perlu Dibuat / Diperbaiki**:
  - Implemen UI & API Manajemen Shipping: Daftar pesanan siap kirim, form input kurir & nomor resi, serta tombol update status pengiriman (`NOT_YET_SHIPPED` → `PACKED` → `SHIPPED` → `DELIVERED`).
  - Tambahkan validasi transisi status pada `PATCH /api/admin/orders` (cegah rollback status ilegal seperti `DELIVERED` → `PROCESSING` atau `PAID` → `PENDING`).
- **Role Terdampak**: `ORDER_SPECIALIST`, `SUPER_ADMIN`.

### PHASE 5 — CUSTOMER Dashboard, Profile & Wishlist Integration
- **File / Route**: `app/customer/page.tsx`, `app/profile/page.tsx`, `app/customer/wishlist/page.tsx`, `components/product/product-card.tsx`
- **Masalah**: Customer Profile masih placeholder, Customer Dashboard belum ada, Wishlist belum terintegrasi di catalog.
- **Apa yang Perlu Dibuat / Diperbaiki**:
  - Buat Customer Dashboard di `/customer` (Ringkasan pesanan aktif, total belanja, shortcut profil & wishlist).
  - Lengkapi halaman Profile (`/profile`): Form update nama, phone, dan manajemen daftar alamat (`Address`).
  - Integrasikan tombol Wishlist (toggle favorite) langsung di Product Card & Product Detail page.
- **Role Terdampak**: `CUSTOMER`.

### PHASE 6 — Final Authorization & Security Verification
- **File / Route**: Seluruh API routes & Dashboard pages
- **Masalah**: Memastikan tidak ada privilege escalation, IDOR (Indirect Data Object Reference), atau route leak.
- **Apa yang Perlu Dibuat / Diperbaiki**:
  - Lakukan pengujian komprehensif terhadap seluruh matriks hak akses 4 role (`SUPER_ADMIN`, `CATALOG_ADMIN`, `ORDER_SPECIALIST`, `CUSTOMER`).
  - Verifikasi isolasi data order/cart customer.
  - Verifikasi penolakan akses API untuk role tanpa hak.
- **Role Terdampak**: Seluruh Role (`SUPER_ADMIN`, `CATALOG_ADMIN`, `ORDER_SPECIALIST`, `CUSTOMER`).
