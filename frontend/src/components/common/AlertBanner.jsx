import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export const AlertBanner = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const styles = {
    error: {
      bg: 'bg-rose-950/70 border-rose-800 text-rose-200',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-emerald-950/70 border-emerald-800 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    },
    info: {
      bg: 'bg-brand-950/70 border-brand-800 text-brand-200',
      icon: <Info className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />,
    },
  };

  const current = styles[type] || styles.error;

  return (
    <div className={`flex items-start justify-between border rounded-xl p-4 gap-3 mb-6 transition-all ${current.bg}`}>
      <div className="flex items-start gap-3">
        {current.icon}
        <div className="text-sm font-medium leading-relaxed">{message}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 p-1 transition-colors"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default AlertBanner;
