import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiAuth } from '../../api/axios.js';
import { Loader2, CheckCircle, XCircle, DollarSign, Package, User, MapPin, Image, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';

const API_ENDPOINT = '/admin/orders';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiAuth.get(`${API_ENDPOINT}/${id}`);
      setOrder(res.data.data);
    } catch (err) {
      setError('Gagal memuat detail pesanan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [id]);

  const handleVerification = async (action) => {
    if (!order || !order.payment) return;
    if (action === 'reject' && !rejectReason.trim()) {
      toast.error('Alasan penolakan wajib diisi.');
      return;
    }
    setIsProcessing(true);
    try {
      await apiAuth.post(`${API_ENDPOINT}/${order.id}/${action}`, action === 'reject' ? { reason: rejectReason.trim() } : {});
      toast.success(action === 'approve' ? 'Pembayaran disetujui.' : 'Pembayaran ditolak.');
      fetchOrder();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memproses.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) return <div className="p-8 flex justify-center items-center h-64"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!order) return null;

  const isAwaitingVerification = order.payment?.status === 'pending' && !!order.payment?.payment_proof_url;
  const isPaymentApproved = order.payment?.status === 'paid';

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow-xl rounded-xl">
      <Link to="/admin/orders?payment_status=pending" className="text-blue-600 hover:underline flex items-center mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Daftar Pesanan
      </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Detail Pesanan #{order.order_code}</h1>

      {isAwaitingVerification && (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-yellow-800 flex items-center gap-2 mb-3">
            <DollarSign className="w-6 h-6" /> Menunggu Verifikasi Pembayaran
          </h2>

          <div className="mt-4 border p-4 bg-white rounded-md">
            <p className="font-medium flex items-center gap-1 text-gray-700 mb-2">
              <Image className="w-5 h-5" /> Bukti Pembayaran Diunggah:
            </p>
            <a href={order.payment.payment_proof_url} target="_blank" rel="noopener noreferrer">
              <img
                src={order.payment.payment_proof_url}
                alt="Bukti Pembayaran"
                className="w-full max-w-xs h-auto rounded-lg shadow-lg cursor-pointer transition-transform hover:scale-[1.02] border"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/300x200/cccccc/333333?text=Tidak+Ada+Gambar';
                }}
              />
            </a>
            <p className="text-xs text-gray-500 mt-2">Klik gambar untuk melihat ukuran penuh.</p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => handleVerification('approve')}
              disabled={isProcessing}
              className="flex items-center px-5 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
              {isProcessing ? 'Memproses...' : 'Setujui Pembayaran'}
            </button>

            <button
              onClick={() => handleVerification('reject')}
              disabled={isProcessing}
              className="flex items-center px-5 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <XCircle className="w-5 h-5 mr-2" />}
              {isProcessing ? 'Memproses...' : 'Tolak Pembayaran'}
            </button>
          </div>

          <div className="mt-4 w-full md:w-1/2">
            <label className="block text-sm font-medium text-gray-700">Alasan Penolakan (wajib saat menolak)</label>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Masukkan alasan penolakan..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2.5 focus:border-red-500 focus:ring-red-500"
            />
          </div>
        </div>
      )}

      <div className={`p-4 mb-6 rounded-lg text-white font-semibold shadow-md ${isPaymentApproved ? 'bg-green-500' : 'bg-gray-500'}`}>
        Status Pembayaran: {order.payment?.status?.toUpperCase() || 'N/A'}
        {isPaymentApproved && order.payment?.confirmed_at && (
          <span className="ml-2 text-xs">(Disetujui pada: {new Date(order.payment.confirmed_at).toLocaleString('id-ID')})</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> Ringkasan Pesanan
          </h2>
          <div className="space-y-3">
            <p><strong>Kode Order:</strong> {order.order_code}</p>
            <p><strong>Tanggal Order:</strong> {new Date(order.created_at).toLocaleString('id-ID')}</p>
            <p><strong>Status Order:</strong> <span className="font-bold text-lg text-indigo-600">{order.status?.toUpperCase()}</span></p>
            <p><strong>Metode Bayar:</strong> {order.payment?.method || 'N/A'}</p>
            <p><strong>Total Pembayaran:</strong> <span className="font-bold text-green-600">{formatRupiah(order.final_amount ?? order.total_amount)}</span></p>
          </div>

          <h2 className="text-xl font-bold mt-6 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" /> Detail Pelanggan
          </h2>
          <p><strong>Nama:</strong> {order.user?.name}</p>
          <p><strong>Email:</strong> {order.user?.email}</p>
          <p><strong>Telepon:</strong> {order.address?.phone_number || 'N/A'}</p>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" /> Alamat Pengiriman
          </h2>
          <div className="bg-gray-100 p-4 rounded-md text-sm">
            <p className="font-semibold">{order.address?.recipient_name || 'N/A'}</p>
            <p>{order.address?.address_line || 'Alamat tidak tersedia'}</p>
            <p>{order.address?.city}{order.address?.province ? `, ${order.address?.province}` : ''}</p>
            <p>{order.address?.postal_code}</p>
          </div>

          <h2 className="text-xl font-bold mt-6 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" /> Item Pesanan
          </h2>
          <div className="space-y-2">
            {order.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center border-b pb-2 text-sm">
                <span className="font-medium">{item.book?.title}</span>
                <span>{item.quantity} x {formatRupiah(item.price)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
