import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ message = 'Loading...', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <Loader2 className={`${sizeMap[size] || sizeMap.md} animate-spin text-brand-400`} />
      {message && <p className="text-sm font-medium text-slate-400 animate-pulse">{message}</p>}
    </div>
  );
};

export const SkeletonCard = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="h-6 bg-slate-800 rounded-md w-3/4"></div>
          <div className="h-4 bg-slate-800/60 rounded-md w-full"></div>
          <div className="h-4 bg-slate-800/60 rounded-md w-5/6"></div>
          <div className="pt-4 flex gap-2">
            <div className="h-8 bg-slate-800 rounded-full w-20"></div>
            <div className="h-8 bg-slate-800 rounded-full w-24"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingSpinner;
