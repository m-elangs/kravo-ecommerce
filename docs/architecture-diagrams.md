# KRAVO — Architecture & Sequence Diagrams (Tahap 1)

Koleksi diagram arsitektur dan alur sekuensial sistem KRAVO E-Commerce.

---

## 1. Sequence Diagram: B2C Customer Purchase & Midtrans Webhook

```mermaid
sequenceDiagram
    autonumber
    actor Customer as B2C Customer
    participant Frontend as React Customer UI
    participant Backend as Laravel REST API
    participant Inventory as FEFO Inventory Service
    participant DB as MySQL (InnoDB)
    participant Midtrans as Midtrans Snap Engine

    Customer->>Frontend: Klik "Checkout" (Kirim variant_id, qty, address_id)
    Frontend->>Backend: POST /api/v1/checkout
    activate Backend
    
    Backend->>DB: DB::beginTransaction()
    Backend->>Inventory: Validasi stok aktif & FEFO allocation
    activate Inventory
    Inventory->>DB: SELECT * FROM product_batches WHERE expiry_date > NOW() + 30 FOR UPDATE
    DB-->>Inventory: Batch data terkunci
    Inventory-->>Backend: Batch kuantitas tervalidasi
    deactivate Inventory

    Backend->>Backend: Hitung Subtotal server-side (Anti-tampering)
    Backend->>DB: INSERT INTO orders & order_items (Freeze price snapshot)
    Backend->>DB: Kurangi batch stock & catat stock_movements
    
    Backend->>Midtrans: Request Snap Token (order_number, gross_amount, customer_details)
    Midtrans-->>Backend: Return Snap Token & Redirect URL
    Backend->>DB: INSERT INTO payments (status: pending, snap_token)
    Backend->>DB: DB::commit()
    
    Backend-->>Frontend: 201 Created (order_number, snap_token)
    deactivate Backend

    Frontend->>Customer: Munculkan Midtrans Snap Popup Window
    Customer->>Midtrans: Selesaikan pembayaran (e.g. Bank VA / GoPay Sandbox)
    
    Midtrans->>Backend: POST /api/v1/payments/midtrans-webhook (payload & signature)
    activate Backend
    Backend->>Backend: Hitung SHA512(order_id + status_code + gross_amount + ServerKey)
    alt Signature Valid & transaction_status == 'settlement' / 'capture'
        Backend->>DB: UPDATE payments SET status='success'
        Backend->>DB: UPDATE orders SET status='processing'
        Backend-->>Midtrans: 200 OK
    else Signature Invalid
        Backend-->>Midtrans: 403 Forbidden (Tamper Attempt Rejected)
    end
    deactivate Backend

    Frontend->>Backend: GET /api/v1/orders/{orderNumber}
    Backend-->>Frontend: Status: "processing" (Siap dipacking oleh gudang)
    Frontend->>Customer: Tampilkan Halaman Order Success & Live Tracking
```

---

## 2. Sequence Diagram: B2B Reseller Registration, Verification & Wholesale Order

```mermaid
sequenceDiagram
    autonumber
    actor Reseller as Calon Reseller / Distributor
    participant Frontend as React Storefront UI
    participant Backend as Laravel REST API
    participant Storage as File Storage (Storage::disk)
    participant Admin as KRAVO Admin Dashboard
    participant DB as MySQL Database

    Reseller->>Frontend: Isi Form Pendaftaran B2B (Perusahaan, NIB/NPWP, Upload KTP/Dokumen)
    Frontend->>Backend: POST /api/v1/reseller/register (Multipart Form Data)
    activate Backend
    Backend->>Backend: Validasi format MIME & ukuran dokumen (Max 5MB)
    Backend->>Storage: Simpan file terenkripsi di private storage
    Backend->>DB: INSERT INTO reseller_profiles (status: 'pending')
    Backend-->>Frontend: 201 Created ("Pendaftaran berhasil, menunggu verifikasi Admin")
    deactivate Backend
    
    Note over Reseller, Frontend: Selama status 'pending', user hanya melihat harga retail biasa.

    Admin->>Backend: GET /api/v1/admin/resellers?status=pending
    Backend-->>Admin: Daftar calon reseller beserta preview dokumen
    Admin->>Backend: PUT /api/v1/admin/resellers/{id}/verify (action: 'approve')
    activate Backend
    Backend->>DB: UPDATE reseller_profiles SET status='approved'
    Backend->>DB: Assign Role 'reseller'
    Backend-->>Admin: 200 OK
    deactivate Backend

    Reseller->>Frontend: Login kembali / Refresh Session
    Frontend->>Backend: GET /api/v1/wholesale/products
    activate Backend
    Backend->>Backend: Deteksi status 'approved'
    Backend->>DB: Query products JOIN price_tiers & variants
    Backend-->>Frontend: Katalog dengan Harga Grosir & Tiering Matrix
    deactivate Backend

    Reseller->>Frontend: Pilih 200 pcs (Memenuhi MOQ >= 50 pcs)
    Frontend->>Backend: POST /api/v1/wholesale/checkout
    activate Backend
    Backend->>Backend: Server validasi MOQ & cari tier unit_price (Tier: 200-499 pcs)
    Backend->>DB: Buat Order B2B & generate Invoice Proforma
    Backend-->>Frontend: 201 Created (Order B2B terbit dengan Proforma Invoice)
    deactivate Backend
```

---

## 3. Sequence Diagram: FEFO (First Expired, First Out) Inventory Allocation

```mermaid
sequenceDiagram
    autonumber
    actor OrderService as Order Checkout Engine
    participant FEFO as InventoryFefoService
    participant DB as MySQL Database
    
    OrderService->>FEFO: allocateStock(variantId: 12, requiredQty: 80)
    activate FEFO
    
    FEFO->>DB: SELECT * FROM product_batches WHERE product_variant_id = 12 AND status = 'active' AND expiry_date > DATE_ADD(NOW(), INTERVAL 30 DAY) ORDER BY expiry_date ASC FOR UPDATE
    DB-->>FEFO: List Batches (Batch #B1: Exp 2026-12-10, Qty: 50; Batch #B2: Exp 2027-02-15, Qty: 100)
    
    Note over FEFO: Batch #B1 paling cepat kadaluarsa: Ambil seluruh 50 unit. Sisa: 30 unit.<br/>Batch #B2 kadaluarsa kedua: Ambil 30 unit.
    
    FEFO->>DB: UPDATE product_batches SET current_stock = 0 WHERE id = #B1
    FEFO->>DB: INSERT INTO stock_movements (batch_id: #B1, qty: -50, type: 'allocated', reference: 'Order#1001')
    
    FEFO->>DB: UPDATE product_batches SET current_stock = (100 - 30) = 70 WHERE id = #B2
    FEFO->>DB: INSERT INTO stock_movements (batch_id: #B2, qty: -30, type: 'allocated', reference: 'Order#1001')
    
    FEFO->>DB: UPDATE inventories SET total_stock = total_stock - 80 WHERE product_variant_id = 12
    
    FEFO-->>OrderService: Allocation Success (Batches: #B1[50], #B2[30])
    deactivate FEFO
```
