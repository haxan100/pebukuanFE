import React, { useState, useEffect } from 'react';
import { Receipt, DollarSign, BarChart3, Upload, Loader2, Sun, Moon, LogOut, User } from 'lucide-react';
import ListTransaksi from './components/ListTransaksi';
import Pengeluaran from './components/Pengeluaran';
import Rekap from './components/Rekap';
import Import from './components/Import';
import Login from './components/Login';
import Notification from './components/Notification';

type Tab = 'transaksi' | 'pengeluaran' | 'rekap' | 'import';

interface NotificationState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('transaksi');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [notification, setNotification] = useState<NotificationState>({
    show: false,
    message: '',
    type: 'success'
  });

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    // Show confirmation dialog
    if (window.confirm('Apakah Anda yakin ingin keluar?')) {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loginTime');
      setIsLoggedIn(false);
      setActiveTab('transaksi'); // Reset to default tab
      showNotification('Anda telah berhasil keluar');
    }
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

  // Show login screen if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} showNotification={showNotification} />
        <Notification
          show={notification.show}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 transition-colors duration-200">
      {/* Header with Theme Toggle and Logout */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center">
            <User className="text-blue-600 dark:text-blue-400 mr-2" size={20} />
            <span className="font-medium text-gray-800 dark:text-white">Hasan</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <Sun className="text-yellow-500" size={18} />
              ) : (
                <Moon className="text-gray-600" size={18} />
              )}
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
            >
              <LogOut size={16} className="mr-1" />
              Keluar
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-md mt-16">
        {renderContent()}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg transition-colors duration-200">
        <div className="flex justify-around items-center py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
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