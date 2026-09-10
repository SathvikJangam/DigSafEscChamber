import React from 'react';
import {
  Shield,
  Heart,
  Zap,
  Flame,
  Volume2,
  VolumeX,
  Clock,
  Award,
  Terminal,
  LogOut,
  Target,
  Sparkles
} from 'lucide-react';
import { User } from '../types';
import { soundService } from '../services/sound';

interface CyberHUDProps {
  user: User | null;
  currentView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
  lives?: number;
  timeRemaining?: number;
  combo?: number;
  onDemoClick?: () => void;
}

export const CyberHUD: React.FC<CyberHUDProps> = ({
  user,
  currentView,
  onNavigate,
  onLogout,
  lives = 3,
  timeRemaining,
  combo = 0,
  onDemoClick
}) => {
  const [audioEnabled, setAudioEnabled] = React.useState(soundService.isEnabled());

  const toggleAudio = () => {
    const next = !audioEnabled;
    soundService.setEnabled(next);
    setAudioEnabled(next);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#070a12]/95 backdrop-blur-xl border-b border-cyan-500/25 px-3 sm:px-6 py-2.5 shadow-xl shadow-black/60">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:border-cyan-300 group-hover:shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-game text-base sm:text-lg font-black tracking-wider text-slate-100 group-hover:text-cyan-300 transition-colors">
                  DIGITAL SAFETY
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-tactical tracking-widest uppercase">
                  ESCAPE ROOM
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-tactical flex items-center gap-1.5 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                SECURE DEFENSE GRID ACTIVE
              </p>
            </div>
          </div>

          {/* Mobile Sound + Demo controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleAudio}
              className="p-2 rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50"
              title={audioEnabled ? 'Mute Audio' : 'Unmute Audio'}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>
            {onDemoClick && (
              <button
                onClick={onDemoClick}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-hud font-bold flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> DEMO
              </button>
            )}
          </div>
        </div>

        {/* Center Live Game HUD Stats (when in active escape room or logged in) */}
        {user && (
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs font-hud">
            {/* Lives */}
            <div className="flex items-center gap-1 bg-black/60 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md">
              <span className="text-slate-400 text-[10px] font-tactical uppercase tracking-wider mr-1">LIVES</span>
              {[...Array(3)].map((_, i) => (
                <Heart
                  key={i}
                  className={`w-4 h-4 transition-all duration-300 ${
                    i < lives
                      ? 'fill-red-500 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                      : 'fill-slate-800 text-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Level & XP */}
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md">
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40 text-[11px]">
                LVL {user.level}
              </span>
              <span className="text-slate-300 font-tactical hidden sm:inline text-xs">{user.levelTitle}</span>
              <div className="w-16 sm:w-24 bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                  style={{
                    width: `${Math.min(100, Math.round((user.xp / (user.xpToNextLevel || 1000)) * 100))}%`
                  }}
                />
              </div>
              <span className="text-cyan-400 font-bold flex items-center gap-0.5">
                <Zap className="w-3.5 h-3.5" /> {user.xp} XP
              </span>
            </div>

            {/* Cyber Safety Score */}
            <div className="hidden lg:flex items-center gap-1.5 bg-black/60 px-3 py-1.5 rounded-lg border border-slate-800 backdrop-blur-md">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-400 text-[10px] font-tactical uppercase">SAFETY:</span>
              <span className="text-emerald-400 font-bold">{user.cyberSafetyScore}/100</span>
            </div>

            {/* Active Combo */}
            {combo > 1 && (
              <div className="flex items-center gap-1 bg-amber-500/20 border border-amber-500/50 text-amber-300 px-3 py-1 rounded-lg animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="font-extrabold font-hud">COMBO x{combo}</span>
              </div>
            )}

            {/* Mission Timer (if provided) */}
            {timeRemaining !== undefined && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                  timeRemaining < 30
                    ? 'bg-red-950/60 border-red-500 text-red-400 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                    : 'bg-black/60 border-slate-800 text-slate-200'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="font-bold text-sm tracking-wider">{formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
        )}

        {/* Right Nav & Controls */}
        <div className="flex items-center gap-2">
          {/* Navigation tabs */}
          {user ? (
            <div className="flex items-center gap-1 font-tactical">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'dashboard'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                COMMAND
              </button>
              <button
                onClick={() => onNavigate('missions')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'missions' || currentView === 'game'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                SECTORS
              </button>
              <button
                onClick={() => onNavigate('profile')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'profile'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                DOSSIER
              </button>
              <button
                onClick={() => onNavigate('leaderboard')}
                className={`hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'leaderboard'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                RANKS
              </button>
              <button
                onClick={() => onNavigate('achievements')}
                className={`hidden lg:inline-flex px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  currentView === 'achievements'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                BADGES
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    currentView === 'admin'
                      ? 'bg-purple-500/25 text-purple-300 border border-purple-500/50'
                      : 'text-purple-400 hover:bg-purple-950/50'
                  }`}
                >
                  ADMIN
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 font-tactical">
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-cyan-300"
              >
                SIGN IN
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-4 py-2 text-xs font-extrabold rounded-lg bg-cyan-400 hover:bg-cyan-300 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] clip-tactical"
              >
                REGISTER
              </button>
            </div>
          )}

          {/* Desktop Sound Toggle */}
          <button
            onClick={toggleAudio}
            className="hidden md:flex items-center gap-1 p-2 rounded-lg border border-slate-800 bg-black/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-colors"
            title={audioEnabled ? 'Mute Sound FX' : 'Enable Sound FX (Web Audio)'}
          >
            {audioEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Hackathon Judge Demo CTA */}
          {onDemoClick && (
            <button
              onClick={onDemoClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/50 text-amber-300 hover:bg-amber-500/30 text-xs font-hud font-bold tracking-wide transition-all shadow-[0_0_15px_rgba(245,158,11,0.25)] clip-tactical"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              PLAY DEMO
            </button>
          )}

          {/* Logout button */}
          {user && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors bg-black/50"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
