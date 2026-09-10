import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  Unlock,
  Award,
  ShieldCheck,
  Share2,
  BarChart3,
  RotateCcw,
  Zap,
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { User, GameSession } from '../types';
import { soundService } from '../services/sound';

interface FinalEscapeModalProps {
  user: User;
  session?: GameSession | null;
  onViewProfile: () => void;
  onGenerateShareCard: () => void;
  onPlayAgain: () => void;
}

export const FinalEscapeModal: React.FC<FinalEscapeModalProps> = ({
  user,
  session,
  onViewProfile,
  onGenerateShareCard,
  onPlayAgain
}) => {
  useEffect(() => {
    soundService.playSuccess();
    // Blast celebratory cybersecurity confetti!
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#10b981', '#f59e0b', '#3b82f6']
      });
    } catch (err) {
      console.warn('Confetti trigger skipped:', err);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-xl rounded-3xl p-6 sm:p-10 bg-[#070b14] border-2 border-cyan-400/80 shadow-[0_0_70px_rgba(6,182,212,0.4)] text-center relative overflow-hidden"
      >
        {/* Futuristic glowing ambient */}
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-cyan-500/20 blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 rounded-full bg-emerald-500/20 blur-[90px] pointer-events-none" />
        <div className="absolute inset-0 game-scanlines opacity-15 pointer-events-none" />

        {/* Vault Unlock Icon */}
        <div className="w-20 h-20 rounded-2xl bg-cyan-950/80 border-2 border-cyan-400 flex items-center justify-center mx-auto mb-4 text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.9)]">
          <Unlock className="w-10 h-10 animate-bounce" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/60 text-emerald-400 text-xs font-tactical font-bold uppercase tracking-widest mb-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          SYSTEM UNLOCKED // PERIMETER SECURED
        </div>

        <h2 className="font-game text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 tracking-wider uppercase mb-2">
          YOU ESCAPED.
        </h2>

        <p className="text-slate-200 text-sm max-w-md mx-auto mb-6 font-body leading-relaxed">
          Congratulations, Operative {user.username}! You penetrated all threat chambers, adhered to zero-trust defense, and unlocked the virtual containment grid.
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-black/70 border border-slate-800 text-center mb-6 font-hud">
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-tactical">SAFETY SCORE</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-game mt-0.5">
              {user.cyberSafetyScore}/100
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-tactical">AGENT LEVEL</div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-game mt-0.5">
              LVL {user.level}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-tactical">THREATS FOILED</div>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-game mt-0.5">
              {user.threatsIdentified}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-tactical">BEST COMBO</div>
            <div className="text-xl sm:text-2xl font-black text-purple-400 font-game mt-0.5">
              x{user.bestCombo}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 font-hud">
          <button
            onClick={() => {
              soundService.playClick();
              onGenerateShareCard();
            }}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-black font-black font-game text-sm sm:text-base tracking-wider hover:opacity-95 shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2.5 cursor-pointer clip-tactical"
          >
            <Share2 className="w-5 h-5" />
            <span>GENERATE CERTIFIED RESULT CARD</span>
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundService.playClick();
                onViewProfile();
              }}
              className="py-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-200 hover:text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer clip-tactical font-tactical"
            >
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>VIEW CYBER DOSSIER</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onPlayAgain();
              }}
              className="py-3 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 text-slate-200 hover:text-emerald-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer clip-tactical font-tactical"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>PLAY AGAIN (NEW MISSION)</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
