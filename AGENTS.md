<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## PAYMENT SYSTEM (MANUAL PAYMENT)

Saat ini project belum menggunakan payment gateway seperti:

* Midtrans
* Xendit
* Stripe
* PayPal

Jadi implementasikan **Manual Payment System** terlebih dahulu.

JANGAN menambahkan dependency payment baru.

JANGAN integrasi API eksternal.

Gunakan database dan flow yang sudah ada.

---

### Flow Payment yang Diinginkan

Customer:

Product
↓
Cart
↓
Checkout
↓
Create Order
↓
Masuk ke halaman Payment
↓
Customer memasukkan nominal pembayaran
↓
Sistem validasi nominal
↓
Jika nominal sesuai atau lebih besar dari grand total:
* paymentStatus = PAID
* status = PROCESSING
* simpan data payment
* tampilkan "Payment Success"

Jika nominal kurang:
* tampilkan error: `"Nominal pembayaran kurang"`
* paymentStatus tetap: `PENDING`

---

### Contoh

Total Order:
`$100`

Customer input:
`100` atau `120`

Maka:
`paymentStatus = PAID`
`status = PROCESSING`

Customer input:
`80`

Maka:
`paymentStatus = PENDING`

Error:
`Payment amount is insufficient`

---

### Payment Table

Jika model `Payment` sudah ada di Prisma:
Gunakan model tersebut.

Simpan:
* orderId
* amount
* paymentMethod = MANUAL
* paymentStatus
* paidAt
* note

Jangan membuat schema baru jika model Payment sudah tersedia.

---

### Halaman Baru

Jika diperlukan, buat:
`/payment/[orderId]`
atau:
`/orders/[id]/payment`

Isi halaman:
* Order Number
* Total Payment
* Input Nominal
* Tombol Pay Now

---

### Admin Side

SUPER ADMIN dapat melihat:
* Payment Status
* Paid Amount
* Payment Date
* Payment Method

Admin juga dapat mengubah:
`PENDING` → `PAID`
untuk simulasi verifikasi pembayaran manual.

---

### Business Rule

Order:
`PENDING`

Jika pembayaran berhasil:
`paymentStatus = PAID`
`status = PROCESSING`

Shipment:
`NOT_YET_SHIPPED`

Setelah admin kirim:
`PACKED` → `SHIPPED` → `DELIVERED`

---

### Yang Harus Diuji

Customer:
✅ Checkout
✅ Create Order
✅ Redirect ke Payment
✅ Input nominal
✅ Validasi nominal
✅ Update payment status
✅ Update order status
✅ Order History
✅ Order Detail

Admin:
✅ Melihat payment
✅ Verifikasi payment
✅ Update shipment
✅ Update order

---

Berikut yang perlu ditambahkan.

---

# 1. Tambahkan Flow Order secara lengkap

Saat ini hanya menjelaskan Payment.

Padahal Order itu dimulai dari Cart.

Tambahkan:

```text
Product
↓

Add To Cart

↓

Cart

↓

Checkout

↓

Create Order

↓

Payment

↓

Order Processing

↓

Shipment

↓

Delivered
```

---

# 2. Tambahkan Business Rule Status

Ini penting supaya status tidak loncat.

Misalnya:

```
Order Status

PENDING
↓

PROCESSING
↓

SHIPPED
↓

DELIVERED
↓

COMPLETED
```

Kalau dibatalkan

```
PENDING
↓

CANCELLED
```

Bukan

```
DELIVERED
↓

PENDING
```

atau

```
DELIVERED
↓

PROCESSING
```

Karena itu tidak valid.

---

# 3. Payment Status

Jangan cuma

```
PENDING

PAID
```

Kalau di schema ada enum lain, gunakan semuanya.

Kalau cuma ada dua memang tidak masalah.

---

# 4. Shipment Status

Tuliskan jelas.

```
NOT_YET_SHIPPED

↓

PACKED

↓

SHIPPED

↓

DELIVERED
```

---

# 5. Transaction

Ini menurutku WAJIB.

Tambahkan:

```
Semua proses Create Order HARUS menggunakan prisma.$transaction().

Di dalam transaction:

- create address
- create order
- create order item
- update stock
- create stock movement
- create payment (jika diperlukan)
- clear cart

Jika salah satu gagal,

rollback seluruh transaction.
```

---

# 6. Validasi Stock

Tambahkan.

Misalnya.

```
Saat checkout:

cek ulang stock ProductVariant.

Jika stock berubah sejak item dimasukkan ke cart,

batalkan checkout.

Tampilkan pesan:

"Stock has changed. Please review your cart."
```

Ini sering dilupakan.

---

# 7. Validasi Payment

Tambahkan lebih detail.

```
Nominal < Grand Total

↓

Reject

Nominal == Grand Total

↓

Success

Nominal > Grand Total

↓

Success

Simpan paidAmount

Simpan changeAmount
```

Kalau lebih bayar,

minimal simpan nilai change.

---

# 8. Payment Record

Tambahkan.

```
Satu Order

=

Satu Payment
```

Jangan sampai setiap klik tombol

```
Pay Now
```

membuat Payment baru.

Harus dicek dulu.

---

# 9. Prevent Double Click

Ini penting.

```
Saat user menekan

Pay Now

button harus disabled.

Tidak boleh membuat dua payment.
```

---

# 10. Stock Movement

Tambahkan.

Misalnya.

```
type = OUT

quantity

stockBefore

stockAfter

note

"Customer Order NXR-xxxx"
```

Supaya histori stok jelas.

---

# 11. Order Number

Tambahkan.

Pastikan

```
NXR-YYYYMMDD-XXXX
```

atau format project yang sekarang.

Dan harus unique.

---

# 12. Admin Rules

Admin tidak boleh bisa:

```
DELIVERED

↓

PROCESSING
```

atau

```
PAID

↓

PENDING
```

Kalau memang business rule tidak mengizinkan.

Harus ada validasi transisi status.

---

# 13. Testing Checklist

Aku akan menambah ini.

```
Customer

✓ Add To Cart

✓ Update Qty

✓ Remove Item

✓ Clear Cart

✓ Checkout

✓ Create Order

✓ Payment Success

✓ Payment Failed

✓ Order History

✓ Order Detail

✓ Cannot pay twice

✓ Cannot checkout empty cart

✓ Cannot checkout insufficient stock

✓ Cannot exceed stock

✓ Cannot access another user's order
```

---

# 14. Admin Testing

```
Admin

✓ View Orders

✓ Search Orders

✓ Filter Orders

✓ Update Payment

✓ Update Shipment

✓ Update Order Status

✓ View Detail

✓ Cannot update invalid status

✓ Stock reduced correctly

✓ StockMovement created

✓ Payment created only once
```

---

Implementasikan seperti simulasi e-commerce nyata, tetapi tanpa payment gateway eksternal. Fokus pada logika bisnis, validasi, sinkronisasi status Order, Payment, dan Shipment.

