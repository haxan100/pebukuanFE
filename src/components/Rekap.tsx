import React, { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Loader2, Calendar } from 'lucide-react';
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

interface RekapTahunanItem {
  bulan: number;
  laba_bersih: number;
  laba_bersih_rupiah: string;
}

interface RekapProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const YearlyChart: React.FC<{ data: RekapTahunanItem[] }> = ({ data }) => {
  const maxProfit = Math.max(...data.map(item => item.laba_bersih));
  const minProfit = Math.min(...data.map(item => item.laba_bersih));
  const range = maxProfit - minProfit || 1;
  
  const chartWidth = 320;
  const chartHeight = 200;
  const padding = 40;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const points = data.map((item, index) => {
    const x = padding + (index * (chartWidth - 2 * padding)) / 11;
    const y = chartHeight - padding - ((item.laba_bersih - minProfit) / range) * (chartHeight - 2 * padding);
    return { x, y, value: item.laba_bersih, month: months[index] };
  });
  
  const pathData = points.map((point, index) => 
    `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
  ).join(' ');
  
  const areaPathData = `M ${points[0].x} ${chartHeight - padding} L ${pathData.substring(2)} L ${points[points.length - 1].x} ${chartHeight - padding} Z`;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
        <TrendingUp className="mr-2" size={20} />
        Grafik Laba Bersih Tahunan
      </h3>
      
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="mx-auto">
          {/* Grid lines */}
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = chartHeight - padding - ratio * (chartHeight - 2 * padding);
            const value = minProfit + ratio * range;
            return (
              <g key={index}>
                <line
                  x1={padding}
                  y1={y}
                  x2={chartWidth - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-gray-200 dark:text-gray-600"
                  strokeDasharray="2,2"
                />
                <text
                  x={padding - 5}
                  y={y + 4}
                  textAnchor="end"
                  className="text-xs fill-gray-500 dark:fill-gray-400"
                >
                  {value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : 
                   value >= 1000 ? `${(value / 1000).toFixed(0)}K` : 
                   value.toFixed(0)}
                </text>
              </g>
            );
          })}
          
          {/* Area fill */}
          <path
            d={areaPathData}
            fill="url(#areaGradient)"
          />
          
          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="4"
                fill="rgb(59, 130, 246)"
                stroke="white"
                strokeWidth="2"
                className="hover:r-6 transition-all cursor-pointer"
              />
              
              {/* Month labels */}
              <text
                x={point.x}
                y={chartHeight - padding + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
              >
                {point.month}
              </text>
              
              {/* Hover tooltip */}
              <g className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                <rect
                  x={point.x - 30}
                  y={point.y - 35}
                  width="60"
                  height="25"
                  rx="4"
                  fill="rgb(31, 41, 55)"
                  className="dark:fill-gray-700"
                />
                <text
                  x={point.x}
                  y={point.y - 18}
                  textAnchor="middle"
                  className="text-xs fill-white"
                >
                  {point.value >= 1000000 ? `${(point.value / 1000000).toFixed(1)}M` : 
                   point.value >= 1000 ? `${(point.value / 1000).toFixed(0)}K` : 
                   point.value.toLocaleString()}
                </text>
              </g>
            </g>
          ))}
        </svg>
      </div>
      
      {/* Chart legend */}
      <div className="flex justify-center mt-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>Laba Bersih (Rupiah)</span>
        </div>
      </div>
    </div>
  );
};

const Rekap: React.FC<RekapProps> = ({ showNotification }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [rekapData, setRekapData] = useState<RekapData | null>(null);
  const [rekapTahunan, setRekapTahunan] = useState<RekapTahunanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingTahunan, setLoadingTahunan] = useState(false);
  const [activeView, setActiveView] = useState<'bulanan' | 'tahunan'>('bulanan');

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

  const fetchRekapTahunan = () => {
    setLoadingTahunan(true);
    const formData = new FormData();
    formData.append('tahun', selectedYear.toString());

    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/rekap_tahunan',
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
        setRekapTahunan(response.data || []);
        showNotification('Data rekap tahunan berhasil dimuat');
      },
      error: (xhr, status, error) => {
        console.error('Error fetching rekap tahunan:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal memuat data rekap tahunan';

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
      complete: () => setLoadingTahunan(false)
    });
  };

  const totalLabaTahunan = rekapTahunan.reduce((sum, item) => sum + item.laba_bersih, 0);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <BarChart3 className="mr-2" size={20} /> Rekap Keuangan
        </h1>

        {/* Toggle View */}
        <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveView('bulanan')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeView === 'bulanan'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Rekap Bulanan
          </button>
          <button
            onClick={() => setActiveView('tahunan')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              activeView === 'tahunan'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Rekap Tahunan
          </button>
        </div>

        {activeView === 'bulanan' ? (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tahun</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (<><Loader2 className="animate-spin mr-2" size={16} /> Memuat...</>) : 'Lihat Rekap Bulanan'}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <button
              onClick={fetchRekapTahunan}
              disabled={loadingTahunan}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingTahunan ? (<><Loader2 className="animate-spin mr-2" size={16} /> Memuat...</>) : (
                <>
                  <Calendar className="mr-2" size={16} />
                  Lihat Rekap Tahunan
                </>
              )}
            </button>
          </>
        )}
      </div>

      {/* Rekap Bulanan */}
      {activeView === 'bulanan' && rekapData && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-red-500">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Modal Awal</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{rekapData.summary.modal_awal_rupiah}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-green-500">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Penjualan</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{rekapData.summary.total_penjualan_rupiah}</p>
            </div>
            
            {/* Admin and Ongkir Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-purple-500">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Admin</p>
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{rekapData.summary.total_admin_rupiah}</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Ongkir</p>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{rekapData.summary.total_ongkir_rupiah}</p>
              </div>
            </div>

            {/* Pengeluaran Tambahan */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-yellow-500">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pengeluaran Tambahan</p>
              <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{rekapData.summary.pengeluaran_tambahan_rupiah}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Beban</p>
              <p className="text-xl font-bold text-gray-800 dark:text-white">{rekapData.summary.total_beban_rupiah}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 dark:text-gray-400">Laba Bersih</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">{rekapData.summary.laba_bersih_rupiah}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{months.find(m => m.value === rekapData.bulan)?.label} {rekapData.tahun}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-gray-400">
              <p className="text-sm text-gray-600 dark:text-gray-400">Perbandingan dengan {months.find(m => m.value === rekapData.compare.bulanLalu)?.label} {rekapData.compare.tahunLalu}</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">Laba Bersih Sebelumnya: {rekapData.compare.prev_laba_bersih_rupiah}</p>
              <p className="text-sm text-gray-800 dark:text-gray-200">Selisih: {rekapData.compare.selisih_rupiah} ({rekapData.compare.persen}%)</p>
              <div className="flex items-center mt-2">
                {rekapData.compare.status_performa === 'naik' ? (
                  <TrendingUp className="text-green-600 mr-2" size={16} />
                ) : (
                  <TrendingDown className="text-red-600 mr-2" size={16} />
                )}
                <p className={`text-sm font-bold ${rekapData.compare.status_performa === 'naik' ? 'text-green-600' : 'text-red-600'}`}>
                  Status: {rekapData.compare.status_performa.toUpperCase()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rekap Tahunan */}
      {activeView === 'tahunan' && rekapTahunan.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">Total Laba Bersih {selectedYear}</h3>
            <p className="text-3xl font-bold">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(totalLabaTahunan)}
            </p>
          </div>

          {/* Yearly Chart */}
          <YearlyChart data={rekapTahunan} />

          <div className="grid grid-cols-1 gap-3">
            {rekapTahunan.map((item) => (
              <div
                key={item.bulan}
                className={`rounded-lg shadow-sm p-4 border-l-4 ${
                  item.laba_bersih > 0
                    ? 'bg-white dark:bg-gray-800 border-green-500'
                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {months.find(m => m.value === item.bulan)?.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Laba Bersih</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      item.laba_bersih > 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {item.laba_bersih_rupiah}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty States */}
      {activeView === 'bulanan' && !rekapData && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Pilih periode untuk melihat rekap keuangan bulanan</p>
        </div>
      )}

      {activeView === 'tahunan' && rekapTahunan.length === 0 && !loadingTahunan && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">Pilih tahun untuk melihat rekap keuangan tahunan</p>
        </div>
      )}
    </div>
  );
};

export default Rekap;