import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { apiAuth } from '../../api/axios.js';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const API_ENDPOINT = '/admin/orders';

export default function OrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const paymentStatusFilter = searchParams.get('payment_status') || 'pending';

  const formatRupiah = (n) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

  const fetchOrders = async (status) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiAuth.get(API_ENDPOINT, { params: { payment_status: status } });
      setOrders(res.data.data || []);
    } catch (err) {
      setError('Gagal mengambil data pesanan. Pastikan token Admin valid.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(paymentStatusFilter);
  }, [paymentStatusFilter]);

  if (loading) return <div className="p-6 text-center"><Loader2 className="w-8 h-8 animate-spin inline-block text-blue-600" /></div>;
  if (error) return <div className="p-4 text-red-600 bg-red-50 rounded-lg border border-red-200">{error}</div>;

  const isPendingFilter = paymentStatusFilter === 'pending';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-800">Manajemen Pesanan</h1>
        <div className="flex gap-2">
          {['pending','success','failed'].map(s => (
            <button
              key={s}
              onClick={() => setSearchParams({ payment_status: s })}
              className={`px-3 py-1.5 rounded-md text-sm font-medium ${paymentStatusFilter===s ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-slate-50">
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3">Kode</th>
                <th className="px-6 py-3">Pelanggan</th>
                <th className="px-6 py-3">Total</th>
                {isPendingFilter && <th className="px-6 py-3">Bukti Bayar</th>}
                <th className="px-6 py-3">Status Order</th>
                <th className="px-6 py-3">Status Bayar</th>
                <th className="px-6 py-3">Tanggal</th>
                <th className="px-6 py-3">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.length ? orders.map(order => (
                <tr key={order.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3 font-mono text-sm">{order.order_code}</td>
                  <td className="px-6 py-3 text-sm">{order.user?.name || 'N/A'}</td>
                  <td className="px-6 py-3 text-sm font-semibold">{formatRupiah(order.final_amount ?? order.total_amount)}</td>
                  {isPendingFilter && (
                    <td className="px-6 py-3 text-sm">
                      {order.payment?.payment_proof_url ? (
                        <span className="text-green-600 inline-flex items-center gap-1"><CheckCircle className="w-4 h-4" />Diunggah</span>
                      ) : (
                        <span className="text-red-600 inline-flex items-center gap-1"><XCircle className="w-4 h-4" />Belum</span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-3 text-sm">{order.status}</td>
                  <td className="px-6 py-3 text-sm">{order.payment?.status || 'N/A'}</td>
                  <td className="px-6 py-3 text-sm">{new Date(order.created_at).toLocaleString('id-ID')}</td>
                  <td className="px-6 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700">
                      Detail
                    </Link>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={isPendingFilter ? 8 : 7} className="px-6 py-10 text-center text-slate-500">Tidak ada pesanan.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
