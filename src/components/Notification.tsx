import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ show, message, type, onClose }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 max-w-md mx-auto">
      <div className={`rounded-lg shadow-lg p-4 flex items-center justify-between ${
        type === 'success' 
          ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800' 
          : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800'
      }`}>
        <div className="flex items-center">
          {type === 'success' ? (
            <CheckCircle className="text-green-600 dark:text-green-400 mr-3" size={20} />
          ) : (
            <XCircle className="text-red-600 dark:text-red-400 mr-3" size={20} />
          )}
          <p className={`text-sm font-medium ${
            type === 'success' ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'
          }`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`ml-2 p-1 rounded-full hover:bg-opacity-20 ${
            type === 'success' 
              ? 'text-green-600 dark:text-green-400 hover:bg-green-600' 
              : 'text-red-600 dark:text-red-400 hover:bg-red-600'
          }`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;