import React, { useState } from 'react';
import {
  ServerCrash,
  RefreshCw,
  Home,
  ArrowLeft,
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Headphones,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Wifi,
} from 'lucide-react';
import ApiClient from '../../api/client';

export const ServerErrorPage = ({
  error,
  resetErrorBoundary,
  onNavigate,
  customMessage,
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState(null);
  const [copied, setCopied] = useState(false);

  // Ping backend health to check if server is recovered
  const handleCheckHealth = async () => {
    setIsCheckingHealth(true);
    setHealthStatus(null);
    try {
      const res = await ApiClient.get('/health');
      if (res?.database === 'connected' || res?.status === 'healthy') {
        setHealthStatus({
          online: true,
          message: 'Server & Database are connected and healthy!',
        });
      } else {
        setHealthStatus({
          online: false,
          message: res?.message || 'Server responded, but database is still initializing.',
        });
      }
    } catch (err) {
      setHealthStatus({
        online: false,
        message: err?.message || 'Cannot reach server yet. Reconnection in progress.',
      });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleCopyError = () => {
    const errorDetails = `Error: ${error?.message || 'Server 500 error'}\nStack: ${error?.stack || 'No stack'}\nTimestamp: ${new Date().toISOString()}`;
    navigator.clipboard.writeText(errorDetails);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReload = () => {
    if (resetErrorBoundary) {
      resetErrorBoundary();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      id="error-500-container"
      className="min-h-screen bg-gradient-to-b from-[#f9f8fc] via-[#f4f2f9] to-[#edeaf6] text-[#0e1d4a] flex flex-col justify-between selection:bg-rose-500 selection:text-white"
    >
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <button
          onClick={() => (onNavigate ? onNavigate('home') : (window.location.href = '/'))}
          className="flex items-center space-x-3 text-left focus:outline-none"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#18308c] to-[#254bdb] flex items-center justify-center shadow-lg shadow-indigo-900/15">
            <ServerCrash className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="block text-xl font-extrabold tracking-tight text-[#0e1d4a]">
              Al Salhiya <span className="text-[#ff7824]">Supermarket</span>
            </span>
            <span className="block text-xs font-semibold text-[#5e6b8c] tracking-wider uppercase">
              System Service • 500 Incident
            </span>
          </div>
        </button>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500 mr-1.5 animate-ping"></span>
            Status: 500 Internal Error
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-3xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        {/* Floating 500 Emblem */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-rose-500/20 via-orange-500/20 to-purple-500/20 rounded-full blur-2xl animate-pulse"></div>

          <div className="relative flex items-center justify-center font-black tracking-tighter select-none">
            <span className="text-8xl sm:text-9xl font-black bg-gradient-to-br from-[#18308c] via-[#32247c] to-[#122470] bg-clip-text text-transparent drop-shadow-sm">
              5
            </span>
            <div className="relative mx-1 sm:mx-3 w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-rose-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-rose-500/30 -rotate-6 hover:rotate-0 transition-transform duration-300">
              <Activity className="w-10 h-10 sm:w-14 sm:h-14 text-white animate-pulse" />
              <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-white text-rose-600 flex items-center justify-center shadow-md">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <span className="text-8xl sm:text-9xl font-black bg-gradient-to-br from-[#18308c] via-[#32247c] to-[#122470] bg-clip-text text-transparent drop-shadow-sm">
              0
            </span>
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-100/90 border border-rose-200 text-rose-800 text-xs font-bold uppercase tracking-wider mb-4">
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          <span>Server Error • حدث خطأ في الخادم</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#0e1d4a] tracking-tight mb-3">
          Our checkout counter hit an unexpected bump
        </h1>

        <p className="text-base sm:text-lg text-[#5e6b8c] max-w-xl mx-auto mb-6 font-medium">
          {customMessage ||
            'The marketplace server encountered an internal issue while handling your request. Our technical team has been notified.'}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <button
            id="btn-500-reload"
            onClick={handleReload}
            className="inline-flex items-center space-x-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#ff7824] to-[#ff9047] text-white font-bold text-sm shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload & Try Again (إعادة المحاولة)</span>
          </button>

          <button
            id="btn-500-check-health"
            onClick={handleCheckHealth}
            disabled={isCheckingHealth}
            className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-white text-[#18308c] font-bold text-sm border border-indigo-100 shadow-sm hover:bg-indigo-50/50 hover:-translate-y-0.5 transition-all disabled:opacity-60"
          >
            <Wifi className={`w-4 h-4 text-[#ff7824] ${isCheckingHealth ? 'animate-spin' : ''}`} />
            <span>{isCheckingHealth ? 'Testing Connection...' : 'Check Server Status'}</span>
          </button>

          <button
            id="btn-500-home"
            onClick={() => (onNavigate ? onNavigate('home') : (window.location.href = '/'))}
            className="inline-flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-white text-slate-700 font-bold text-sm border border-slate-200 shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all"
          >
            <Home className="w-4 h-4 text-slate-500" />
            <span>Return to Storefront</span>
          </button>
        </div>

        {/* Live Health Status Box (if checked) */}
        {healthStatus && (
          <div
            className={`w-full max-w-lg mb-6 p-4 rounded-2xl border text-sm flex items-center justify-between text-left transition-all ${
              healthStatus.online
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="flex items-center space-x-3">
              {healthStatus.online ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              )}
              <span className="font-semibold">{healthStatus.message}</span>
            </div>
            {healthStatus.online && (
              <button
                onClick={handleReload}
                className="ml-3 px-3 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Refresh Now
              </button>
            )}
          </div>
        )}

        {/* Expandable Technical Details */}
        {(error?.message || error?.stack) && (
          <div className="w-full max-w-xl text-left bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="w-full px-5 py-3.5 flex items-center justify-between bg-slate-50/70 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                <span>Technical Incident Diagnostic</span>
              </div>
              {showDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showDetails && (
              <div className="p-5 border-t border-slate-100 bg-[#141b2d] text-slate-200 font-mono text-xs rounded-b-2xl overflow-x-auto relative">
                <button
                  onClick={handleCopyError}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                  title="Copy error diagnostic"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <p className="text-rose-400 font-bold mb-1">
                  {error.name || 'Error'}: {error.message}
                </p>
                {error.stack && (
                  <pre className="text-slate-400 text-[11px] leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto mt-2">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Support Helpcard */}
        <div className="w-full max-w-xl p-4 rounded-2xl bg-white/70 border border-slate-200/60 shadow-sm flex items-center justify-between">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#ff7824]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#0e1d4a]">Need assistance with an active order?</p>
              <p className="text-[11px] text-[#5e6b8c]">Our operations desk is available to assist you 24/7</p>
            </div>
          </div>
          <button
            onClick={() => (onNavigate ? onNavigate('contact') : (window.location.href = '/contact'))}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0e1d4a] font-bold text-xs transition-colors"
          >
            Contact Helpdesk
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <p>© 2026 Al Salhiya Supermarket. System Reliability & Monitoring.</p>
        <p className="font-mono text-[11px]">HTTP 500 • Internal Error Interceptor</p>
      </footer>
    </div>
  );
};

export default ServerErrorPage;
