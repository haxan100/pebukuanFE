import React, { useState } from 'react';
import { Search, Edit3, Check, X, Loader2 } from 'lucide-react';
import $ from 'jquery';

interface TransaksiItem {
  id: string;
  nama_hp: string;
  harga_beli: number;
  harga_jual?: number;
}

interface ListTransaksiProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const ListTransaksi: React.FC<ListTransaksiProps> = ({ showNotification }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [transaksiList, setTransaksiList] = useState<TransaksiItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const fetchTransaksi = () => {
    setLoading(true);
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/transaksi',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        bulan: selectedMonth,
        tahun: selectedYear
      }),
      crossDomain: true,
      xhrFields: {
        withCredentials: false
      },
      success: (response) => {
        setTransaksiList(response.data || []);
        showNotification('Data transaksi berhasil dimuat');
      },
      error: (xhr, status, error) => {
        console.error('Error fetching transaksi:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal memuat data transaksi';
        
        if (xhr.status === 0) {
          errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
        } else if (xhr.status === 404) {
          errorMessage = 'Endpoint API tidak ditemukan.';
        } else if (xhr.status === 500) {
          errorMessage = 'Terjadi kesalahan pada server.';
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        }
        
        showNotification(errorMessage, 'error');
      },
      complete: () => {
        setLoading(false);
      }
    });
  };

  const handleEdit = (item: TransaksiItem) => {
    setEditingId(item.id);
    setEditValue(item.harga_jual?.toString() || '');
  };

  const handleSave = (id: string) => {
    const hargaJual = parseInt(editValue);
    if (isNaN(hargaJual) || hargaJual <= 0) {
      showNotification('Harga jual harus berupa angka yang valid', 'error');
      return;
    }

    setUpdating(id);
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/jual',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        id: id,
        harga_jual: hargaJual
      }),
      crossDomain: true,
      xhrFields: {
        withCredentials: false
      },
      success: (response) => {
        setTransaksiList(prev => 
          prev.map(item => 
            item.id === id ? { ...item, harga_jual: hargaJual } : item
          )
        );
        setEditingId(null);
        setEditValue('');
        showNotification('Harga jual berhasil diupdate');
      },
      error: (xhr, status, error) => {
        console.error('Error updating harga jual:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal mengupdate harga jual';
        
        if (xhr.status === 0) {
          errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet.';
        } else if (xhr.status === 404) {
          errorMessage = 'Endpoint API tidak ditemukan.';
        } else if (xhr.status === 500) {
          errorMessage = 'Terjadi kesalahan pada server.';
        } else if (xhr.responseJSON && xhr.responseJSON.message) {
          errorMessage = xhr.responseJSON.message;
        }
        
        showNotification(errorMessage, 'error');
      },
      complete: () => {
        setUpdating(null);
      }
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValue('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <Search className="mr-2" size={20} />
          List Transaksi
        </h1>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <button
          onClick={fetchTransaksi}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Memuat...
            </>
          ) : (
            'Tampilkan'
          )}
        </button>
      </div>

      {transaksiList.length > 0 && (
        <div className="space-y-3">
          {transaksiList.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.nama_hp}</h3>
                  <p className="text-sm text-gray-600">Harga Beli: {formatCurrency(item.harga_beli)}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  {editingId === item.id ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        placeholder="Harga jual"
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <button
                        onClick={() => handleSave(item.id)}
                        disabled={updating === item.id}
                        className="p-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                      >
                        {updating === item.id ? (
                          <Loader2 className="animate-spin" size={16} />
                        ) : (
                          <Check size={16} />
                        )}
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Harga Jual: {item.harga_jual ? formatCurrency(item.harga_jual) : 'Belum diisi'}
                      </span>
                      <button
                        onClick={() => handleEdit(item)}
                        className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <Edit3 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {item.harga_jual && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-green-600">
                    Keuntungan: {formatCurrency(item.harga_jual - item.harga_beli)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {transaksiList.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Tidak ada data transaksi untuk periode yang dipilih</p>
        </div>
      )}
    </div>
  );
};

export default ListTransaksi;