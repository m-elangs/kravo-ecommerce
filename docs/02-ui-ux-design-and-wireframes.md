# KRAVO — UI/UX Design System & Struktur Halaman (Tahap 2)

**Brand**: KRAVO  
**Tagline**: *Good Snacks. Better Moments.*  
**Dokumen Versi**: 1.0.0  
**Tanggal**: 2026-11-21  
**Status**: Tahap 2 Selesai — Menunggu Persetujuan (Approval) User  

---

## 1. DESIGN SYSTEM & DESIGN TOKENS

KRAVO mengusung estetika brand snack premium modern (mengadopsi inspirasi brand global seperti *Magic Spoon, Fly By Jing, Daily Harvest, dan Graze*). Desain tidak kaku seperti marketplace konvensional dan tidak generik seperti dashboard bawaan bootstrap.

### 1.1 Palet Warna Resmi (Color Palette)

```
+-------------------------------------------------------------------------------------------------+
| PRIMARY BRAND PALETTE                                                                           |
|                                                                                                 |
|   #20251F               #E68A42               #F4EBDD               #FFFFFF                     |
|   Dark Forest           Warm Orange           Cream                 Pure White                  |
|   [bg-kravo-dark]       [bg-kravo-orange]     [bg-kravo-cream]      [bg-white]                  |
|   - Brand headings      - Primary CTA         - Main App Canvas     - Card surfaces             |
|   - Primary Navbar      - Promo badges        - Section contrast    - Dialog & Modal sheets     |
|   - Hero contrast       - Active states       - Warm containers     - Form inputs               |
+-------------------------------------------------------------------------------------------------+
| SEMANTIC & STATUS ACCENTS                                                                       |
|                                                                                                 |
|   #10B981 (Success Emerald): In Stock, Batch Active, Paid, Reseller Approved                   |
|   #F59E0B (Warning Amber):   Low Stock (< 50 pcs), Near Expiry Alert (<= 60 hari), Pending      |
|   #EF4444 (Danger Rose):     Expired Batch, Out of Stock, Rejected, Payment Failed              |
|   #6366F1 (Indigo Wholesale): B2B Bulk Tier Badge, Reseller Portal Highlight                    |
+-------------------------------------------------------------------------------------------------+
```

### 1.2 Tipografi (Typography Scale)
- **Primary Display & Headings**: `Plus Jakarta Sans` / `Outfit`, sans-serif dengan bobot font bold (700) dan extra-bold (800) untuk memberikan nuansa playful namun premium.
- **Body & Data Typography**: `Inter`, sans-serif dengan bobot regular (400) dan medium (500) untuk keterbacaan tinggi pada tabel stok dan invoice.

| Skala Tailwind | Ukuran / Line Height | Penggunaan |
| :--- | :--- | :--- |
| `text-5xl` to `text-6xl` | 48px–60px / 1.1 | Hero Headlines di Homepage |
| `text-3xl` to `text-4xl` | 30px–36px / 1.2 | Page Titles, Product Names di Detail Page |
| `text-xl` to `text-2xl` | 20px–24px / 1.3 | Card Headings, Section Titles, Modal Headers |
| `text-base` | 16px / 1.5 | Paragraph body, input field text, primary buttons |
| `text-sm` | 14px / 1.4 | Secondary text, table cells, metadata, badge text |
| `text-xs` | 12px / 1.3 | SKU, expiry date countdown, audit log timestamps |

### 1.3 Border Radius, Shadows & Micro-interactions
- **Corners**: Menggunakan lengkungan modern yang bersahabat:
  - Button & Form Inputs: `rounded-xl` (12px)
  - Product Cards & Dialogs: `rounded-2xl` (16px)
  - Hero Banners & Featured Containers: `rounded-3xl` (24px)
  - Badges & Pills: `rounded-full` (9999px)
- **Shadows**:
  - Card Default: `shadow-sm hover:shadow-xl transition-all duration-300`
  - Floating Cart & Sticky Nav: `shadow-lg backdrop-blur-md bg-white/90`
- **Transitions**:
  - `transition-all duration-200 ease-in-out` untuk semua button hover, scaling 1.02 pada gambar produk saat card di-hover.

---

## 2. ANATOMI KOMPONEN INTI REUSABLE

### 2.1 Product Card (B2C & B2B Dual Mode)
```
+----------------------------------------------------+
|  [Tag: BESTSELLER]             [Wishlist Heart Icon]
|                                                    |
|            [ Gambar Snack Beresolusi Tinggi ]      |
|                                                    |
|  Kategori: Keripik & Chips                         |
|  KRAVO Truffle Cassava Gourmet 150g               |
|  ★ 4.9 (128 Reviews)                               |
|                                                    |
|  Rp 24.500                                         |
|  [B2B Badge: Grosir mulai Rp 18.000 / MOQ 50 pcs]  |
|                                                    |
|  [ + Tambah ke Keranjang (Warm Orange Button) ]    |
+----------------------------------------------------+
```

### 2.2 FEFO Batch & Expiry Badge (Food Safety)
```
+-------------------------------------------------------------------------------+
| Batch: #KB-2026-088 | Mfd: 15 Okt 2026 | Exp: 15 Apr 2027                     |
| [Status: FRESH (145 Hari Menjelang Expired)]  [Stok: 450 pcs]                 |
+-------------------------------------------------------------------------------+
```

### 2.3 B2B Wholesale Pricing Matrix Table
```
+-------------------------------------------------------------------------------+
| Tier Kuantitas        | Harga Satuan       | Hemat      | Margin Reseller    |
+-----------------------+--------------------+------------+--------------------+
| Retail (1 - 49 pcs)   | Rp 25.000 / pcs    | -          | Konsumen Akhir     |
| Tier 1 (50 - 199 pcs) | Rp 20.000 / pcs    | Diskon 20% | 25% Potensi Cuan   |
| Tier 2 (200 - 499 pcs)| Rp 17.500 / pcs    | Diskon 30% | 42% Potensi Cuan   |
| Tier 3 (>= 500 pcs)   | Rp 15.000 / pcs    | Diskon 40% | 66% Potensi Cuan   |
+-------------------------------------------------------------------------------+
```

---

## 3. STRUKTUR 15 HALAMAN CUSTOMER WEBSITE

### 1. Homepage (`/`)
- **Hero Section**: Tagline "Good Snacks. Better Moments." dengan background Warm Forest & visual kemasan snack premium 3D melayang. Dual CTA: "Belanja Sekarang" (Retail) dan "Gabung Reseller B2B".
- **Category Quick Carousel**: Potato Chips, Cassava, Cookies, Crackers, Spicy Bites, Bundles.
- **Featured Flavors (Best Sellers)**: Grid produk terpopuler dengan harga, rating, dan quick add to cart.
- **Why KRAVO?**: 4 Nilai Unggulan (Bahan Alami Pilihan, Higienis & Batch Terlacak, Renyah Maksimal, Pengiriman Segar dari Oven).
- **Wholesale / Reseller Teaser**: Banner ajakan kemitraan reseller dengan simulasi margin keuntungan hingga 40%.
- **Customer Reviews Carousel**: Ulasan nyata pecinta snack.
- **Newsletter & Footer**: Promo 10% belanja pertama.

### 2. About Us (`/about`)
- Kisah KRAVO: Berawal dari resep dapur rumahan hingga menjadi brand snack modern terkemuka.
- Filosofi Rasa & Standar Keamanan Pangan (Food Safety, Sertifikasi Halal, PIRT, Higienitas Batch).
- Tim di balik KRAVO dan komitmen keberlanjutan kemasan ramah lingkungan.

### 3. Product Catalog (`/products`)
- Breadcrumbs & Header pencarian/filter.
- Sidebar Filter: Kategori, Rentang Harga slider, Varian Rasa (Pedas, Keju, Truffle, BBQ, Manis), Status Stok.
- Sorting dropdown: Paling Populer, Terbaru, Harga Terendah, Harga Tertinggi, Rating Tertinggi.
- Grid Produk Responsif (4 kolom desktop, 2 kolom mobile).
- Pagination atau Infinite Scroll.

### 4. Product Categories (`/categories` & `/category/:slug`)
- Visual card setiap kategori snack dengan badge jumlah varian.
- Halaman spesifik per kategori dengan banner tematik.

### 5. Product Detail (`/products/:slug`)
- Gallery Gambar Multi-angle (Thumbnail selector & Zoom on hover).
- Title, SKU, Rating, Kategori.
- Harga Retail vs Info Harga Grosir (B2B sneak peek).
- Variant Selector: Pilihan Ukuran (Reguler 100g, Jumbo 250g, Party Box) & Rasa.
- Stock Status: Real-time availability.
- Quantity Counter dengan batasan stok.
- CTA: "Beli Sekarang", "Tambah ke Keranjang", "Wishlist".
- Tab Rinci: Deskripsi, Komposisi/Nutrisi (*Ingredients & Allergen Info*), Cara Penyimpanan, Ulasan Pelanggan Terverifikasi.

### 6. Search Product (`/search?q=...`)
- Live search query indicator ("Menampilkan hasil untuk: *Truffle*").
- Hasil pencarian dengan instant filter dan saran pencarian populer jika tidak ditemukan.

### 7. Shopping Cart (`/cart`)
- List item keranjang (Gambar, Nama, Varian, Harga Satuan, Quantity Counter, Subtotal per item, Delete button).
- Input Kupon Voucher Promo dengan validasi instant server.
- Order Summary Card: Subtotal, Potongan Voucher, Estimasi Berat Total (Gram), Estimasi Ongkir.
- Tombol "Lanjut ke Pembayaran" (Checkout).

### 8. Checkout (`/checkout`)
- Step Indicator: 1. Alamat Pengiriman -> 2. Kurir/Logistik -> 3. Pembayaran.
- Pilihan Alamat Tersimpan atau Tambah Alamat Baru.
- Pilihan Kurir Ekspedisi (JNE, SiCepat, GoSend/GrabExpress untuk instan).
- Catatan Pesanan untuk Gudang.
- Ringkasan Item Pesanan (Read-only summary).

### 9. Payment (`/payment/:orderNumber`)
- Timer Batas Waktu Pembayaran (Countdown 24 jam).
- Detail Tagihan dan Order Number.
- Tombol Terintegrasi "Bayar Sekarang" yang memicu popup Midtrans Snap Sandbox.
- Dukungan metode: BCA/Mandiri/BNI/BRI Virtual Account, QRIS, GoPay, Kartu Kredit.

### 10. Order Tracking (`/order-tracking` & `/order-tracking/:orderNumber`)
- Input Nomor Pesanan dan Email / No Telepon.
- Timeline Status Visual: *Menunggu Pembayaran -> Dikonfirmasi -> Diproses Gudang -> Dikirim (Nomor Resi) -> Selesai*.
- Detail kurir ekspedisi dan riwayat log perjalanan paket.

### 11. My Account (`/account`)
- Tab Navigasi: Profil Saya, Alamat Pengiriman, Keamanan Password.
- Edit Nama, Email, No WhatsApp.
- Tambah, Ubah, Hapus daftar alamat pengiriman multi-lokasi.

### 12. My Orders (`/account/orders`)
- Riwayat seluruh transaksi pesanan (Filter: Semua, Menunggu Pembayaran, Diproses, Dikirim, Selesai, Dibatalkan).
- Tombol Aksi: "Bayar Sekarang", "Lacak Pesanan", "Beri Ulasan", "Pesan Lagi".

### 13. Wishlist (`/account/wishlist`)
- Koleksi produk snack favorit yang disimpan.
- Quick action: "Pindah ke Keranjang" atau "Hapus".

### 14. Contact Us (`/contact`)
- Formulir Pesan & Customer Support (Nama, Email, Kategori Pertanyaan, Pesan).
- Info Kontak Kantor KRAVO, Email Support, WhatsApp Hotline, Jam Kerja.
- Google Maps lokasi kantor & warehouse utama.

### 15. Wholesale / Become a Reseller (`/wholesale`)
- Hero B2B: "Bermitra dengan KRAVO — Raih Margin Keuntungan hingga 40%".
- Penjelasan skema reseller & distributor resmi.
- Form Aplikasi Pendaftaran Reseller:
  - Data Usaha (Nama Toko/PT/CV, NIB/NPWP, Jenis Usaha).
  - Alamat Fisik / Link Toko Online (Shopee/Tokopedia/Instagram).
  - Upload Dokumen Identitas & Bisnis.
- Status Tracker jika user sudah mengajukan (Pending, Approved, Rejected).

---

## 4. STRUKTUR 16 MENU ADMIN DASHBOARD

Dashboard Admin KRAVO menggunakan layout sidebar fixed di sebelah kiri dengan header sticky di atas.

```
+----------------------------------------------------------------------------------------------------+
|  [KRAVO LOGO]  |  [Search anything...]                   [Notifications (3)] [Admin Profil (V)]    |
+----------------+-----------------------------------------------------------------------------------+
|  [NAVIGATION]  |  BREADCRUMB: Dashboard > Inventory > Product Batches                              |
|                |                                                                                   |
|  1. Dashboard  |  [METRIC CARDS ROW: Revenue | Orders | Active Customers | Low Stock Alert]       |
|  2. Products   |                                                                                   |
|  3. Categories |  [MAIN CONTENT AREA: Tables / Charts / Forms / Batch Log]                        |
|  4. Variants   |                                                                                   |
|  5. Inventory  |                                                                                   |
|  6. Batches    |                                                                                   |
|  7. Orders     |                                                                                   |
|  8. Payments   |                                                                                   |
|  9. Shipments  |                                                                                   |
| 10. Customers  |                                                                                   |
| 11. Resellers  |                                                                                   |
| 12. Wholesale  |                                                                                   |
| 13. Vouchers   |                                                                                   |
| 14. Reviews    |                                                                                   |
| 15. Reports    |                                                                                   |
| 16. Settings   |                                                                                   |
+----------------+-----------------------------------------------------------------------------------+
```

### Rincian 16 Menu Admin:
1. **Dashboard Overview (`/admin`)**:
   - 4 Card Metrik: Total Revenue (Rp), Total Orders, Total Customers, Reseller Terverifikasi.
   - Grafik Penjualan Bulanan (Sales Trends).
   - Best-selling Products (Top 5 snack terlaris).
   - Recent Orders Table dengan status badge.
   - Food Safety Warning Panel: Peringatan Stok Menipis & Batch Mendekati Kadaluarsa (< 60 hari).
2. **Products (`/admin/products`)**:
   - Master data produk: Tambah, Edit, Hapus, Filter Kategori, Status Aktif/Nonaktif.
3. **Categories (`/admin/categories`)**:
   - Manajemen kategori snack, icon, slug, dan urutan tampilan.
4. **Product Variants (`/admin/variants`)**:
   - Manajemen varian per produk (Rasa, Berat kemasan 100g/250g, SKU, Harga dasar).
5. **Inventory Overview (`/admin/inventory`)**:
   - Total stok per varian, alokasi stok terpesan, safety stock indicator.
6. **Product Batches (`/admin/batches`)**:
   - Food batch tracking: Nomor Batch, Tgl Manufaktur, Tgl Kedaluwarsa, Sisa Stok, Status (Active, Near Expiry, Quarantined/Expired). Tombol "Buat Batch Baru".
7. **Orders (`/admin/orders`)**:
   - Filter status: All, Pending, Paid, Processing, Shipped, Delivered, Cancelled.
   - Detail pesanan, invoice download, cetak label pengiriman.
8. **Payments (`/admin/payments`)**:
   - Riwayat transaksi Midtrans, Settlement ID, Payment Method, Signature Verification Status.
9. **Shipments (`/admin/shipments`)**:
   - Antrian pengemasan gudang, input nomor resi kurir, pembaruan status logistik.
10. **Customers (`/admin/customers`)**:
    - Direktori pelanggan retail B2C, total order, total pembelanjaan (*lifetime value*).
11. **Resellers (`/admin/resellers`)**:
    - Manajemen permohonan kemitraan B2B. Preview dokumen NIB/KTP, tombol "Approve" atau "Reject" dengan alasan.
12. **Wholesale Pricing (`/admin/wholesale-pricing`)**:
    - Konfigurasi tabel Tiering Harga Grosir & MOQ per varian produk.
13. **Vouchers (`/admin/vouchers`)**:
    - Pembuatan kupon promo: Kode voucher, diskon nominal/persentase, kuota penggunaan, periode aktif.
14. **Reviews (`/admin/reviews`)**:
    - Moderasi ulasan dan rating produk dari pembeli (Approve/Hide ulasan tidak pantas).
15. **Reports (`/admin/reports`)**:
    - Laporan Penjualan (Harian/Bulanan), Laporan Margin B2B vs B2C, Laporan Mutasi Stok Makanan (*FEFO Waste & Movement Report*).
16. **Settings (`/admin/settings`)**:
    - Pengaturan profil perusahaan KRAVO, kredensial Midtrans Sandbox, alamat gudang asal ekspedisi.

---

## 5. STRUKTUR ROUTING & LAYOUT ARCHITECTURE (REACT FRONTEND)

Aplikasi frontend React dirancang dengan arsitektur **Single Page Application (SPA)** yang terbagi menjadi dua layout utama:

```
src/
├── layouts/
│   ├── CustomerLayout.jsx    <-- Berisi Navbar Brand KRAVO, Announcement Bar, Floating Cart Drawer, Footer
│   └── AdminLayout.jsx       <-- Berisi Fixed Sidebar 16 Menu, Topbar Admin, Profile Dropdown, Alert Badge
```

### Routing Hierarchy:
```
/                      --> CustomerLayout --> HomePage
/about                 --> CustomerLayout --> AboutPage
/products              --> CustomerLayout --> CatalogPage
/products/:slug        --> CustomerLayout --> ProductDetailPage
/cart                  --> CustomerLayout --> CartPage
/checkout              --> CustomerLayout --> (Protected) CheckoutPage
/payment/:orderNumber  --> CustomerLayout --> (Protected) PaymentPendingPage
/order-tracking        --> CustomerLayout --> OrderTrackingPage
/wholesale             --> CustomerLayout --> WholesaleRegistrationPage
/wholesale/order       --> CustomerLayout --> (ResellerRoute) WholesaleOrderPage
/account/*             --> CustomerLayout --> (Protected) MyAccount, Orders, Wishlist

/admin                 --> AdminLayout    --> (AdminRoute) DashboardOverviewPage
/admin/products        --> AdminLayout    --> (AdminRoute) ProductsListPage
/admin/inventory       --> AdminLayout    --> (AdminRoute) InventoryPage
/admin/batches         --> AdminLayout    --> (AdminRoute) BatchesPage
/admin/orders          --> AdminLayout    --> (AdminRoute) OrdersListPage
/admin/resellers       --> AdminLayout    --> (AdminRoute) ResellersListPage
... (16 menu admin terproteksi role: admin)
```
