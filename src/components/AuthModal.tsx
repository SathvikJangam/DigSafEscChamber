import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  Sparkles,
  X,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import { User as UserType } from '../types';

interface AuthModalProps {
  initialMode?: 'login' | 'register';
  onSuccess: (user: UserType) => void;
  onClose?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  onSuccess,
  onClose
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [campus, setCampus] = useState('MIT Cybersecurity Lab');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDemoLogin = async () => {
    soundService.playClick();
    setLoading(true);
    setError(null);
    try {
      const res = await api.demoLogin();
      soundService.playSuccess();
      onSuccess(res.user);
    } catch (err: any) {
      setError(err.message || 'Demo initialization failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const res = await api.login(emailOrUsername, password);
        soundService.playSuccess();
        onSuccess(res.user);
      } else {
        const res = await api.register(username, email, password, campus);
        soundService.playSuccess();
        onSuccess(res.user);
      }
    } catch (err: any) {
      soundService.playWrong();
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 bg-[#0a0e17] border border-cyan-500/40 shadow-2xl relative overflow-hidden"
      >
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/90 border border-cyan-400/60 flex items-center justify-center text-cyan-400 mx-auto mb-2 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Shield className="w-6 h-6" />
          </div>
          <h2 className="cyber-font text-xl sm:text-2xl font-bold text-slate-100 uppercase tracking-wider">
            {mode === 'login' ? 'OPERATIVE SIGN IN' : 'NEW AGENT REGISTRY'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access the Digital Safety Virtual Escape Room
          </p>
        </div>

        {/* Hackathon Judge 1-Click Demo Access Banner */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-500/15 border-2 border-amber-500/60 text-center space-y-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5 uppercase tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            HACKATHON JUDGES // 1-CLICK INSTANT DEMO
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Jump straight into an active game session preloaded with level 4 stats, telemetry, and achievements!
          </p>
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 text-black font-extrabold cyber-font text-xs tracking-wider hover:opacity-95 transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
          >
            <span>LAUNCH PRE-SEEDED JUDGE RUN</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-900/80 border border-slate-800 mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            REGISTER
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2.5 rounded-lg bg-red-950/60 border border-red-500/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="text-slate-400 block mb-1">Agent Callsign (Username)</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. CyberVanguard"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 outline-none"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label className="text-slate-400 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 outline-none"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div>
              <label className="text-slate-400 block mb-1">Username or Email</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="judge_demo or demo@cybersafety.org"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 outline-none"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-400 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 placeholder:text-slate-600 focus:border-cyan-400 outline-none"
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="text-slate-400 block mb-1">Campus or Division</label>
              <select
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 focus:border-cyan-400 outline-none"
              >
                <option value="MIT Cybersecurity Lab">MIT Cybersecurity Lab</option>
                <option value="Stanford Infosec">Stanford Infosec</option>
                <option value="UC Berkeley EECS">UC Berkeley EECS</option>
                <option value="Georgia Tech Cyber">Georgia Tech Cyber</option>
                <option value="CMU CyLab">CMU CyLab</option>
                <option value="General Cyber Academy">General Cyber Academy</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold cyber-font text-xs tracking-wider transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] mt-2 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{mode === 'login' ? 'VERIFY CREDENTIALS & ENTER' : 'CREATE DEFENSE PROFILE'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
};
