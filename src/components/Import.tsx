import React, { useState } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import $ from 'jquery';

interface ImportProps {
  showNotification: (message: string, type?: 'success' | 'error') => void;
  setActiveTab: (tab: 'transaksi' | 'pengeluaran' | 'rekap' | 'import') => void;
}

const Import: React.FC<ImportProps> = ({ showNotification, setActiveTab }) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [ongkir, setOngkir] = useState<string>('');
  const [biayaAdmin, setBiayaAdmin] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showNotification('File harus berformat PDF', 'error');
        return;
      }
      setPdfFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!pdfFile) {
      showNotification('File PDF harus dipilih', 'error');
      return;
    }

    const ongkirValue = parseInt(ongkir);
    const biayaAdminValue = parseInt(biayaAdmin);

    if (isNaN(ongkirValue) || ongkirValue < 0) {
      showNotification('Ongkir harus berupa angka yang valid', 'error');
      return;
    }

    if (isNaN(biayaAdminValue) || biayaAdminValue < 0) {
      showNotification('Biaya admin harus berupa angka yang valid', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('pdf_file', pdfFile);
    formData.append('ongkir', ongkirValue.toString());
    formData.append('biaya_admin', biayaAdminValue.toString());
    formData.append('bulan', selectedMonth.toString());
    formData.append('tahun', selectedYear.toString());

    setUploading(true);
    
    $.ajax({
      url: 'http://31.25.235.140/pembukuan/Api/import',
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      crossDomain: true,
      xhrFields: {
        withCredentials: false
      },
      success: (response) => {
        showNotification('File berhasil diimport');
        
        // Reset form
        setOngkir('');
        setBiayaAdmin('');
        setPdfFile(null);
        
        // Reset file input
        const fileInput = document.getElementById('pdf-file') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
        
        // Redirect to transaksi tab
        setTimeout(() => {
          setActiveTab('transaksi');
        }, 1000);
      },
      error: (xhr, status, error) => {
        console.error('Error importing file:', xhr.status, xhr.responseText, error);
        let errorMessage = 'Gagal mengimport file';
        
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
        setUploading(false);
      }
    });
  };

  const formatCurrency = (value: string) => {
    const num = parseInt(value.replace(/\D/g, ''));
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('id-ID').format(num);
  };

  const handleOngkirChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setOngkir(value);
  };

  const handleBiayaAdminChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setBiayaAdmin(value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
          <Upload className="mr-2" size={20} />
          Import PDF
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ongkir</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">Rp</span>
              <input
                type="text"
                value={formatCurrency(ongkir)}
                onChange={handleOngkirChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Biaya Admin</label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500 dark:text-gray-400">Rp</span>
              <input
                type="text"
                value={formatCurrency(biayaAdmin)}
                onChange={handleBiayaAdminChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File PDF</label>
            <div className="relative">
              <input
                type="file"
                id="pdf-file"
                accept=".pdf"
                onChange={handleFileChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400"
              />
            </div>
            {pdfFile && (
              <div className="mt-2 flex items-center text-sm text-gray-600 dark:text-gray-400">
                <FileText size={16} className="mr-2" />
                <span>{pdfFile.name}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={uploading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {uploading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={16} />
                Mengupload...
              </>
            ) : (
              <>
                <Upload className="mr-2" size={16} />
                Upload
              </>
            )}
          </button>
        </form>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Petunjuk Import PDF</h3>
        <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
          <li>• Pilih tahun dan bulan sesuai dengan data PDF</li>
          <li>• Masukkan jumlah ongkir dan biaya admin</li>
          <li>• Upload file PDF yang berisi data transaksi</li>
          <li>• Setelah berhasil, data akan otomatis masuk ke List Transaksi</li>
        </ul>
      </div>
    </div>
  );
};

export default Import;