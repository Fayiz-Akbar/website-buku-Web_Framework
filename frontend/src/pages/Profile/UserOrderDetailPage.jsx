import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiAuth } from '../../api/axios'; // Pastikan path import benar
import { Loader2, ArrowLeft, Package, User, MapPin, CreditCard, AlertCircle, ShoppingBag } from 'lucide-react';

// Fungsi untuk status badge (sama seperti di list)
const getStatusBadge = (status) => {
  switch (status) {
    case 'menunggu_validasi':
      return <span className="px-3 py-1 text-sm font-medium text-yellow-800 bg-yellow-100 rounded-full">Menunggu Validasi</span>;
    case 'diproses':
      return <span className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full">Diproses</span>;
    case 'dikirim':
      return <span className="px-3 py-1 text-sm font-medium text-green-800 bg-green-100 rounded-full">Dikirim</span>;
    case 'selesai':
      return <span className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">Selesai</span>;
    case 'dibatalkan':
      return <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full">Dibatalkan</span>;
    default:
      return <span className="px-3 py-1 text-sm font-medium text-gray-800 bg-gray-100 rounded-full">{status || 'Tidak Diketahui'}</span>;
  }
};

const API_ORIGIN = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const resolveAssetUrl = (u) => {
  if (!u) return '';
  // Biarkan URL absolut/data/blob apa adanya
  if (/^(https?:|data:|blob:)/i.test(String(u))) return String(u);
  const base = API_ORIGIN.replace(/\/+$/, '');
  let path = (`/${String(u)}`).replace(/\/+/g, '/').replace(/^\/public\//, '/');
  if (!path.startsWith('/storage/')) {
    path = `/storage/${path.replace(/^\/?/, '')}`;
  }
  return `${base}${path}`;
};

const formatRupiah = (n) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 })
    .format(Number(n || 0));

const firstNonEmpty = (...vals) => vals.find(v => v !== undefined && v !== null && v !== '');

export default function UserOrderDetailPage() {
    const { id } = useParams(); // Ambil ID dari URL
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            setLoading(true);
            setError(null);
            if (!id) { // Tambah pengecekan ID
                setError("ID Pesanan tidak valid.");
                setLoading(false);
                return;
            }
            try {
                // Panggil API detail dengan ID
                const response = await apiAuth.get(`/my-orders/${id}`);
                setOrder(response.data.data);
            } catch (err) {
                console.error("Gagal mengambil detail pesanan:", err);
                if (err.response?.status === 404) {
                    setError("Pesanan tidak ditemukan.");
                } else if (err.response?.status === 403) {
                     setError("Anda tidak diizinkan melihat pesanan ini.");
                } else {
                    setError("Gagal memuat detail pesanan.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]); // Jalankan ulang jika ID berubah

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
                <span className="ml-3 text-gray-600">Memuat detail pesanan...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto my-10 p-6 bg-red-50 border-l-4 border-red-500 text-red-800 rounded-lg shadow">
                 <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-6 h-6" />
                    <h2 className="text-xl font-bold">Error</h2>
                 </div>
                <p>{error}</p>
                <Link to="/profile/orders" className="text-blue-600 hover:underline mt-4 inline-block flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Kembali ke Riwayat Pesanan
                </Link>
            </div>
        );
    }

    if (!order) return null; // Seharusnya tidak terjadi jika error handling benar

    // Destructure untuk kemudahan
    const { address, payment } = order;
    const orderItemsRaw = Array.isArray(order?.items)
      ? order.items
      : (Array.isArray(order?.order_items) ? order.order_items : []);

    const proofUrl = resolveAssetUrl(
      order?.payment?.payment_proof_url ??
      order?.payment?.proof_url ??
      order?.payment?.proof ??
      order?.payment?.proof_path
    );

    // Normalisasi item pesanan agar judul, harga, dan cover konsisten
    const normalizedItems = orderItemsRaw.map(i => {
      const qty = Number(i.quantity ?? i.qty ?? 0);
      const unit = Number(
        i.unit_price ??
        i.snapshot_price_per_item ??
        i.price ??
        i.selling_price ??
        i.book?.price ??
        i.book?.selling_price ??
        0
      );
      const title = firstNonEmpty(i.title, i.book_title, i.snapshot_book_title, i.book?.title, '-') || '-';

      const coverCandidate = firstNonEmpty(
        i.snapshot_cover_url,
        i.snapshot_book_cover_url,
        i.snapshot_cover_path,
        i.cover_url,
        i.cover_path,
        i.book_cover_url,
        i.book_cover,
        i.book?.cover_url,
        i.book?.cover_image_url,
        i.book?.image_url,
        i.book?.cover_path,
        i.book?.image_path,
        i.book?.cover
      );
      const coverUrl = resolveAssetUrl(coverCandidate);

      return { id: i.id ?? `${title}-${Math.random()}`, title, qty, unit, coverUrl };
    });

    // Nilai pembayaran & ringkasan dari berbagai kemungkinan field backend
    const subtotalItems = Number(firstNonEmpty(
      order.total_items_price,
      order.items_total_price,
      order.items_total,
      order.subtotal,
      order.total_products_price,
      normalizedItems.reduce((s, it) => s + (Number(it.unit) * Number(it.qty)), 0)
    ) || 0);

    const shippingCost = Number(firstNonEmpty(
      order.shipping_cost,
      order.shipping_fee,
      order.shipping_price,
      payment?.shipping_cost,
      0
    ) || 0);

    const discountAmount = Number(firstNonEmpty(
      order.discount_amount,
      order.discount,
      order.voucher_discount,
      0
    ) || 0);

    const finalAmount = Number(firstNonEmpty(
      order.final_amount,
      order.total_amount,
      order.total,
      subtotalItems + shippingCost - discountAmount
    ) || 0);

    const totalTagihan = Number(firstNonEmpty(
      payment?.amount_due,
      payment?.bill_amount,
      finalAmount
    ) || 0);

    const jumlahDibayar = Number(firstNonEmpty(
      payment?.amount_paid,
      payment?.paid_amount,
      payment?.amount,
      payment?.total_paid,
      0
    ) || 0);

    return (
        <div className="max-w-4xl mx-auto py-10 px-4">
            <Link to="/profile/orders" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 text-sm font-medium">
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Riwayat Pesanan
            </Link>

            <div className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
                {/* Header Pesanan */}
                <div className="p-6 border-b bg-gray-50 flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Detail Pesanan</h1>
                        <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-700">{order.order_code || '-'}</span></p>
                        <p className="text-sm text-gray-500">Tanggal: <span className="font-medium text-gray-700">{order.created_at ? new Date(order.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short'}) : '-'}</span></p>
                    </div>
                    <div className="flex-shrink-0 mt-2 sm:mt-0">
                        {getStatusBadge(order.status)}
                    </div>
                </div>

                {/* Notifikasi Status */}
                {order.status === 'menunggu_validasi' && (
                    <div className="p-4 m-6 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-yellow-800">Menunggu Validasi</h4>
                            <p className="text-sm text-yellow-700">Pembayaran Anda telah diterima dan sedang menunggu konfirmasi oleh admin. Proses ini biasanya memerlukan waktu 1x24 jam hari kerja.</p>
                        </div>
                    </div>
                )}
                 {order.status === 'dibatalkan' && payment?.admin_notes && (
                    <div className="p-4 m-6 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 shadow-sm">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-red-800">Pesanan Dibatalkan</h4>
                            <p className="text-sm text-red-700">Alasan: {payment.admin_notes}</p>
                        </div>
                    </div>
                )}

                {/* Grid Detail */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Detail Alamat */}
                    <div className="space-y-3">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2 mb-3"><MapPin className="w-5 h-5 text-blue-600"/>Alamat Pengiriman</h3>
                        {address ? (
                            <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p className="font-bold text-gray-900">{address.recipient_name} ({address.address_label || 'Label Alamat'})</p>
                                <p>{address.phone_number || '-'}</p>
                                <p>{address.address_line || '-'}</p>
                                <p>{address.city || '-'}, {address.province || '-'} {address.postal_code || '-'}</p>
                            </div>
                        ) : <p className="text-sm text-gray-500 italic">Data alamat tidak tersedia.</p>}
                    </div>

                    {/* Detail Pembayaran */}
                    <div className="space-y-3">
                         <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 border-b pb-2 mb-3"><CreditCard className="w-5 h-5 text-green-600"/>Detail Pembayaran</h3>
                         {payment ? (
                            <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <p>Metode: <span className="font-medium text-gray-900">{payment.method === 'qris_manual' ? 'QRIS (Manual)' : (payment.method || '-')}</span></p>
                                <p>Status: <span className="font-medium text-gray-900">{payment.status || '-'}</span></p>
                                <p>Total Tagihan: <span className="font-medium text-gray-900">{formatRupiah(totalTagihan)}</span></p>
                                {proofUrl ? (
                                  <div className="mt-3">
                                      <p className="font-medium text-gray-900 mb-1">Bukti Pembayaran:</p>
                                      <a href={proofUrl} target="_blank" rel="noreferrer" className="inline-block border rounded hover:opacity-80 transition">
                                          <img src={proofUrl} alt="Bukti pembayaran" className="max-h-64 rounded border" />
                                      </a>
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">Belum ada bukti pembayaran.</p>
                                )}
                            </div>
                         ) : <p className="text-sm text-gray-500 italic">Data pembayaran tidak tersedia.</p>}
                    </div>
                </div>

                {/* Detail Item */}
                <div className="p-6 border-t mt-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-gray-600"/>Item yang Dipesan ({normalizedItems.length})</h3>
                    <div className="space-y-4">
                        {normalizedItems.length > 0 ? normalizedItems.map(item => (
                             <div key={item.id} className="flex gap-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                                 <img
                                    src={item.coverUrl || `https://placehold.co/80x120/e2e8f0/64748b?text=${String(item.title || 'Buku').substring(0,10)}`}
                                    alt={item.title || 'Buku'}
                                     className="w-16 h-24 object-cover rounded flex-shrink-0 bg-gray-100" // Tambah bg
                                    onError={(e) => { e.currentTarget.src = `https://placehold.co/80x120/e2e8f0/64748b?text=No+Cover`; }} // Fallback
                                />
                                <div className="flex-1 min-w-0"> {/* Tambah min-w-0 */}
                                    <p className="font-semibold text-gray-900 leading-tight truncate">{item.title || '-'}</p> {/* Tambah truncate */}
                                    <p className="text-sm text-gray-500">Jumlah: {item.qty || '-'}</p>
                                    <p className="text-sm text-gray-500">Harga Satuan: {formatRupiah(item.unit)}</p>
                                 </div>
                                 <div className="text-right flex-shrink-0 ml-2"> {/* Tambah ml-2 */}
                                    <p className="font-semibold text-gray-900">{formatRupiah(Number(item.unit) * Number(item.qty))}</p>
                                 </div>
                             </div>
                         )) : (
                              <p className="text-sm text-gray-500 italic">Tidak ada item dalam pesanan ini.</p>
                         )}
                     </div>
                 </div>

                {/* Ringkasan Total */}
                <div className="p-6 bg-gray-50 border-t flex justify-end mt-2">
                     <div className="w-full max-w-sm space-y-2">
                         <div className="flex justify-between text-sm text-gray-600">
                            <span>Subtotal ({normalizedItems.length} item)</span>
                             <span className="font-medium">{formatRupiah(subtotalItems)}</span>
                         </div>
                         <div className="flex justify-between text-sm text-gray-600">
                             <span>Ongkos Kirim</span>
                             <span className="font-medium">{formatRupiah(shippingCost)}</span>
                         </div>
                         {discountAmount > 0 && (
                             <div className="flex justify-between text-sm text-green-600">
                                 <span>Diskon</span>
                                 <span className="font-medium">-{formatRupiah(discountAmount)}</span>
                             </div>
                         )}
                         <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t mt-2">
                             <span>Total Pesanan</span>
                             <span>{formatRupiah(finalAmount)}</span>
                         </div>
                     </div>
                 </div>
            </div>
        </div>
    );
}