import React, { useEffect } from 'react';

type AlertType = 'success' | 'error' | 'warning' | 'info';

interface AlertProps {
  message: string;
  type?: AlertType;
  isOpen: boolean;
  onClose: () => void;
  duration?: number; // Tự động đóng sau bao nhiêu ms
}

const Alert: React.FC<AlertProps> = ({ 
  message, 
  type = 'info', 
  isOpen, 
  onClose, 
  duration = 3000 
}) => {
  useEffect(() => {
    if (isOpen && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  const styles = {
    success: 'bg-green-100 border-green-500 text-green-700',
    error: 'bg-red-100 border-red-500 text-red-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    info: 'bg-blue-100 border-blue-500 text-blue-700',
  };

  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center p-4 border-l-4 rounded shadow-lg ${styles[type]}`}>
      <span className="flex-1 mr-4">{message}</span>
      <button onClick={onClose} className="font-bold hover:opacity-75">
        ✕
      </button>
    </div>
  );
};

export default Alert;