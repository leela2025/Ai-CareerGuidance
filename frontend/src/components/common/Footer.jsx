import React from 'react';
import { Compass, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-accent-400" />
            <span className="font-bold text-sm text-slate-200">CareerCompassAI</span>
            <span className="text-xs text-slate-400">— Final Year Academic Project</span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap justify-center">
            <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
              <Layers className="w-3 h-3 text-brand-400" /> MERN Stack
            </span>
            <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3 text-accent-400" /> Claude Sonnet 4.6
            </span>
            <span className="flex items-center gap-1 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> JWT Secured
            </span>
          </div>

          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} CareerCompassAI. Demonstrable Prototype.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
