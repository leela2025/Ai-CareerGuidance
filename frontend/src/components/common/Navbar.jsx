import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  LayoutDashboard,
  Sparkles,
  Map,
  FileText,
  ShieldCheck,
  User,
  LogOut,
  Menu,
  X,
  ArrowRight,
  GitFork,
  Users,
  MessageSquare,
  BookOpen,
  Heart,
  FolderGit2,
  ShieldAlert,
} from 'lucide-react';
import { Button } from '../ui/button';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandingPage = location.pathname === '/';

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleScrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (!isLandingPage) {
      navigate(`/#${id}`);
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const authenticatedNavLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Journey', path: '/journey', icon: GitFork },
    { name: 'Roadmap', path: '/roadmap', icon: Map },
    { name: 'Skill Health', path: '/skill-health', icon: ShieldAlert },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Resume', path: '/resume-analyzer', icon: FileText },
    { name: 'Mentors', path: '/mentors', icon: Users },
    { name: 'Stories', path: '/stories', icon: BookOpen },
    { name: 'Connections', path: '/connections', icon: MessageSquare },
  ];

  if (isAdmin) {
    authenticatedNavLinks.push({ name: 'Admin Stats', path: '/admin', icon: ShieldCheck });
  }

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/85 backdrop-blur-xl border-b border-zinc-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo with Official CareerCompassAI Icon */}
          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-xl"
            title="CareerCompassAI"
            aria-label="CareerCompassAI Home"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900/90 border border-zinc-800/80 p-1.5 shadow-lg shadow-purple-500/10 group-hover:scale-105 group-hover:border-purple-500/40 group-hover:shadow-purple-500/25 transition-all">
              <img
                src="/logo-icon.png"
                alt="CareerCompassAI Logo"
                className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1.5">
              {authenticatedNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-brand-500/15 text-brand-300 border border-brand-500/25'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-zinc-400'}`} />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          ) : isLandingPage ? (
            <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-300">
              <button
                onClick={() => handleScrollToSection('workflow')}
                className="hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400" />
                <span>3D Workflow</span>
              </button>
              <button
                onClick={() => handleScrollToSection('capabilities')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Capabilities
              </button>
              <button
                onClick={() => handleScrollToSection('careers')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Careers Covered
              </button>
              <button
                onClick={() => handleScrollToSection('architecture')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Architecture
              </button>
              <Link
                to="/mentors"
                className="hover:text-purple-400 text-zinc-300 transition-colors flex items-center gap-1.5"
              >
                <span>Mentors</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  Peer & Expert
                </span>
              </Link>
              <Link
                to="/stories"
                className="hover:text-purple-400 text-zinc-300 transition-colors flex items-center gap-1"
              >
                <span>Stories</span>
              </Link>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4">
              <Link
                to="/"
                className="text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/mentors"
                className="text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
              >
                Mentors
              </Link>
            </nav>
          )}

          {/* Desktop Auth CTAs */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-xs font-bold font-mono">
                    {user?.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-medium text-zinc-200">{user?.name}</span>
                  {isAdmin && (
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Admin
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-colors"
                  title="Log out"
                  aria-label="Log out of CareerCompassAI"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Button asChild variant="ghost" size="default">
                  <Link to="/login" className="text-zinc-300 hover:text-white text-sm">
                    Log In
                  </Link>
                </Button>
                <Button asChild variant="default" size="default">
                  <Link to="/register" className="flex items-center gap-2">
                    <span>Start Free Analysis</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-zinc-900/95 backdrop-blur-xl border-b border-zinc-800 px-6 py-6 space-y-4 shadow-2xl">
          {isAuthenticated ? (
            <>
              <div className="pb-3 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{user?.name}</p>
                  <p className="text-xs text-zinc-400 font-mono">{user?.email}</p>
                </div>
                {isAdmin && (
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                    Admin
                  </span>
                )}
              </div>
              <div className="space-y-1">
                {authenticatedNavLinks.map((link) => {
                  const Icon = link.icon;
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-brand-500/15 text-brand-300 border border-brand-500/30 font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-brand-400' : 'text-zinc-400'}`} />
                      {link.name}
                    </Link>
                  );
                })}
                <Link
                  to="/feedback"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-300/90 hover:bg-zinc-800 hover:text-amber-200"
                >
                  <Heart className="w-4 h-4 text-amber-400" />
                  Rate Platform & Feedback
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
                >
                  <User className="w-4 h-4 text-brand-400" />
                  Profile Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/40"
                >
                  <LogOut className="w-4 h-4" />
                  Log Out
                </button>
              </div>
            </>
          ) : isLandingPage ? (
            <div className="space-y-3">
              <button
                onClick={() => handleScrollToSection('workflow')}
                className="w-full text-left py-2 text-base font-medium text-zinc-300 hover:text-brand-300"
              >
                3D Product Workflow
              </button>
              <button
                onClick={() => handleScrollToSection('capabilities')}
                className="w-full text-left py-2 text-base font-medium text-zinc-300 hover:text-brand-300"
              >
                Capabilities
              </button>
              <button
                onClick={() => handleScrollToSection('careers')}
                className="w-full text-left py-2 text-base font-medium text-zinc-300 hover:text-brand-300"
              >
                Careers Covered
              </button>
              <button
                onClick={() => handleScrollToSection('architecture')}
                className="w-full text-left py-2 text-base font-medium text-zinc-300 hover:text-brand-300"
              >
                Architecture
              </button>
              <div className="pt-4 border-t border-zinc-800 flex flex-col gap-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                </Button>
                <Button asChild variant="default" className="w-full">
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Start Free Analysis</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm text-zinc-300 hover:text-white bg-zinc-800 rounded-lg"
              >
                Log In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-lg"
              >
                Register Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default Navbar;
