import React from 'react';
import { Check, AlertCircle, Info } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.type === 'error' ? (
            <AlertCircle size={16} className="toast-icon" />
          ) : toast.type === 'info' ? (
            <Info size={16} className="toast-icon" />
          ) : (
            <Check size={16} className="toast-icon" />
          )}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
