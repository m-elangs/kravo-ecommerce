# KRAVO — Modern Snack Company E-Commerce
## Dokumen Analisis Kebutuhan & Arsitektur Sistem (Tahap 1)

**Brand**: KRAVO  
**Tagline**: *Good Snacks. Better Moments.*  
**Dokumen Versi**: 1.0.0  
**Tanggal**: 2026-11-21  
**Status**: Tahap 1 Selesai — Menunggu Persetujuan (Approval) User  

---

## 1. PENDAHULUAN & RINGKASAN EKSEKUTIF

KRAVO adalah perusahaan modern di industri Food & Beverage (F&B) yang memproduksi dan memasarkan makanan ringan kemasan premium (Potato Chips, Cassava Chips, Chocolate Cookies, Cheese Crackers, Spicy Snacks, Snack Bundles).

KRAVO membutuhkan platform e-commerce yang menggabungkan dua model bisnis utama dalam satu ekosistem terpadu:
1. **B2C (Business to Consumer)**: Penjualan retail langsung kepada penikmat snack dengan pengalaman belanja modern, cepat, interaktif, dan terintegrasi payment gateway otomatis.
2. **B2B (Business to Business)**: Penjualan grosir terverifikasi kepada reseller, minimarket, toko, dan distributor dengan aturan Minimum Order Quantity (MOQ), tiered pricing (harga bertingkat), sistem faktur/invoice, dan alur pendaftaran bisnis formal.
3. **Food Inventory Management (FEFO & Batch Tracking)**: Pengelolaan rantai pasok makanan yang ketat, melacak tanggal produksi (*manufacturing date*), tanggal kedaluwarsa (*expiry date*), peringatan stok menipis, pencegahan penjualan produk kedaluwarsa, serta alokasi stok otomatis berbasis **First Expired, First Out (FEFO)**.

---

## 2. STAKEHOLDER & USER PERSONAS

| Aktor | Deskripsi Peran | Akses Utama |
| :--- | :--- | :--- |
| **Retail Customer (B2C)** | Konsumen umum yang membeli snack untuk konsumsi pribadi | Customer Portal: Catalog, Filter, Cart, Checkout, Midtrans, Order Tracking, Reviews, Wishlist |
| **Unverified Reseller** | Pendaftar akun bisnis B2B yang sedang menunggu verifikasi dokumen | Customer Portal dengan akses harga retail biasa dan status notifikasi permohonan |
| **Verified Reseller (B2B)** | Mitra bisnis resmi terverifikasi (toko, reseller, distributor) | B2B Portal: Wholesale Catalog, Bulk Order Matrix, Tiered Price calculation, B2B Checkout, Invoices |
| **Warehouse / Inventory Admin** | Petugas gudang logistik makanan | Admin Dashboard: Batches, Expiry tracking, Stock In/Out, Stock Movement History, FEFO monitoring |
| **Order & Sales Admin** | Administrator pemrosesan pesanan dan keuangan | Admin Dashboard: Order management, Payment verification, Resi input, Reseller approval, Wholesale pricing |
| **Super Admin / Management** | Pemilik perusahaan / pimpinan operasional KRAVO | Full Access: Executive Sales Dashboard, Reports, Voucher control, Staff role management, Settings |

---

## 3. ANALISIS KEBUTUHAN SISTEM

### 3.1 Kebutuhan Fungsional (Functional Requirements)

#### Modul Autentikasi & Otorisasi
- **FR-AUTH-01**: Pendaftaran pengguna retail dengan email, nomor telepon, dan password terenkripsi (Bcrypt/Argon2id).
- **FR-AUTH-02**: Login multi-role (Admin, Customer, Reseller) dengan token berbasis Laravel Sanctum.
- **FR-AUTH-03**: Role-Based Access Control (RBAC) dengan pemisahan permission yang ketat via Laravel Policies & Middleware.

#### Modul B2C (Retail E-Commerce)
- **FR-B2C-01**: Katalog produk responsif dengan filter dinamis (kategori, range harga, rasa, sorting rating/terpopuler).
- **FR-B2C-02**: Pencarian produk instan (*live search*) dengan indexing performa tinggi.
- **FR-B2C-03**: Detail produk multi-varian (pilihan varian rasa, gramasi/ukuran kemasan, status ketersediaan stok).
- **FR-B2C-04**: Shopping cart persisten (database-driven untuk user login, local storage fallback untuk guest).
- **FR-B2C-05**: Sistem voucher promo (potongan nominal flat maupun persentase dengan validasi minimum belanja dan kuota).
- **FR-B2C-06**: Multi-address management (alamat pengiriman utama, kelurahan, kecamatan, kota, kode pos).
- **FR-B2C-07**: Integrasi pembayaran Midtrans Snap (Virtual Account, QRIS / GoPay, Credit Card) dengan mode Sandbox.
- **FR-B2C-08**: Live order tracking (Status: *Pending Payment*, *Paid*, *Processing*, *Shipped*, *Delivered*, *Cancelled*).
- **FR-B2C-09**: Wishlist produk dan sistem review/rating terverifikasi (hanya pembeli yang sudah menerima produk).

#### Modul B2B (Wholesale / Reseller System)
- **FR-B2B-01**: Form registrasi reseller khusus (nama entitas bisnis, NPWP / NIB / KTP, jenis usaha, alamat toko fisik/online, unggah dokumen pendukung).
- **FR-B2B-02**: Verifikasi manual oleh Admin (status: *Pending Verification*, *Approved*, *Rejected* disertai catatan penolakan).
- **FR-B2B-03**: Aturan visibilitas harga: Non-reseller atau *Pending Reseller* hanya melihat harga retail. Reseller *Approved* otomatis melihat harga B2B dan tiering volume.
- **FR-B2B-04**: Minimum Order Quantity (MOQ) enforcement di frontend dan validasi mutlak di backend Laravel.
- **FR-B2B-05**: Matrix Tiered Pricing: Diskon bertingkat berdasarkan kuantitas (contoh: 50–199 pcs: Rp12.000/pcs; 200–499 pcs: Rp10.500/pcs; ≥500 pcs: Rp9.000/pcs).
- **FR-B2B-06**: Bulk ordering interface (pemesanan grosir cepat per dus / karton / multi-varian dalam 1 tampilan tabel).
- **FR-B2B-07**: Penerbitan Proforma Invoice dan B2B Tax Invoice otomatis saat pesanan dibuat.

#### Modul Manajemen Makanan & Inventaris (Food Inventory & FEFO)
- **FR-INV-01**: Pelacakan batch produk (*Product Batch Tracking*): nomor batch produksi unik, tanggal produksi (*Manufacturing Date*), tanggal kedaluwarsa (*Expiry Date*).
- **FR-INV-02**: Implementasi algoritma **FEFO (First Expired, First Out)**: sistem otomatis mengalokasikan stok pesanan dari batch yang paling dekat dengan tanggal kedaluwarsa (asalkan masih dalam batas aman konsumsi, e.g. > 60 hari).
- **FR-INV-03**: Larangan penjualan produk expired: batch yang telah melewati batas kedaluwarsa otomatis dikunci (*quarantined/expired*) dan tidak dapat dialokasikan ke pesanan baru.
- **FR-INV-04**: Pencatatan mutasi stok (*Stock Movement History*): setiap perubahan kuantitas tercatat audit trail-nya (`IN_PRODUCTION`, `IN_RESTOCK`, `OUT_ORDER`, `OUT_EXPIRED_DISPOSAL`, `OUT_DAMAGE`, `ADJUSTMENT`).
- **FR-INV-05**: Early Warning System: Notifikasi otomatis untuk stok menipis (*low stock warning*) dan batch mendekati kadaluarsa (*near-expiry alert* dalam 90/60/30 hari).

#### Modul Transaksi & Anti-Tampering
- **FR-TX-01**: **Price Snapshotting**: Seluruh detail produk, nama varian, berat, dan harga final per item dibekukan ke dalam tabel `order_items` saat transaksi terjadi. Perubahan harga katalog di masa depan tidak mengubah histori transaksi.
- **FR-TX-02**: **Pessimistic Locking & Database Transaction**: Penggunaan `DB::transaction()` dengan `lockForUpdate()` saat validasi checkout dan alokasi batch stok untuk mencegah *race condition* dan *overselling*.
- **FR-TX-03**: Webhook listener Midtrans dengan validasi kriptografi signature SHA-512 `hash("sha512", order_id + status_code + gross_amount + ServerKey)` untuk mencegah eksploitasi status pembayaran palsu.

#### Modul Admin Dashboard
- **FR-ADM-01**: Dashboard analitik real-time: Total Revenue, Total Orders, Total Customers, Reseller metrics, Best-selling items, Low stock alerts, Expiring batch warnings.
- **FR-ADM-02**: Manajemen katalog lengkap: Produk, Kategori, Varian, Gambar multi-upload.
- **FR-ADM-03**: Manajemen pesanan, pelacakan pembayaran, assign nomor resi kurir, dan penyelesaian pesanan.
- **FR-ADM-04**: Manajemen reseller dan penetapan aturan harga grosir (*Wholesale Price Tiers*).
- **FR-ADM-05**: Laporan penjualan dan pergerakan stok dengan export data.

---

### 3.2 Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Keamanan (Security)**:
   - Sanitasi input dan proteksi terhadap SQL Injection, XSS, CSRF.
   - Validasi ketat pada backend: frontend dilarang keras mengirim harga belanjaan (frontend hanya mengirim `product_variant_id` dan `quantity`). Seluruh perhitungan harga, tiering diskon, dan subtotal dihitung murni di server.
   - Validasi file upload dokumen reseller & gambar produk (whitelist MIME type: image/jpeg, image/png, image/webp, application/pdf; max size 2MB/5MB).
   - Rate limiting pada endpoint login, register, dan checkout API.

2. **Konsistensi Data & Keandalan Transaksi**:
   - Penggunaan tipe data `DECIMAL(12, 2)` untuk semua kolom moneter (harga, diskon, subtotal, total biaya pengiriman, pajak). Dilarang menggunakan `FLOAT` atau `DOUBLE`.
   - Foreign key cascade & constraint integrity pada MySQL InnoDB.

3. **Performa & Skalabilitas**:
   - Response time API rata-rata < 200ms untuk endpoint umum.
   - Database indexing pada kolom foreign key, status pesanan, SKU, nomor resi, dan tanggal expired.
   - Eager loading Eloquent ORM (`with()`) untuk mengeliminasi masalah N+1 query.

4. **UI/UX & Desain Brand Modern**:
   - Palet warna resmi KRAVO: Dark Forest (`#20251F`), Warm Orange (`#E68A42`), Cream (`#F4EBDD`), White (`#FFFFFF`).
   - Desain responsif (Mobile-first, Tablet, Desktop) dengan layout fluid berbasis Tailwind CSS.
   - UI premium ala brand snack internasional dengan micro-interactions, loading skeleton, dan error state yang informatif.

---

## 4. ARSITEKTUR SISTEM (SYSTEM ARCHITECTURE)

Platform KRAVO dirancang menggunakan arsitektur **Decoupled Client-Server (Headless E-Commerce)**:

```
+---------------------------------------------------------------------------------------------------+
|                                          CLIENT TIER                                              |
|                                                                                                   |
|   +-----------------------------------------+   +---------------------------------------------+   |
|   |         KRAVO Customer Portal           |   |            KRAVO Admin Dashboard            |   |
|   |   (React 18 + Tailwind CSS + Lucide)    |   |     (React 18 + Tailwind CSS + Lucide)      |   |
|   | - Retail Storefront (B2C)               |   | - Executive Analytics & Revenue Reports     |   |
|   | - Wholesale Matrix & B2B Portal         |   | - FEFO Batch Inventory Management           |   |
|   | - Responsive Web / Mobile Optimized     |   | - Order, Shipment & Reseller Approvals      |   |
|   +-----------------------------------------+   +---------------------------------------------+   |
+---------------------------------------------------------------------------------------------------+
                                                  |
                                   HTTPS / REST JSON API
                                   (Axios + Interceptors)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      APPLICATION TIER (BACKEND)                                   |
|                                                                                                   |
|                              +---------------------------------------+                            |
|                              |      Laravel 10 REST API Framework    |                            |
|                              +---------------------------------------+                            |
|                                                  |                                                |
|      +---------------------+---------------------+---------------------+------------------+       |
|      |                     |                     |                     |                  |       |
|      v                     v                     v                     v                  v       |
|  [Middleware &]     [Form Requests]         [Controllers]          [Service Layer]    [Policies &]|
|  [Sanctum Auth]     [Validation]            [API Handlers]         [Business Logic]   [RBAC Gate] |
|                                                                            |                      |
|                                 +------------------------------------------+                      |
|                                 |                                                                 |
|                                 v                                                                 v
|                    +-------------------------+                                     +--------------------+
|                    |     Inventory Engine    |                                     | Transaction Engine |
|                    |  - FEFO Batch Selector  |                                     | - Price Calculation|
|                    |  - Stock Movement Log   |                                     | - B2B Tier Solver  |
|                    |  - Expiry Quarantine    |                                     | - Midtrans Gateway |
|                    +-------------------------+                                     +--------------------+
+---------------------------------------------------------------------------------------------------+
                                                  |
                                       PDO / Eloquent ORM
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                           DATA TIER                                               |
|                                                                                                   |
|                       +-----------------------------------------------+                           |
|                       |            MySQL 8.0 (kravo_ecommerce)         |                           |
|                       | - InnoDB Engine with Acid Transactions        |                           |
|                       | - Foreign Key Constraints                     |                           |
|                       | - Pessimistic Locking (SELECT ... FOR UPDATE) |                           |
|                       +-----------------------------------------------+                           |
+---------------------------------------------------------------------------------------------------+
                                                  |
                         +------------------------+------------------------+
                         |                                                 |
                         v                                                 v
           +---------------------------+                     +---------------------------+
           |     Payment Gateway       |                     |    Local Storage / CDN    |
           |   Midtrans Snap Sandbox   |                     | - Product Images          |
           | - Notification Webhook    |                     | - Reseller Business Docs  |
           +---------------------------+                     +---------------------------+
```

---

## 5. ALGORITMA UTAMA SISTEM

### 5.1 Algoritma FEFO (First Expired, First Out)
Ketika pesanan dikonfirmasi dan stok dialokasikan:
1. Sistem mencari semua batch aktif (`status = 'active'`) untuk varian produk bersangkutan yang tanggal kedaluwarsanya (`expiry_date`) masih lebih besar dari `CURRENT_DATE + minimum_shelf_life_days` (default: 30 hari).
2. Mengurutkan batch berdasarkan `expiry_date ASC` (batch yang paling cepat kadaluarsa ditempatkan pertama).
3. Melakukan penguncian baris (`lockForUpdate()`) pada tabel `product_batches` dan `inventories`.
4. Mengurangi kuantitas dari batch pertama. Jika kuantitas batch pertama tidak mencukupi, sisa kebutuhan diambil dari batch berikutnya secara berurutan.
5. Mencatat mutasi setiap pengurangan ke tabel `stock_movements`.
6. Jika total stok dari semua batch aktif kurang dari kuantitas yang diminta, transaksi di-rollback secara utuh dengan pesan error "Stok tidak mencukupi".

### 5.2 Algoritma B2B Tiered Pricing & MOQ
1. Sistem mendeteksi `user_id` dari token Sanctum.
2. Memeriksa status pada tabel `reseller_profiles`.
3. Jika user bukan reseller atau status != `'approved'`, sistem mengabaikan harga grosir dan menerapkan harga retail normal.
4. Jika user terverifikasi `'approved'`:
   - Sistem memeriksa apakah total kuantitas per item memenuhi `minimum_order_quantity (MOQ)`.
   - Mengambil aturan pada tabel `price_tiers` untuk varian produk tersebut:
     `SELECT unit_price FROM price_tiers WHERE product_variant_id = ? AND min_quantity <= ? ORDER BY min_quantity DESC LIMIT 1`.
   - Menerapkan `unit_price` grosir yang sesuai ke dalam kalkulasi subtotal.
5. Menghasilkan invoice proforma dengan rincian tier diskon yang diperoleh.

---

## 6. STRUKTUR FOLDER PROYEK (DIRECTORY STRUCTURE)

Struktur direktori monorepo yang bersih dan modular:

```
Projek Portofolio/
├── docs/
│   ├── 01-system-requirements-and-architecture.md  <-- Dokumen Arsitektur & Analisis ini
│   ├── 02-ui-ux-design-and-wireframes.md           <-- Tahap 2
│   ├── 03-database-erd-and-data-dictionary.md      <-- Tahap 3
│   └── api-specification.md                        <-- Spesifikasi Endpoint REST API
│
├── backend/                                        <-- Laravel 10 REST API
│   ├── app/
│   │   ├── Enums/
│   │   │   ├── OrderStatus.php
│   │   │   ├── PaymentStatus.php
│   │   │   ├── ResellerStatus.php
│   │   │   └── StockMovementType.php
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── AuthController.php
│   │   │   │   │   ├── CategoryController.php
│   │   │   │   │   ├── ProductController.php
│   │   │   │   │   ├── CartController.php
│   │   │   │   │   ├── CheckoutController.php
│   │   │   │   │   ├── OrderController.php
│   │   │   │   │   ├── WishlistController.php
│   │   │   │   │   ├── ReviewController.php
│   │   │   │   │   ├── ResellerController.php
│   │   │   │   │   ├── PaymentWebhookController.php
│   │   │   │   │   └── Admin/
│   │   │   │   │       ├── DashboardController.php
│   │   │   │   │       ├── ProductManagementController.php
│   │   │   │   │       ├── BatchInventoryController.php
│   │   │   │   │       ├── OrderManagementController.php
│   │   │   │   │       ├── ResellerVerificationController.php
│   │   │   │   │       ├── WholesalePricingController.php
│   │   │   │   │       └── ReportController.php
│   │   │   ├── Middleware/
│   │   │   │   ├── CheckRole.php
│   │   │   │   └── EnsureResellerApproved.php
│   │   │   ├── Requests/
│   │   │   │   ├── RegisterRequest.php
│   │   │   │   ├── LoginRequest.php
│   │   │   │   ├── ResellerRegisterRequest.php
│   │   │   │   ├── CheckoutRequest.php
│   │   │   │   ├── ProductBatchRequest.php
│   │   │   │   └── WholesaleTierRequest.php
│   │   │   └── Resources/
│   │   │       ├── UserResource.php
│   │   │       ├── ProductResource.php
│   │   │       ├── CartResource.php
│   │   │       ├── OrderResource.php
│   │   │       └── ResellerProfileResource.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Role.php
│   │   │   ├── Address.php
│   │   │   ├── ResellerProfile.php
│   │   │   ├── Category.php
│   │   │   ├── Product.php
│   │   │   ├── ProductVariant.php
│   │   │   ├── ProductImage.php
│   │   │   ├── PriceTier.php
│   │   │   ├── Inventory.php
│   │   │   ├── ProductBatch.php
│   │   │   ├── StockMovement.php
│   │   │   ├── Cart.php
│   │   │   ├── CartItem.php
│   │   │   ├── Order.php
│   │   │   ├── OrderItem.php
│   │   │   ├── Payment.php
│   │   │   ├── Shipment.php
│   │   │   ├── Voucher.php
│   │   │   ├── Review.php
│   │   │   ├── Wishlist.php
│   │   │   └── WishlistItem.php
│   │   ├── Policies/
│   │   │   ├── OrderPolicy.php
│   │   │   ├── ResellerPolicy.php
│   │   │   └── InventoryPolicy.php
│   │   └── Services/
│   │       ├── CartService.php
│   │       ├── CheckoutService.php
│   │       ├── InventoryFefoService.php
│   │       ├── WholesalePriceService.php
│   │       └── MidtransPaymentService.php
│   ├── config/
│   │   ├── midtrans.php
│   │   └── kravo.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       ├── DatabaseSeeder.php
│   │       ├── RoleSeeder.php
│   │       ├── UserSeeder.php
│   │       ├── CategorySeeder.php
│   │       ├── ProductSeeder.php
│   │       ├── BatchAndInventorySeeder.php
│   │       └── WholesalePricingSeeder.php
│   └── routes/
│       ├── api.php
│       └── web.php
│
└── frontend/                                       <-- Single Page Application (React 18 + Vite)
    ├── public/
    │   ├── favicon.ico
    │   └── assets/images/
    ├── src/
    │   ├── api/
    │   │   ├── axiosClient.js                      <-- Axios instance with auth interceptors
    │   │   ├── authApi.js
    │   │   ├── productApi.js
    │   │   ├── cartApi.js
    │   │   ├── orderApi.js
    │   │   ├── resellerApi.js
    │   │   └── adminApi.js
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── Navbar.jsx
    │   │   │   ├── Footer.jsx
    │   │   │   ├── Button.jsx
    │   │   │   ├── Badge.jsx
    │   │   │   ├── Modal.jsx
    │   │   │   └── LoadingSpinner.jsx
    │   │   ├── customer/
    │   │   │   ├── ProductCard.jsx
    │   │   │   ├── CartDrawer.jsx
    │   │   │   └── TierPriceTable.jsx
    │   │   └── admin/
    │   │       ├── AdminSidebar.jsx
    │   │       ├── AdminHeader.jsx
    │   │       ├── MetricCard.jsx
    │   │       └── BatchExpiryBadge.jsx
    │   ├── contexts/
    │   │   ├── AuthContext.jsx
    │   │   ├── CartContext.jsx
    │   │   └── WishlistContext.jsx
    │   ├── hooks/
    │   │   ├── useAuth.js
    │   │   ├── useCart.js
    │   │   └── useDebounce.js
    │   ├── layouts/
    │   │   ├── CustomerLayout.jsx                  <-- Layout Storefront B2C & B2B
    │   │   └── AdminLayout.jsx                     <-- Layout Dashboard Admin KRAVO
    │   ├── pages/
    │   │   ├── customer/
    │   │   │   ├── HomePage.jsx
    │   │   │   ├── AboutPage.jsx
    │   │   │   ├── CatalogPage.jsx
    │   │   │   ├── ProductDetailPage.jsx
    │   │   │   ├── CartPage.jsx
    │   │   │   ├── CheckoutPage.jsx
    │   │   │   ├── PaymentPendingPage.jsx
    │   │   │   ├── OrderTrackingPage.jsx
    │   │   │   ├── MyAccountPage.jsx
    │   │   │   ├── MyOrdersPage.jsx
    │   │   │   ├── WishlistPage.jsx
    │   │   │   ├── WholesaleRegistrationPage.jsx
    │   │   │   ├── WholesaleOrderPage.jsx
    │   │   │   └── ContactPage.jsx
    │   │   └── admin/
    │   │       ├── DashboardOverviewPage.jsx
    │   │       ├── ProductsListPage.jsx
    │   │       ├── ProductFormPage.jsx
    │   │       ├── CategoriesPage.jsx
    │   │       ├── InventoryFefoPage.jsx
    │   │       ├── BatchesPage.jsx
    │   │       ├── OrdersListPage.jsx
    │   │       ├── OrderDetailPage.jsx
    │   │       ├── ResellersListPage.jsx
    │   │       ├── WholesalePricingPage.jsx
    │   │       ├── VouchersPage.jsx
    │   │       ├── ReviewsPage.jsx
    │   │       └── ReportsPage.jsx
    │   ├── routes/
    │   │   ├── AppRoutes.jsx
    │   │   ├── ProtectedRoute.jsx
    │   │   └── ResellerRoute.jsx
    │   ├── styles/
    │   │   └── index.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── tailwind.config.js                          <-- Custom colors: Dark Forest, Warm Orange, Cream
    └── package.json
```

---

## 7. RANCANGAN PALET WARNA & IDENTITAS DESIGN

| Nama Token Warna | Kode HEX | Peruntukan Utama pada UI |
| :--- | :--- | :--- |
| **Dark Forest** | `#20251F` | Background navbar utama, text heading premium, hero banners, dark surfaces |
| **Warm Orange** | `#E68A42` | Primary CTA button, badge promo/diskon, active states, accent highlights |
| **Cream** | `#F4EBDD` | Background body website, card background yang lembut, warm container borders |
| **White** | `#FFFFFF` | Card surface, modal sheet, input background, readable content areas |
| **Success Emerald**| `#10B981` | Status badge "Paid", "Approved", "In Stock", "Delivered" |
| **Warning Amber** | `#F59E0B` | Status badge "Pending Verification", "Near Expiry Alert", "Low Stock" |
| **Danger Rose** | `#EF4444` | Status badge "Expired", "Out of Stock", "Rejected", "Cancelled" |

---

## 8. SPESIFIKASI ENDPOINT API UTAMA (HIGH LEVEL REST CONTRACT)

Semua response API dibungkus dalam format standar seragam:
```json
{
  "success": true,
  "message": "Deskripsi respon sukses atau gagal",
  "data": { ... },
  "errors": null,
  "meta": {
    "current_page": 1,
    "last_page": 5,
    "per_page": 15,
    "total": 68
  }
}
```

### Kategori Endpoint:
1. **Auth & Akun**: `/api/v1/auth/register`, `/api/v1/auth/login`, `/api/v1/auth/logout`, `/api/v1/auth/me`, `/api/v1/auth/profile`
2. **Katalog & Kategori**: `/api/v1/categories`, `/api/v1/products`, `/api/v1/products/{slug}`, `/api/v1/products/{id}/reviews`
3. **Cart & Wishlist**: `/api/v1/cart`, `/api/v1/cart/items`, `/api/v1/wishlist`
4. **Checkout & Pembayaran**: `/api/v1/checkout/preview`, `/api/v1/checkout`, `/api/v1/orders/{orderNumber}`, `/api/v1/payments/midtrans-webhook`
5. **B2B / Reseller**: `/api/v1/reseller/register`, `/api/v1/reseller/status`, `/api/v1/wholesale/products`, `/api/v1/wholesale/checkout`
6. **Admin Dashboard**: `/api/v1/admin/dashboard/metrics`, `/api/v1/admin/products`, `/api/v1/admin/inventory/batches`, `/api/v1/admin/inventory/fefo-summary`, `/api/v1/admin/resellers`, `/api/v1/admin/resellers/{id}/verify`, `/api/v1/admin/orders`

---

## 9. RENCANA KERJA TAHAP SELANJUTNYA (ROADMAP TAHAP 2-10)

- **Tahap 1**: Analisis kebutuhan dan system architecture (*Sedang Diajukan untuk Persetujuan*).
- **Tahap 2**: UI/UX design, wireframe komponen, design system Tailwind CSS, dan struktur layout halaman.
- **Tahap 3**: Database schema lengkap, ERD tabel, foreign keys, constraints, dan file database migration Laravel.
- **Tahap 4**: Setup Laravel 10 backend, models, Sanctum auth, Services, Form Requests, Policies, dan REST API.
- **Tahap 5**: Pembuatan Customer Frontend React (Storefront B2C: Catalog, Detail, Cart, Checkout, Order Tracking).
- **Tahap 6**: Pembuatan Admin Dashboard React (FEFO Inventory, Batches, Orders, Reseller verification, Metrics).
- **Tahap 7**: Integrasi penuh B2B (Pendaftaran reseller, upload dokumen, validasi MOQ, bulk order matrix, wholesale tiers).
- **Tahap 8**: Integrasi payment gateway Midtrans Sandbox (Snap token, popup modal, signature verification webhook).
- **Tahap 9**: Comprehensive testing (Unit, Feature, Anti-tampering check, Concurrency overselling test) & Security Review.
- **Tahap 10**: Deployment guide, environment configurations, production build, dan demo data seeding.
