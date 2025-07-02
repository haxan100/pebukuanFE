import React, { useState } from 'react';
import { Search, Edit3, Check, X, Loader2, AlertCircle, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import $ from 'jquery';

interface TransaksiItem {
  id: string;
  hp: string;
  harga_beli: number;
  harga_jual?: number;
}

interface BelumLakuItem {
  id: string;
  no: string | null;
  hp: string;
  grade: string;
  imei: string;
  harga_beli: string;
  harga_jual: string | null;
  status: string;
  transaksi_id: string;
}

interface SudahLakuItem {
  id: string;
  hp: string;
  grade: string;
  imei: string;
  harga_beli: number;
  harga_jual: number;
  keuntungan: number;
  tanggal_jual: string;
}

interface ListTransaksiProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
}

const ListTransaksi: React.FC<ListTransaksiProps> = ({ showNotification }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [transaksiList, setTransaksiList] = useState<TransaksiItem[]>([]);
  const [belumLakuList, setBelumLakuList] = useState<BelumLakuItem[]>([]);
  const [sudahLakuList, setSudahLakuList] = useState<SudahLakuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingBelumLaku, setLoadingBelumLaku] = useState(false);
  const [loadingSudahLaku, setLoadingSudahLaku] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'transaksi' | 'belum-laku' | 'sudah-laku'>('transaksi');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

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

  const perPageOptions = [5, 10, 15, 20, 100];

  // Filter and pagination logic
  const getFilteredData = () => {
    let data;
    if (activeView === 'transaksi') {
      data = transaksiList;
    } else if (activeView === 'belum-laku') {
      data = belumLakuList;
    } else {
      data = sudahLakuList;
    }
    
    if (!searchTerm) return data;
    
    return data.filter(item => 
      item.hp.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (activeView !== 'transaksi' && (item as BelumLakuItem | SudahLakuItem).imei.includes(searchTerm))
    );
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Reset pagination when switching views or searching
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeView, searchTerm, itemsPerPage]);

  const fetchTransaksi = () => {
    setLoading(true);
    setCurrentPage(1);
    setSearchTerm('');
    
    const formData = new FormData();
    formData.append('bulan', selectedMonth.toString());
    formData.append('tahun', selectedYear.toString());
    
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/transaksi',
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
        console.log(response);
        setTransaksiList(response.data || []);
        showNotification(`Data transaksi berhasil dimuat (${response.data?.length || 0} item)`);
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

  const fetchBelumLaku = () => {
    setLoadingBelumLaku(true);
    setCurrentPage(1);
    setSearchTerm('');
    
    const formData = new FormData();
    formData.append('bulan', selectedMonth.toString());
    formData.append('tahun', selectedYear.toString());
    
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/listBelumLaku',
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
        console.log(response);
        setBelumLakuList(response.data || []);
        showNotification(`Data HP belum laku berhasil dimuat (${response.data?.length || 0} item)`);
      },
      error: (xhr, status, error) => {
        console.error('Error fetching belum laku:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal memuat data HP belum laku';
        
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
        setLoadingBelumLaku(false);
      }
    });
  };

  const fetchSudahLaku = () => {
    setLoadingSudahLaku(true);
    setCurrentPage(1);
    setSearchTerm('');
    
    const formData = new FormData();
    formData.append('bulan', selectedMonth.toString());
    formData.append('tahun', selectedYear.toString());
    
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/listSudahLaku',
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
        console.log(response);
        setSudahLakuList(response.data || []);
        showNotification(`Data HP sudah laku berhasil dimuat (${response.data?.length || 0} item)`);
      },
      error: (xhr, status, error) => {
        console.error('Error fetching sudah laku:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal memuat data HP sudah laku';
        
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
        setLoadingSudahLaku(false);
      }
    });
  };

  const handleEdit = (item: TransaksiItem) => {
    setEditingId(item.id);
    setEditValue(item.harga_jual?.toString() || '');
  };

  const handleEditBelumLaku = (item: BelumLakuItem) => {
    setEditingId(item.id);
    setEditValue(item.harga_jual || '');
  };

  const handleSave = (id: string) => {
    const hargaJual = parseInt(editValue);
  
    if (isNaN(hargaJual) || hargaJual <= 0) {
      showNotification('Harga jual harus berupa angka yang valid', 'error');
      return;
    }
  
    setUpdating(id);
  
    const formData = new FormData();
    formData.append('id_hp', id);
    formData.append('harga', hargaJual.toString());
  
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/jual',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      dataType: 'json',
      success: (response) => {
        // Update transaksi list if in transaksi view
        if (activeView === 'transaksi') {
          setTransaksiList(prev =>
            prev.map(item =>
              item.id === id ? { ...item, harga_jual: hargaJual } : item
            )
          );
        } else {
          // Update belum laku list and remove the item since it's now sold
          setBelumLakuList(prev => prev.filter(item => item.id !== id));
        }
        
        setEditingId(null);
        setEditValue('');
        showNotification('Harga jual berhasil diupdate');
      },
      error: (xhr, status, error) => {
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredData.length)} dari {filteredData.length} data
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Per halaman:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
              className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {perPageOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex items-center justify-center space-x-1">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
          </button>
          
          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 text-gray-500">...</span>}
            </>
          )}
          
          {pages.map(page => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 rounded-lg text-sm ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {page}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 text-gray-500">...</span>}
              <button
                onClick={() => handlePageChange(totalPages)}
                className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <Search className="mr-2" size={20} />
          List Transaksi
        </h1>

        {/* Toggle View */}
        <div className="flex mb-4 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveView('transaksi')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeView === 'transaksi'
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
          >
            Semua Transaksi
          </button>
          <button
            onClick={() => setActiveView('belum-laku')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeView === 'belum-laku'
                ? 'bg-white dark:bg-gray-600 text-orange-600 dark:text-orange-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400'
            }`}
          >
            HP Belum Laku
          </button>
          <button
            onClick={() => setActiveView('sudah-laku')}
            className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
              activeView === 'sudah-laku'
                ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400'
            }`}
          >
            HP Sudah Laku
          </button>
        </div>
        
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
        
        <button
          onClick={
            activeView === 'transaksi' ? fetchTransaksi : 
            activeView === 'belum-laku' ? fetchBelumLaku : 
            fetchSudahLaku
          }
          disabled={
            activeView === 'transaksi' ? loading : 
            activeView === 'belum-laku' ? loadingBelumLaku : 
            loadingSudahLaku
          }
          className={`w-full py-2 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${
            activeView === 'transaksi' 
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : activeView === 'belum-laku'
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {(
            activeView === 'transaksi' ? loading : 
            activeView === 'belum-laku' ? loadingBelumLaku : 
            loadingSudahLaku
          ) ? (
            <>
              <Loader2 className="animate-spin mr-2" size={16} />
              Memuat...
            </>
          ) : (
            <>
              {activeView === 'transaksi' ? (
                <>
                  <Search className="mr-2" size={16} />
                  Tampilkan Transaksi
                </>
              ) : activeView === 'belum-laku' ? (
                <>
                  <AlertCircle className="mr-2" size={16} />
                  Tampilkan HP Belum Laku
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2" size={16} />
                  Tampilkan HP Sudah Laku
                </>
              )}
            </>
          )}
        </button>
      </div>

      {/* Search Bar */}
      {(transaksiList.length > 0 || belumLakuList.length > 0 || sudahLakuList.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder={`Cari ${activeView === 'transaksi' ? 'nama HP' : 'nama HP atau IMEI'}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          {filteredData.length > 0 && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {searchTerm ? `Ditemukan ${filteredData.length} hasil` : `Total ${filteredData.length} data`}
            </div>
          )}
        </div>
      )}

      {/* Transaksi List */}
      {activeView === 'transaksi' && currentData.length > 0 && (
        <div className="space-y-3">
          {currentData.map((item) => (
            <div
                key={item.id}
                className={`rounded-lg shadow-sm p-4 border ${
                  item.harga_jual
                    ? 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700'
                    : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >              
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{item.hp}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Harga Beli: {formatCurrency(item.harga_beli)}</p>
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
                        className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                      <span className="text-sm text-gray-600 dark:text-gray-400">
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
                <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-600">
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">
                    Keuntungan: {formatCurrency(item.harga_jual - item.harga_beli)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Belum Laku List */}
      {activeView === 'belum-laku' && currentData.length > 0 && (
        <div className="space-y-3">
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center">
              <AlertCircle className="text-orange-600 dark:text-orange-400 mr-2" size={20} />
              <div>
                <h3 className="font-semibold text-orange-800 dark:text-orange-300">
                  HP Belum Laku ({filteredData.length} unit)
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-400">
                  Daftar HP yang belum terjual pada periode ini
                </p>
              </div>
            </div>
          </div>

          {currentData.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-orange-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{item.hp}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Grade:</span> {(item as BelumLakuItem).grade}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">IMEI:</span> {(item as BelumLakuItem).imei}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Harga Beli:</span> {formatCurrency(parseInt((item as BelumLakuItem).harga_beli))}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                    Belum Laku
                  </span>
                </div>
              </div>

              {/* Edit Price Section for Belum Laku */}
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-600">
                {editingId === item.id ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Masukkan harga jual"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={() => handleSave(item.id)}
                      disabled={updating === item.id}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center"
                    >
                      {updating === item.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Check size={16} />
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Klik untuk menambahkan harga jual
                    </span>
                    <button
                      onClick={() => handleEditBelumLaku(item as BelumLakuItem)}
                      className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center text-sm"
                    >
                      <Edit3 size={14} className="mr-1" />
                      Jual
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sudah Laku List */}
      {activeView === 'sudah-laku' && currentData.length > 0 && (
        <div className="space-y-3">
          <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <CheckCircle className="text-green-600 dark:text-green-400 mr-2" size={20} />
              <div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                  HP Sudah Laku ({filteredData.length} unit)
                </h3>
                <p className="text-sm text-green-700 dark:text-green-400">
                  Daftar HP yang sudah terjual pada periode ini
                </p>
              </div>
            </div>
          </div>

          {currentData.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border-l-4 border-green-500"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 dark:text-white">{item.hp}</h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Grade:</span> {(item as SudahLakuItem).grade}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">IMEI:</span> {(item as SudahLakuItem).imei}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Tanggal Jual:</span> {(item as SudahLakuItem).tanggal_jual}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    Sudah Laku
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-600">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Harga Beli</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {formatCurrency((item as SudahLakuItem).harga_beli)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Harga Jual</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {formatCurrency((item as SudahLakuItem).harga_jual)}
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Keuntungan</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {formatCurrency((item as SudahLakuItem).keuntungan)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {renderPagination()}

      {/* Empty States */}
      {activeView === 'transaksi' && transaksiList.length === 0 && !loading && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">Tidak ada data transaksi untuk periode yang dipilih</p>
        </div>
      )}

      {activeView === 'belum-laku' && belumLakuList.length === 0 && !loadingBelumLaku && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <AlertCircle className="mx-auto text-green-400 mb-4" size={48} />
          <p className="text-green-600 dark:text-green-400 font-medium">Semua HP sudah laku!</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Tidak ada HP yang belum terjual pada periode ini</p>
        </div>
      )}

      {activeView === 'sudah-laku' && sudahLakuList.length === 0 && !loadingSudahLaku && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <CheckCircle className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">Tidak ada HP yang sudah terjual pada periode yang dipilih</p>
        </div>
      )}

      {/* No Search Results */}
      {searchTerm && filteredData.length === 0 && (transaksiList.length > 0 || belumLakuList.length > 0 || sudahLakuList.length > 0) && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
          <Search className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">Tidak ditemukan hasil untuk "{searchTerm}"</p>
          <button
            onClick={() => setSearchTerm('')}
            className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            Hapus pencarian
          </button>
        </div>
      )}
    </div>
  );
};

export default ListTransaksi;