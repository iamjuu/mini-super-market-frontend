import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User as UserIcon, 
  KeyRound, 
  RefreshCw, 
  CheckCircle2, 
  Sparkles,
  Utensils,
  ChefHat,
  Bike,
  ShieldCheck,
  ArrowRight,
  Store,
  Clock,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Login = ({ onBackToHome }) => {
  const { login, register, verifyOtp, resendOtp, error: authError } = useAuth();

  // Screen states: 'login' | 'signup' | 'verification' | 'forgot_password' | 'onboarding' (mobile only)
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'signup' | 'verification' | 'forgot_password'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Signup fields
  const [name, setName] = useState('');
  const [retypePassword, setRetypePassword] = useState('');
  const [showRetypePassword, setShowRetypePassword] = useState(false);

  // OTP Verification state
  const savedPendingEmail = typeof window !== 'undefined' ? sessionStorage.getItem('pending_otp_email') || '' : '';
  const [otpEmail, setOtpEmail] = useState(savedPendingEmail);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [currentDebugOtp, setCurrentDebugOtp] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Sync if pending OTP in session
  useEffect(() => {
    if (savedPendingEmail) {
      setActiveTab('verification');
    }
  }, [savedPendingEmail]);

  // OTP countdown timer
  useEffect(() => {
    let timer;
    if (activeTab === 'verification' && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeTab, resendCooldown]);

  // Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);
    setIsLoading(true);

    const loginEmail = email.trim();
    const result = await login(loginEmail, password);

    if (result.requiresOtp) {
      const target = result.email || loginEmail;
      setOtpEmail(target);
      if (result.debugOtp) setCurrentDebugOtp(String(result.debugOtp));
      sessionStorage.setItem('pending_otp_email', target);
      setOtpDigits(['', '', '', '', '', '']);

      console.log('====================================================');
      console.log(`🔐 [LOGIN OTP CODE for ${target}]:`, result.debugOtp);
      console.log('====================================================');

      setActiveTab('verification');
      setResendCooldown(60);
    } else if (!result.success) {
      setLocalError(result.error || 'Invalid email or password credentials.');
    }

    setIsLoading(false);
  };

  // Signup submit
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (password !== retypePassword) {
      setLocalError('Passwords do not match. Please verify your password.');
      return;
    }

    setIsLoading(true);
    const signupEmail = email.trim();
    const result = await register(name.trim(), signupEmail, password);

    if (result.requiresOtp) {
      const target = result.email || signupEmail;
      setOtpEmail(target);
      if (result.debugOtp) setCurrentDebugOtp(String(result.debugOtp));
      sessionStorage.setItem('pending_otp_email', target);
      setOtpDigits(['', '', '', '', '', '']);

      console.log('====================================================');
      console.log(`🔐 [REGISTRATION OTP CODE for ${target}]:`, result.debugOtp);
      console.log('====================================================');

      setActiveTab('verification');
      setResendCooldown(60);
    } else if (!result.success) {
      setLocalError(result.error || 'Failed to create account.');
    }

    setIsLoading(false);
  };

  // Verify OTP
  const handleVerifyOtp = async (codeToVerify) => {
    const fullCode = codeToVerify || otpDigits.join('');
    if (fullCode.length < 6) {
      setLocalError('Invalid OTP');
      return;
    }

    setLocalError(null);
    setIsLoading(true);

    const result = await verifyOtp(otpEmail || email, fullCode);
    if (result.success) {
      sessionStorage.removeItem('pending_otp_email');
    } else {
      setLocalError('Invalid OTP');
    }
    setIsLoading(false);
  };

  // OTP typing (Only fills inputs, user clicks button to submit)
  const handleDigitChange = (index, value) => {
    setLocalError(null);
    const cleanVal = value.replace(/\D/g, '');

    if (!cleanVal) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    if (cleanVal.length > 1) {
      const chars = cleanVal.slice(0, 6).split('');
      const updated = [...otpDigits];
      chars.forEach((c, i) => {
        if (i < 6) updated[i] = c;
      });
      setOtpDigits(updated);
      const nextFocus = Math.min(chars.length, 5);
      inputRefs[nextFocus]?.current?.focus();
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleanVal[cleanVal.length - 1];
    setOtpDigits(updated);

    if (index < 5) {
      inputRefs[index + 1]?.current?.focus();
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleVerifyOtp();
      return;
    }
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs[index - 1]?.current?.focus();
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLocalError(null);
    setResendSuccess(false);

    const result = await resendOtp(otpEmail || email);
    if (result.success) {
      if (result.debugOtp) setCurrentDebugOtp(String(result.debugOtp));
      console.log('====================================================');
      console.log(`🔄 [RESENT OTP CODE for ${otpEmail || email}]:`, result.debugOtp);
      console.log('====================================================');
      setResendSuccess(true);
      setResendCooldown(60);
      setTimeout(() => setResendSuccess(false), 5000);
    } else {
      setLocalError(result.error || 'Failed to resend code');
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] font-sans selection:bg-[#FF7622]/20 flex flex-col justify-between">
      
      {/* =============================================================
          1. DESKTOP WEB AUTH VIEW (Visible on md: and above)
          Full 2-Column Split-Screen layout with fresh grocery branding
         ============================================================= */}
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side: Brand Visuals, Fresh Food & Testimonials */}
        <div className="w-full lg:w-1/2 bg-gradient-to-br from-[#181C2E] via-[#21263F] to-[#121422] text-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#FF7622]/15 blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-[#FFA767]/10 blur-3xl pointer-events-none"></div>

          {/* Top Brand Logo */}
          <div className="relative z-10 flex items-center justify-between">
            <div 
              onClick={onBackToHome}
              className="flex items-center space-x-3 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden">
                <img src="/al-salhiya-logo.jpg" alt="Al Salhiya" className="w-full h-full object-contain" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center space-x-1.5">
                  <span className="text-2xl font-black text-white tracking-tight">
                    Al Salhiya
                  </span>
                  <span className="text-sm font-black text-[#ff7824]">الصالحية</span>
                </div>
                <span className="text-[10px] text-amber-300 font-bold tracking-widest block uppercase">PREMIUM QUALITY</span>
              </div>
            </div>

            <button
              onClick={onBackToHome}
              className="text-xs font-bold text-slate-300 hover:text-white flex items-center space-x-1.5 transition-colors bg-white/10 hover:bg-white/15 px-3.5 py-2 rounded-xl"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </button>
          </div>

          {/* Center Showcase */}
          <div className="relative z-10 space-y-8 my-auto py-8 max-w-lg">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/40 text-amber-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#ff7824]" />
              <span>الصالحية • Premium Quality Product Showcase</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Al Salhiya Pure &amp; Premium Products.
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              Explore authentic Al Salhiya collections: fresh produce, tender chicken, wild seafood, prime cuts, and fine pantry essentials verified for excellence.
            </p>

            {/* 5 Categories Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              {['🥬 Organic Vegetables', '🍗 Farm Fresh Chicken', '🐟 Wild Seafood', '🥩 Halal Prime Beef', '🍯 Grocery Pantry'].map((badge, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/10"
                >
                  {badge}
                </span>
              ))}
            </div>

            {/* Quote Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2">
              <p className="text-xs text-slate-200 italic">
                "Local Run delivers our weekly chicken, broccoli, and fresh salmon faster than any local store. The OTP verification ensures zero wrong drops!"
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold">
                <span className="text-white">Ayesha Khan — Bangalore</span>
                <span className="text-amber-400">★★★★★ 5.0 Rating</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Highlights */}
          <div className="relative z-10 flex items-center space-x-6 text-xs text-slate-400">
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Halal & Farm Verified</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-[#FF7622]" />
              <span>15-Minute Live Radar ETA</span>
            </div>
          </div>
        </div>

        {/* Right Side: Modern Desktop Auth Form Container */}
        <div className="w-full lg:w-1/2 bg-white p-6 sm:p-10 lg:p-16 flex flex-col justify-between overflow-y-auto">
          <div className="max-w-md w-full mx-auto my-auto space-y-6">
            
            {/* Admin Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-xl bg-[#18308c]/10 text-[#18308c] text-xs font-black">
              <ShieldCheck className="w-4 h-4 text-[#18308c]" />
              <span>AL SALHIYA • ADMIN PORTAL</span>
            </div>

            {/* Header Info */}
            <div>
              <h1 className="text-2xl font-black text-[#181C2E] tracking-tight">
                {activeTab === 'login' && 'Administrator Sign In'}
                {activeTab === 'verification' && 'Enter 6-Digit OTP Code'}
                {activeTab === 'forgot_password' && 'Reset Admin Password'}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {activeTab === 'login' && 'Enter your administrator credentials to manage products, categories, and inventory.'}
                {activeTab === 'verification' && `We sent a security code to ${otpEmail || email}`}
                {activeTab === 'forgot_password' && 'Enter your registered admin email address to receive password instructions.'}
              </p>
            </div>

            {/* Resend success notice */}
            {resendSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700 text-center">
                A new code was sent! Check your browser DevTools Console.
              </div>
            )}

            {/* -------------------------------------------------------------
                DESKTOP VIEW: SIGN IN
               ------------------------------------------------------------- */}
            {activeTab === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                    Admin Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="a@gmail.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#F0F5FA] border border-transparent text-[#181C2E] text-xs font-bold placeholder:text-[#A0A5BA] focus:outline-none focus:bg-white focus:border-[#18308c] transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                      Admin Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveTab('forgot_password')}
                      className="text-xs font-semibold text-[#18308c] hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-4 pr-11 py-3.5 rounded-xl bg-[#F0F5FA] border border-transparent text-[#181C2E] text-xs font-bold placeholder:text-[#A0A5BA] focus:outline-none focus:bg-white focus:border-[#18308c] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-[#A0A5BA] hover:text-[#181C2E]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-[#18308c] focus:ring-[#18308c] accent-[#18308c]"
                    />
                    <span>Remember my admin session</span>
                  </label>
                </div>

                {/* Error message text only, without background */}
                {(localError || authError) && (
                  <p className="text-xs font-bold text-rose-500 pt-1 text-center animate-in fade-in">
                    {localError || authError}
                  </p>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-xl bg-[#18308c] hover:bg-[#12246b] active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#18308c]/25 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'AUTHENTICATING...' : 'SIGN IN TO ADMIN PORTAL'}
                </button>

                {/* Quick test credentials reminder */}
                <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200/80 text-[11px] space-y-2">
                  <p className="font-bold text-[#18308c] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Quick Admin One-Click Login:
                  </p>
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setEmail('a@gmail.com');
                        setPassword('123');
                        setLocalError(null);
                      }}
                      className="w-full p-3 rounded-xl bg-white border-2 border-blue-200 hover:border-[#18308c] text-left transition-all group shadow-xs hover:shadow-md cursor-pointer"
                    >
                      <span className="block font-black text-[#181C2E] group-hover:text-[#18308c] text-xs">⚡ Administrator Console</span>
                      <span className="block text-slate-500 font-mono text-[10px] mt-0.5 truncate">a@gmail.com (Password: 123)</span>
                      <span className="block text-[#18308c] font-mono text-[10px] font-bold mt-1">Manage Products, Categories &amp; Store</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* -------------------------------------------------------------
                DESKTOP VIEW: OTP VERIFICATION
               ------------------------------------------------------------- */}
            {activeTab === 'verification' && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleVerifyOtp();
                }} 
                className="space-y-5"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                      Verification Code
                    </span>
                    <button
                      type="button"
                      disabled={resendCooldown > 0}
                      onClick={handleResendOtp}
                      className="font-bold text-xs text-slate-500 hover:text-[#FF7622] disabled:opacity-60 transition-colors"
                    >
                      {resendCooldown > 0 ? (
                        <span>Resend in <strong className="text-[#FF7622]">{resendCooldown}s</strong></span>
                      ) : (
                        <span className="text-[#FF7622] underline">Resend code</span>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-6 gap-2 w-full">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={inputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={6}
                        value={digit}
                        autoFocus={idx === 0}
                        onChange={(e) => handleDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                        className={`w-full min-w-0 h-13 rounded-2xl text-center text-xl font-black transition-all outline-none ${
                          digit
                            ? 'bg-white border-2 border-[#FF7622] text-[#181C2E] shadow-sm'
                            : 'bg-[#F0F5FA] border-2 border-transparent text-[#181C2E] focus:border-[#FF7622] focus:bg-white'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Plain text error without background, as user requested */}
                  {(localError || authError) && (
                    <p className="text-xs font-bold text-rose-500 text-center pt-1 animate-in fade-in">
                      Invalid OTP
                    </p>
                  )}

                  {currentDebugOtp && (
                    <button
                      type="button"
                      onClick={() => {
                        const chars = currentDebugOtp.split('').slice(0, 6);
                        setOtpDigits(chars);
                        setLocalError(null);
                        inputRefs[5]?.current?.focus();
                      }}
                      className="w-full p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-xs text-[#FF7622] font-bold text-center cursor-pointer transition-colors shadow-2xs"
                    >
                      ⚡ One-Click Fill Code: <span className="font-mono text-sm tracking-widest underline ml-1 text-[#181C2E] font-black">{currentDebugOtp}</span>
                    </button>
                  )}

                  <p className="text-[11px] text-slate-400 text-center pt-1 font-medium">
                    ⚡ Verification code is also printed in your DevTools Console and server terminal.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || otpDigits.join('').length < 6}
                  className="w-full py-4 rounded-xl bg-[#FF7622] hover:bg-[#E56314] active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF7622]/25 transition-all disabled:opacity-50"
                >
                  {isLoading ? 'VERIFYING...' : 'CONFIRM & SIGN IN'}
                </button>
              </form>
            )}

            {/* -------------------------------------------------------------
                DESKTOP VIEW: FORGOT PASSWORD
               ------------------------------------------------------------- */}
            {activeTab === 'forgot_password' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold tracking-wider text-slate-600 uppercase">
                    Your Registered Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@marketplace.com"
                    className="w-full px-4 py-3.5 rounded-xl bg-[#F0F5FA] border border-transparent text-[#181C2E] text-xs font-bold placeholder:text-[#A0A5BA] focus:outline-none focus:bg-white focus:border-[#FF7622] transition-all"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setResendSuccess(true);
                    setTimeout(() => setActiveTab('login'), 2000);
                  }}
                  className="w-full py-4 rounded-xl bg-[#FF7622] hover:bg-[#E56314] active:scale-[0.99] text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-[#FF7622]/25 transition-all"
                >
                  SEND RECOVERY CODE
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('login')}
                    className="text-xs font-bold text-slate-500 hover:text-[#FF7622]"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            )}

          </div>

          <div className="text-center text-xs text-slate-400 max-w-md mx-auto pt-6">
            <p>© 2026 Al Salhiya. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
