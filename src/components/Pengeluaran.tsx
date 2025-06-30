import React, { useState } from 'react';
import { Plus, DollarSign, Loader2, Eye } from 'lucide-react';
import $ from 'jquery';

interface PengeluaranItem {
  id: string;
  keterangan: string;
  nominal: number;
  created_at: string;
}

interface PengeluaranData {
  pengeluaran_tambahan: PengeluaranItem[];
  total_admin: number;
  total_ongkir: number;
  total_admin_rupiah: string;
  total_ongkir_rupiah: string;
}

interface PengeluaranProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const Pengeluaran: React.FC<PengeluaranProps> = ({ showNotification }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [pengeluaranData, setPengeluaranData] = useState<PengeluaranData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_pengeluaran: '',
    nominal: '',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear()
  });

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

  const fetchPengeluaran = () => {
    setLoading(true);
    
    const formDataRequest = new FormData();
    formDataRequest.append('bulan', selectedMonth.toString());
    formDataRequest.append('tahun', selectedYear.toString());
    
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/pengeluaran',
      method: 'POST',
      data: formDataRequest,
      processData: false,
      contentType: false,
      crossDomain: true,
      dataType: 'json',
      xhrFields: {
        withCredentials: false
      },
      success: (response) => {
        setPengeluaranData(response.data);
        showNotification('Data pengeluaran berhasil dimuat');
      },
      error: (xhr, status, error) => {
        console.error('Error fetching pengeluaran:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal memuat data pengeluaran';
        
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nama_pengeluaran.trim() || !formData.nominal) {
      showNotification('Semua field harus diisi', 'error');
      return;
    }

    const nominal = parseInt(formData.nominal);
    if (isNaN(nominal) || nominal <= 0) {
      showNotification('Jumlah harus berupa angka yang valid', 'error');
      return;
    }

    setSaving(true);
    
    const formDataRequest = new FormData();
    formDataRequest.append('keterangan', formData.nama_pengeluaran);
    formDataRequest.append('nominal', nominal.toString());
    formDataRequest.append('bulan', formData.bulan.toString());
    formDataRequest.append('tahun', formData.tahun.toString());
    
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/tambahPengeluaran',
      method: 'POST',
      data: formDataRequest,
      processData: false,
      contentType: false,
      crossDomain: true,
      xhrFields: {
        withCredentials: false
      },
      success: (response) => {
        showNotification('Pengeluaran berhasil ditambahkan');
        setFormData({
          nama_pengeluaran: '',
          nominal: '',
          bulan: new Date().getMonth() + 1,
          tahun: new Date().getFullYear()
        });
        setShowForm(false);
        
        // Refresh data if viewing the same month/year
        if (selectedMonth === formData.bulan && selectedYear === formData.tahun) {
          fetchPengeluaran();
        }
      },
      error: (xhr, status, error) => {
        console.error('Error adding pengeluaran:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal menambahkan pengeluaran';
        
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
        setSaving(false);
      }
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  // Fix calculation by ensuring all values are properly converted to integers
  const totalPengeluaranTambahan = pengeluaranData?.pengeluaran_tambahan.reduce((sum, item) => {
    const nominal = typeof item.nominal === 'string' ? parseInt(item.nominal) : item.nominal;
    return sum + (isNaN(nominal) ? 0 : nominal);
  }, 0) || 0;
  
  const totalAdmin = pengeluaranData?.total_admin || 0;
  const totalOngkir = pengeluaranData?.total_ongkir || 0;
  const totalSemuaPengeluaran = totalPengeluaranTambahan + totalAdmin + totalOngkir;
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <DollarSign className="mr-2" size={20} />
          Pengeluaran
        </h1>
        
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={fetchPengeluaran}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Memuat...
              </>
            ) : (
              <>
                <Eye className="mr-2" size={16} />
                Tampilkan
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            Tambah
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Tambah Pengeluaran</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nama Pengeluaran</label>
              <input
                type="text"
                value={formData.nama_pengeluaran}
                onChange={(e) => setFormData({...formData, nama_pengeluaran: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Masukkan nama pengeluaran"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Jumlah</label>
              <input
                type="number"
                value={formData.nominal}
                onChange={(e) => setFormData({...formData, nominal: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Masukkan jumlah"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Bulan</label>
                <select
                  value={formData.bulan}
                  onChange={(e) => setFormData({...formData, bulan: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tahun</label>
                <select
                  value={formData.tahun}
                  onChange={(e) => setFormData({...formData, tahun: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {pengeluaranData && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Admin and Ongkir Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <h3 className="font-semibold text-purple-800 dark:text-purple-300 text-sm">Total Admin</h3>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{pengeluaranData.total_admin_rupiah}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-indigo-500">
                <h3 className="font-semibold text-indigo-800 dark:text-indigo-300 text-sm">Total Ongkir</h3>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{pengeluaranData.total_ongkir_rupiah}</p>
              </div>
            </div>

            {/* Pengeluaran Tambahan */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
              <h3 className="font-semibold text-orange-800 dark:text-orange-300">Pengeluaran Tambahan</h3>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(totalPengeluaranTambahan)}</p>
            </div>

            {/* Total Semua Pengeluaran */}
            <div className="bg-gradient-to-r from-red-500 to-pink-600 rounded-lg shadow-sm p-4 text-white">
              <h3 className="font-semibold text-lg">Total Semua Pengeluaran</h3>
              <p className="text-2xl font-bold">{formatCurrency(totalSemuaPengeluaran)}</p>
              <p className="text-sm opacity-90 mt-1">Admin + Ongkir + Pengeluaran Tambahan</p>
            </div>
          </div>

          {/* Pengeluaran Tambahan List */}
          {pengeluaranData.pengeluaran_tambahan.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Detail Pengeluaran Tambahan</h3>
              {pengeluaranData.pengeluaran_tambahan.map((item) => (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 dark:text-white">{item.keterangan}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.created_at}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        {formatCurrency(typeof item.nominal === 'string' ? parseInt(item.nominal) : item.nominal)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!pengeluaranData && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Pilih periode untuk melihat data pengeluaran</p>
        </div>
      )}
    </div>
  );
};

export default Pengeluaran;