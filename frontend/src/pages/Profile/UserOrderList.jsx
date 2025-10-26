import React from 'react';

export default function UserOrderList() {
    return (
        <div className="space-y-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Riwayat Pesanan Anda</h3>
            <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 rounded-lg">
                <p className="font-semibold">Fitur Riwayat Pesanan:</p>
                <p className="text-sm">Di sini akan ditampilkan daftar semua pesanan yang pernah Anda lakukan.</p>
            </div>
            
            <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed">
                <p className="text-gray-500">Belum ada riwayat pesanan.</p>
            </div>
        </div>
    );
}
