import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign, BarChart3, Upload, Loader2 } from 'lucide-react';
import ListTransaksi from './components/ListTransaksi';
import Pengeluaran from './components/Pengeluaran';
import Rekap from './components/Rekap';
import Import from './components/Import';
import Notification from './components/Notification';

type Tab = 'transaksi' | 'pengeluaran' | 'rekap' | 'import';

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('transaksi');
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  });

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const tabs = [
    { id: 'transaksi' as Tab, label: 'Transaksi', icon: Receipt },
    { id: 'pengeluaran' as Tab, label: 'Pengeluaran', icon: DollarSign },
    { id: 'rekap' as Tab, label: 'Rekap', icon: BarChart3 },
    { id: 'import' as Tab, label: 'Import', icon: Upload },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'transaksi':
        return <ListTransaksi showNotification={showNotification} />;
      case 'pengeluaran':
        return <Pengeluaran showNotification={showNotification} />;
      case 'rekap':
        return <Rekap showNotification={showNotification} />;
      case 'import':
        return <Import showNotification={showNotification} setActiveTab={setActiveTab} />;
      default:
        return <ListTransaksi showNotification={showNotification} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-6 max-w-md">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <Icon size={20} />
                <span className="text-xs mt-1 font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}

export default App;