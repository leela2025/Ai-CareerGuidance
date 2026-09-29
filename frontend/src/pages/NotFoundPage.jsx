import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 p-2 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-500/10">
          <img
            src="/logo-icon.png"
            alt="CareerCompassAI Logo"
            className="w-full h-full object-contain animate-pulse"
          />
        </div>
        <span className="text-4xl font-extrabold text-brand-400">404</span>
        <h1 className="text-2xl font-bold text-white mt-2 mb-3">Page Not Found</h1>
        <p className="text-sm text-slate-400 mb-8">
          The career navigation coordinate you requested does not exist or has been relocated.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-md"
          >
            <Home className="w-4 h-4" />
            <span>Go to Dashboard</span>
          </Link>
          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-sm transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
