import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Sparkles, Layers, ShieldCheck } from 'lucide-react';

export const Footer = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-[#233F31]/80 bg-[#0F2A1D] py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#233F31]/60">
          {/* Brand Logo & Academic Note */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center shadow-md">
              <img
                src="/logo-icon.png"
                alt="CareerCompassAI Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(212,160,23,0.4)]"
              />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="font-bold text-base text-zinc-200">
                CareerCompass<span className="text-accent-400">AI</span>
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                — AI Career Guidance & Personalized Skill Roadmap
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6 text-xs text-zinc-400 flex-wrap justify-center font-mono">
            {isLandingPage ? (
              <>
                <button
                  onClick={() => scrollToSection('workflow')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  3D Workflow
                </button>
                <button
                  onClick={() => scrollToSection('capabilities')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Capabilities
                </button>
                <button
                  onClick={() => scrollToSection('careers')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Careers
                </button>
              </>
            ) : (
              <>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
                <Link to="/career-guidance" className="hover:text-white transition-colors">
                  Career Guidance
                </Link>
                <Link to="/roadmap" className="hover:text-white transition-colors">
                  Roadmap
                </Link>
              </>
            )}
            <Link to="/mentors" className="hover:text-accent-400 transition-colors">
              Mentors
            </Link>
            <Link to="/stories" className="hover:text-accent-400 transition-colors">
              Stories
            </Link>
            <Link to="/feedback" className="hover:text-accent-400 transition-colors">
              Feedback
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Log In
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>

        {/* Bottom Metadata & Badges */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400 font-mono">
          <p>
            © {new Date().getFullYear()} CareerCompassAI. Demonstrable Final-Year Project Prototype.
          </p>

          <div className="flex items-center gap-2.5 flex-wrap justify-center">
            <span className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full text-zinc-300">
              <Layers className="w-3 h-3 text-brand-400" /> MERN Stack
            </span>
            <span className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full text-zinc-300">
              <Sparkles className="w-3 h-3 text-accent-400" /> Claude Sonnet 4.6
            </span>
            <span className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-full text-zinc-300">
              <ShieldCheck className="w-3 h-3 text-emerald-400" /> JWT Secured
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
