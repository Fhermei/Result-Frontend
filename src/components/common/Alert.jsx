import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const Alert = ({ type, message, onClose }) => {
  const types = {
    success: { icon: FiCheckCircle, bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-400' },
    error: { icon: FiXCircle, bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-400' },
    warning: { icon: FiAlertCircle, bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-400' },
    info: { icon: FiInfo, bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-400' },
  };

  const Icon = types[type]?.icon || FiInfo;

  return (
    <div className={`${types[type]?.bg} border-l-4 ${types[type]?.border} p-4 rounded-lg mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon className={types[type]?.text} size={20} />
          <p className={`text-sm ${types[type]?.text}`}>{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FiXCircle size={18} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;