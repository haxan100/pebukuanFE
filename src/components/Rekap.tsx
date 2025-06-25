import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import $ from 'jquery';

interface RekapData {
  total_pembelian: number;
  total_penjualan: number;
  total_pengeluaran: number;
  laba_bersih: number;
}

interface RekapProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const Rekap: React.FC<RekapProps> = ({ showNotification }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [rekapData, setRekapData] = useState<RekapData | null>(null);
  const [loading, setLoading] = useState(false);

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

  const fetchRekap = () => {
    setLoading(true);

    const formData = new FormData();
    formData.append('bulan', selectedMonth.toString());
    formData.append('tahun', selectedYear.toString());

    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/rekap',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      crossDomain: true,
      dataType: 'json',
      xhrFields: {
        withCredentials: false
      },
      success: (response) => {
        const summary = response?.data?.summary;
        if (summary) {
          setRekapData({
            total_pembelian: summary.modal_awal,
            total_penjualan: summary.total_penjualan,
            total_pengeluaran: summary.total_beban,
            laba_bersih: summary.laba_bersih,
          });
          showNotification('Data rekap berhasil dimuat');
        } else {
          showNotification('Data rekap tidak ditemukan', 'error');
        }
      },
      error: (xhr, status, error) => {
        console.error('Error fetching rekap:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal memuat data rekap';

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const StatCard = ({ title, amount, icon: Icon, color }: {
    title: string;
    amount: number;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className={`rounded-lg p-4 border-l-4 ${color} bg-gray-50`}>  
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</p>
        </div>
        <Icon className="text-gray-400" size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Rekap Keuangan
        </h1>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={fetchRekap}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 flex justify-center items-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Memuat...
            </>
          ) : (
            'Lihat Rekap'
          )}
        </button>
      </div>

      {rekapData && (
        <div className="space-y-4">
          <StatCard
            title="Total Pembelian"
            amount={rekapData.total_pembelian}
            icon={TrendingDown}
            color="border-red-500"
          />
          <StatCard
            title="Total Penjualan"
            amount={rekapData.total_penjualan}
            icon={TrendingUp}
            color="border-green-500"
          />
          <StatCard
            title="Total Pengeluaran"
            amount={rekapData.total_pengeluaran}
            icon={TrendingDown}
            color="border-orange-500"
          />

          <div className={`rounded-lg shadow-sm p-6 text-center border-l-4 ${
            rekapData.laba_bersih >= 0 ? 'border-green-600' : 'border-red-600'
          } bg-white`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Laba Bersih</h3>
            <p className={`text-3xl font-bold ${rekapData.laba_bersih >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(rekapData.laba_bersih)}</p>
            <p className="text-sm text-gray-500 mt-1">
              {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
            </p>
          </div>
        </div>
      )}

      {!rekapData && !loading && (
        <div className="bg-white rounded-xl shadow p-6 text-center">
          <p className="text-gray-500">Pilih periode untuk melihat rekap keuangan</p>
        </div>
      )}
    </div>
  );
};

export default Rekap;
