import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, User, CheckCircle2, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthAPI } from '../services/api';

export default function LoginPage() {
  const [tab, setTab] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state (NO PHONE REQUIRED)
  const [signupFirstName, setSignupFirstName] = useState('');
  const [signupLastName, setSignupLastName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [isResetCodeSent, setIsResetCodeSent] = useState(false);

  const { login, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const fromState = location.state?.from;
  const redirectPath = typeof fromState === 'string' ? fromState : (fromState?.pathname || '/');
  const targetStep = location.state?.targetStep;

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!loginIdentifier || !loginPassword) {
      const msg = 'Please enter both your email/phone and password.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await login(loginIdentifier.trim(), loginPassword);
      const pendingStep = sessionStorage.getItem('shringar_booking_pending_step');
      navigate(redirectPath, { replace: true, state: targetStep ? { step: targetStep } : undefined });
    } catch (err) {
      const msg = err?.message || 'Invalid email or password. Please check your credentials and try again.';
      setErrorMessage(msg);
      // toast error also handled in AuthContext
    } finally {
      setLoading(false);
    }
  };

  // Handle Send OTP to Email
  const handleSendEmailOtp = async () => {
    setErrorMessage('');
    if (!signupEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(signupEmail)) {
      const msg = 'Please enter a valid email address before requesting an OTP code.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setOtpLoading(true);
    try {
      const res = await AuthAPI.sendOtp(signupEmail.trim(), 'EMAIL', true);
      setIsOtpSent(true);
      if (res && res.devCode) {
        setEmailOtp(res.devCode);
        toast.info(`Test server mode: verification code is ${res.devCode}`);
      } else {
        toast.success(`6-digit verification code dispatched to ${signupEmail}! Please check your inbox.`);
      }
    } catch (err) {
      const msg = err.message || 'Could not send verification email. Try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Verify Email OTP
  const handleVerifyOtp = async () => {
    setErrorMessage('');
    if (!emailOtp || emailOtp.length !== 6) {
      const msg = 'Enter the 6-digit code received on your email.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setOtpLoading(true);
    try {
      await AuthAPI.verifyOtp(signupEmail.trim(), 'EMAIL', emailOtp.trim());
      setIsEmailVerified(true);
      setIsOtpSent(false);
      toast.success('Email verified successfully!');
    } catch (err) {
      const msg = err.message || 'Invalid or expired verification code.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  // Handle Signup Submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!signupFirstName.trim()) {
      const msg = 'Please enter your first name.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!signupEmail.trim()) {
      const msg = 'Please enter your email address.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!isEmailVerified) {
      const msg = 'Please verify your email address using the 6-digit verification code.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!signupPassword || signupPassword.length < 8) {
      const msg = 'Password must be at least 8 characters with numbers and uppercase letters.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await signup({
        firstName: signupFirstName.trim(),
        lastName: signupLastName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
      });
      const pendingStep = sessionStorage.getItem('shringar_booking_pending_step');
      navigate(redirectPath, { replace: true, state: targetStep ? { step: targetStep } : undefined });
    } catch (err) {
      const msg = err?.message || 'Could not create account. Please try again.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!forgotEmail) {
      const msg = 'Please enter your registered email address.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await AuthAPI.forgotPassword(forgotEmail.trim());
      setIsResetCodeSent(true);
      toast.success('Reset code dispatched to your email address.');
    } catch (err) {
      const msg = err.message || 'Failed to dispatch password reset code.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    if (!resetCode || !resetNewPassword) {
      const msg = 'Please enter the 6-digit code and your new password.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setLoading(true);
    try {
      await AuthAPI.resetPassword(forgotEmail.trim(), resetCode.trim(), resetNewPassword);
      toast.success('Password updated successfully! Please sign in with your new password.');
      setTab('login');
      setIsResetCodeSent(false);
    } catch (err) {
      const msg = err.message || 'Failed to reset password.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-6 sm:py-12 my-auto">
      <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden">
        
        {/* Card Header with Brand Logo */}
        <div className="bg-gradient-to-r from-brand-maroon via-brand-maroon-dark to-brand-dark p-7 text-center text-white relative">
          <img
            src="/images/shringar-logo.png"
            alt="Logo"
            className="w-16 h-16 rounded-full object-cover border-2 border-brand-gold shadow-lg mx-auto mb-3"
          />
          <h2 className="font-serif-luxury text-2xl font-bold gold-gradient-text tracking-wider">
            SHRINGAR
          </h2>
          <p className="text-xs text-brand-cream/80 uppercase tracking-widest mt-0.5">
            {tab === 'login' ? 'Sign In to Your Account' : tab === 'signup' ? 'Join Shringar Mehendi Couture' : 'Password Recovery'}
          </p>
        </div>

        {/* Tab Switcher (Sign In vs Create Account) */}
        {tab !== 'forgot' && (
          <div className="flex border-b border-stone-200 bg-stone-50">
            <button
              onClick={() => { setTab('login'); setErrorMessage(''); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                tab === 'login'
                  ? 'bg-white text-brand-maroon border-b-2 border-brand-maroon'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setTab('signup'); setErrorMessage(''); }}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition ${
                tab === 'signup'
                  ? 'bg-white text-brand-maroon border-b-2 border-brand-maroon'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        <div className="p-6 sm:p-8">
          
          {/* ── 1. SIGN IN FORM ── */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Prominent In-Frame Error Alert */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    className="text-rose-400 hover:text-rose-700 font-bold p-0.5"
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                  Email or Registered Phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="priya@example.com or 9876543210"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setTab('forgot')}
                    className="text-xs text-brand-maroon hover:underline font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-brand-maroon hover:bg-brand-maroon-dark text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <span>Signing In…</span>
                ) : (
                  <>
                    <span>Sign In to Shringar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── 2. CREATE ACCOUNT FORM (NO PHONE REQUIRED) ── */}
          {tab === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {/* Prominent In-Frame Error Alert for Signup */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    className="text-rose-400 hover:text-rose-700 font-bold p-0.5"
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Priya"
                    value={signupFirstName}
                    onChange={(e) => setSignupFirstName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Sharma"
                    value={signupLastName}
                    onChange={(e) => setSignupLastName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Email with Send OTP */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Email Address *
                </label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    disabled={isEmailVerified}
                    placeholder="priya@gmail.com"
                    value={signupEmail}
                    onChange={(e) => {
                      setSignupEmail(e.target.value);
                      setIsEmailVerified(false);
                      setIsOtpSent(false);
                    }}
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-gold disabled:bg-stone-100"
                  />
                  {!isEmailVerified && (
                    <button
                      type="button"
                      disabled={otpLoading || !signupEmail}
                      onClick={handleSendEmailOtp}
                      className="px-3.5 py-2 rounded-xl bg-brand-gold text-brand-dark font-bold text-xs whitespace-nowrap hover:brightness-105 disabled:opacity-50 transition"
                    >
                      {otpLoading ? 'Sending…' : isOtpSent ? 'Resend OTP' : 'Send OTP'}
                    </button>
                  )}
                </div>

                {/* Email Verified Badge */}
                {isEmailVerified && (
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Email address verified via Gmail SMTP</span>
                  </div>
                )}
              </div>

              {/* OTP Row */}
              {isOtpSent && !isEmailVerified && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                  <span className="text-[11px] font-semibold text-amber-900 block">
                    Enter the 6-digit code sent to your email:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/[^0-9]/g, ''))}
                      className="w-32 px-3 py-1.5 rounded-lg border border-amber-300 font-mono tracking-widest text-center text-sm font-bold text-stone-900"
                    />
                    <button
                      type="button"
                      disabled={otpLoading || emailOtp.length !== 6}
                      onClick={handleVerifyOtp}
                      className="px-4 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 disabled:opacity-50 transition"
                    >
                      ✓ Verify
                    </button>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="Min 8 characters, 1 uppercase, 1 number"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-gold"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isEmailVerified}
                className="w-full py-3.5 rounded-xl bg-brand-maroon hover:bg-brand-maroon-dark text-white font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account…' : 'Create My Account'}
              </button>

              <p className="text-[11px] text-stone-400 text-center pt-1">
                By creating an account you agree to our Terms and Privacy Policy.
              </p>
            </form>
          )}

          {/* ── 3. FORGOT PASSWORD FORM ── */}
          {tab === 'forgot' && (
            <div className="space-y-4">
              {/* Prominent In-Frame Error Alert for Forgot/Reset */}
              {errorMessage && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-semibold flex items-start gap-2.5 shadow-sm animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMessage}</div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage('')}
                    className="text-rose-400 hover:text-rose-700 font-bold p-0.5"
                    title="Dismiss alert"
                  >
                    ✕
                  </button>
                </div>
              )}
              {!isResetCodeSent ? (
                <form onSubmit={handleForgotSubmit} className="space-y-4">
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Enter your registered email address and we will dispatch a 6-digit password recovery code.
                  </p>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1.5">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="priya@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider shadow"
                  >
                    {loading ? 'Sending Code…' : 'Send Reset Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab('login')}
                    className="w-full text-center text-xs text-stone-500 hover:underline pt-2"
                  >
                    ← Back to Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      6-Digit Reset Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 font-mono tracking-widest text-center text-base font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        required
                        placeholder="At least 6 characters"
                        value={resetNewPassword}
                        onChange={(e) => setResetNewPassword(e.target.value)}
                        className="w-full px-3 py-2 pr-10 rounded-xl border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-brand-gold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                        title={showResetPassword ? 'Hide password' : 'Show password'}
                      >
                        {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-brand-maroon text-white font-bold text-xs uppercase tracking-wider shadow"
                  >
                    {loading ? 'Updating…' : 'Reset Password & Sign In'}
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
