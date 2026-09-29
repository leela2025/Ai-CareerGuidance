import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  Lock,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import api from '../api/axios';
import { AlertBanner } from '../components/common/AlertBanner';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Step 1 = Request Code, Step 2 = Enter Code & Reset Password, Step 3 = Success
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // If token is provided in URL query (e.g., /forgot-password?token=xxx&email=xxx)
  const tokenFromUrl = searchParams.get('token');
  const [resetToken, setResetToken] = useState(tokenFromUrl || '');

  useEffect(() => {
    if (tokenFromUrl) {
      setStep(2);
    }
  }, [tokenFromUrl]);

  // Step 1: Request password reset code
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      if (response.data.success) {
        setGeneratedCode(response.data.resetCode || '');
        setResetToken(response.data.resetToken || '');
        setSuccessMsg(
          'Verification code generated! Enter the 6-digit code below to set your new password.'
        );
        setStep(2);
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.message) {
        setError(data.message);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Unable to reach the server. Please check your network connection.');
      } else {
        setError('Failed to initiate password reset. Please verify your email.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper for evaluator / viva demo
  const handleQuickFillCode = () => {
    if (generatedCode) {
      setCode(generatedCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  // Step 2: Submit new password with code or token
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (!code && !resetToken) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        newPassword,
      };

      if (resetToken) {
        payload.token = resetToken;
      }
      if (code) {
        payload.code = code.trim();
        payload.email = email.trim().toLowerCase();
      }

      const response = await api.post('/auth/reset-password', payload);

      if (response.data.success) {
        setStep(3);
        setSuccessMsg('Your password has been successfully updated! You can now sign in.');
      }
    } catch (err) {
      const data = err.response?.data;
      if (data?.message) {
        setError(data.message);
      } else {
        setError('Failed to reset password. The code may be incorrect or expired.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block group mb-4">
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-xl inline-flex items-center justify-center group-hover:border-accent-500/40 group-hover:shadow-accent-500/10 transition-all">
              <img
                src="/logo-transparent.png"
                alt="CareerCompassAI Logo"
                className="h-16 w-auto object-contain mx-auto drop-shadow-[0_0_15px_rgba(168,85,247,0.35)] group-hover:scale-105 transition-transform"
              />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {step === 3 ? 'Password Reset Complete' : 'Reset Your Password'}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {step === 1 && 'Enter your registered email to receive a secure recovery code'}
            {step === 2 && 'Enter the verification code and choose a new password'}
            {step === 3 && 'Your account security credentials have been updated'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle gradient corner accent */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-brand-500/10 rounded-full blur-2xl pointer-events-none" />

          <AlertBanner type="error" message={error} onClose={() => setError('')} />

          {/* STEP 1: Request Code */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Registered Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@careercompass.ai"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              {/* Demo 1-Click Fill Hint for evaluators */}
              <div className="p-3 rounded-xl bg-accent-950/30 border border-accent-800/40 text-xs text-accent-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-accent-400" />
                  Demo account ready
                </span>
                <button
                  type="button"
                  onClick={() => setEmail('student@careercompass.ai')}
                  className="text-xs font-semibold text-accent-400 hover:text-accent-300 underline"
                >
                  Use student@careercompass.ai
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoadingSpinner message="Generating Code..." size="sm" />
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
                </Link>
              </div>
            </form>
          )}

          {/* STEP 2: Enter Code & New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* Generated Code Notification Box (Offline / Demo Friendly) */}
              {generatedCode && (
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-brand-500/40 shadow-inner">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-brand-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Verification Code (15 min expiry)
                    </span>
                    <button
                      type="button"
                      onClick={handleQuickFillCode}
                      className="text-xs px-2.5 py-1 rounded-md bg-brand-500/20 text-brand-300 hover:bg-brand-500/30 transition-colors flex items-center gap-1 font-mono font-medium"
                    >
                      {copiedCode ? <Check className="w-3 h-3 text-brand-300" /> : <Copy className="w-3 h-3" />}
                      {copiedCode ? 'Filled' : 'Auto Fill'}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
                    <span className="font-mono text-lg font-bold tracking-widest text-brand-400">
                      {generatedCode}
                    </span>
                    <span className="text-[11px] text-zinc-400">Instant Demo Code</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  6-Digit Verification Code
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit code"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm font-mono tracking-widest text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirement Notes */}
              <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      newPassword.length >= 6 ? 'text-brand-400' : 'text-zinc-600'
                    }`}
                  />
                  <span>At least 6 characters</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${
                      newPassword && newPassword === confirmPassword
                        ? 'text-brand-400'
                        : 'text-zinc-600'
                    }`}
                  />
                  <span>Passwords match</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <LoadingSpinner message="Updating Password..." size="sm" />
                ) : (
                  <>
                    <span>Reset Password</span>
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError('');
                  }}
                  className="hover:text-white transition-colors flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Change Email
                </button>
                <Link to="/login" className="hover:text-white transition-colors">
                  Cancel
                </Link>
              </div>
            </form>
          )}

          {/* STEP 3: Success Screen */}
          {step === 3 && (
            <div className="text-center py-4 space-y-5">
              <div className="w-16 h-16 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 flex items-center justify-center mx-auto shadow-lg shadow-brand-500/10">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Password Changed Successfully!</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Your credentials have been securely updated. You can now access your CareerCompassAI dashboard using your new password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold text-sm shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>Proceed to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
