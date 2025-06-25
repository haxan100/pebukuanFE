import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import $ from 'jquery';

interface RekapSummary {
  modal_awal_rupiah: string;
  total_penjualan_rupiah: string;
  total_admin_rupiah: string;
  total_ongkir_rupiah: string;
  pengeluaran_tambahan_rupiah: string;
  total_beban_rupiah: string;
  laba_bersih_rupiah: string;
  jumlah_laku: number;
  jumlah_belum_laku: number;
}

interface RekapCompare {
  bulanLalu: number;
  tahunLalu: number;
  prev_laba_bersih_rupiah: string;
  selisih_rupiah: string;
  persen: number;
  status_performa: string;
}

interface RekapData {
  summary: RekapSummary;
  compare: RekapCompare;
  bulan: number;
  tahun: number;
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
        setRekapData(response.data);
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
      complete: () => setLoading(false)
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <BarChart3 className="mr-2" size={20} /> Rekap Keuangan
        </h1>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex justify-center items-center"
        >
          {loading ? (<><Loader2 className="animate-spin mr-2" size={16} /> Memuat...</>) : 'Lihat Rekap'}
        </button>
      </div>

      {rekapData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-600">Total Modal Awal</p>
              <p className="text-xl font-bold text-gray-800">{rekapData.summary.modal_awal_rupiah}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Total Penjualan</p>
              <p className="text-xl font-bold text-gray-800">{rekapData.summary.total_penjualan_rupiah}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600">Total Beban</p>
              <p className="text-xl font-bold text-gray-800">{rekapData.summary.total_beban_rupiah}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Laba Bersih</p>
              <p className="text-2xl font-bold text-green-700">{rekapData.summary.laba_bersih_rupiah}</p>
              <p className="text-sm text-gray-600">{months.find(m => m.value === rekapData.bulan)?.label} {rekapData.tahun}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
              <p className="text-sm text-gray-600">Perbandingan dengan {months.find(m => m.value === rekapData.compare.bulanLalu)?.label} {rekapData.compare.tahunLalu}</p>
              <p className="text-sm text-gray-800">Laba Bersih Sebelumnya: {rekapData.compare.prev_laba_bersih_rupiah}</p>
              <p className="text-sm text-gray-800">Selisih: {rekapData.compare.selisih_rupiah} ({rekapData.compare.persen}%)</p>
              <p className={`text-sm font-bold ${rekapData.compare.status_performa === 'naik' ? 'text-green-600' : 'text-red-600'}`}>
                Status: {rekapData.compare.status_performa.toUpperCase()}
              </p>
            </div>
          </div>
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
