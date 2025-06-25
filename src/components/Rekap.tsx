import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import $ from 'jquery';

interface RekapData {
  total_pembelian: number;
  total_penjualan: number;
  total_pengeluaran: number;
  laba_bersih: number;
  detail_bulanan?: {
    bulan: number;
    nama_bulan: string;
    pembelian: number;
    penjualan: number;
    pengeluaran: number;
    laba: number;
  }[];
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
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/rekap_tahunan',
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
        setRekapData(response.data || response);
        showNotification('Data rekap berhasil dimuat');
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
    <div className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl font-bold text-gray-800">{formatCurrency(amount)}</p>
        </div>
        <Icon className="text-gray-400" size={24} />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="mr-2" size={20} />
          Rekap Keuangan
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
          onClick={fetchRekap}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4">
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
          </div>

          {/* Laba Bersih */}
          <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${
            rekapData.laba_bersih >= 0 ? 'border-green-500' : 'border-red-500'
          }`}>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Laba Bersih</h3>
              <p className={`text-3xl font-bold ${
                rekapData.laba_bersih >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(rekapData.laba_bersih)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
              </p>
            </div>
          </div>

          {/* Detail Bulanan (if available) */}
          {rekapData.detail_bulanan && rekapData.detail_bulanan.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Detail Bulanan</h3>
              <div className="space-y-3">
                {rekapData.detail_bulanan.map((item) => (
                  <div key={item.bulan} className="border border-gray-100 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-800">{item.nama_bulan}</h4>
                      <span className={`font-semibold ${
                        item.laba >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {formatCurrency(item.laba)}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">Pembelian</p>
                        <p className="font-medium">{formatCurrency(item.pembelian)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Penjualan</p>
                        <p className="font-medium">{formatCurrency(item.penjualan)}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Pengeluaran</p>
                        <p className="font-medium">{formatCurrency(item.pengeluaran)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!rekapData && !loading && (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500">Pilih periode untuk melihat rekap keuangan</p>
        </div>
      )}
    </div>
  );
};

export default Rekap;