import React, { useState } from 'react';
import { Plus, DollarSign, Loader2, Eye } from 'lucide-react';
import $ from 'jquery';

interface PengeluaranItem {
  id: string;
  nama_pengeluaran: string;
  jumlah: number;
  tanggal: string;
}

interface PengeluaranProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const Pengeluaran: React.FC<PengeluaranProps> = ({ showNotification }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [pengeluaranList, setPengeluaranList] = useState<PengeluaranItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nama_pengeluaran: '',
    jumlah: '',
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
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/pengeluaran',
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
        setPengeluaranList(response.data || []);
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
    
    if (!formData.nama_pengeluaran.trim() || !formData.jumlah) {
      showNotification('Semua field harus diisi', 'error');
      return;
    }

    const jumlah = parseInt(formData.jumlah);
    if (isNaN(jumlah) || jumlah <= 0) {
      showNotification('Jumlah harus berupa angka yang valid', 'error');
      return;
    }

    setSaving(true);
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/tambah_pengeluaran',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        nama_pengeluaran: formData.nama_pengeluaran,
        jumlah: jumlah,
        bulan: formData.bulan,
        tahun: formData.tahun
      }),
      crossDomain: true,
      xhrFields: {
        withCredentials: false
      },
      success: (response) => {
        showNotification('Pengeluaran berhasil ditambahkan');
        setFormData({
          nama_pengeluaran: '',
          jumlah: '',
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

  const totalPengeluaran = pengeluaranList.reduce((sum, item) => sum + item.jumlah, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <DollarSign className="mr-2" size={20} />
          Pengeluaran
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
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Tambah Pengeluaran</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Pengeluaran</label>
              <input
                type="text"
                value={formData.nama_pengeluaran}
                onChange={(e) => setFormData({...formData, nama_pengeluaran: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan nama pengeluaran"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah</label>
              <input
                type="number"
                value={formData.jumlah}
                onChange={(e) => setFormData({...formData, jumlah: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan jumlah"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
                <select
                  value={formData.bulan}
                  onChange={(e) => setFormData({...formData, bulan: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {months.map(month => (
                    <option key={month.value} value={month.value}>{month.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                <select
                  value={formData.tahun}
                  onChange={(e) => setFormData({...formData, tahun: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {pengeluaranList.length > 0 && (
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800">Total Pengeluaran</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalPengeluaran)}</p>
          </div>
          
          {pengeluaranList.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{item.nama_pengeluaran}</h3>
                  <p className="text-sm text-gray-600">{item.tanggal}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-red-600">{formatCurrency(item.jumlah)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {pengeluaranList.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Tidak ada data pengeluaran untuk periode yang dipilih</p>
        </div>
      )}
    </div>
  );
};

export default Pengeluaran;