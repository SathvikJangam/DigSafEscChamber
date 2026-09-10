import React from 'react';
import { motion } from 'motion/react';
import {
  Skull,
  RotateCcw,
  Home,
  Target,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import { soundService } from '../services/sound';

interface GameOverModalProps {
  onRetry: () => void;
  onHome: () => void;
  onAdaptiveDrill?: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  onRetry,
  onHome,
  onAdaptiveDrill
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl animate-fadeIn">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl p-6 sm:p-8 bg-[#0d070a] border-2 border-red-500/80 shadow-[0_0_60px_rgba(239,68,68,0.5)] text-center relative overflow-hidden"
      >
        {/* Pulsing red warning overlay */}
        <div className="absolute inset-0 bg-red-950/20 pointer-events-none animate-pulse" />
        <div className="absolute inset-0 game-scanlines opacity-20 pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-red-950/90 border-2 border-red-500/80 flex items-center justify-center mx-auto mb-4 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]">
          <Skull className="w-8 h-8 animate-bounce" />
        </div>

        <div className="inline-block px-3 py-1 rounded bg-red-950/90 border border-red-500 text-red-400 text-xs font-tactical font-bold uppercase tracking-widest mb-2">
          CRITICAL SECURITY COMPROMISE
        </div>

        <h2 className="font-game text-3xl sm:text-4xl font-black text-red-500 tracking-wider uppercase mb-3">
          SYSTEM BREACHED
        </h2>

        <p className="text-slate-200 text-sm leading-relaxed max-w-sm mx-auto mb-6 font-body">
          All 3 defensive lives have been exhausted. Threat actors gained unauthorized perimeter access.
        </p>

        <div className="p-4 rounded-xl bg-black/80 border border-red-900/80 text-left text-xs text-slate-300 space-y-2 mb-6 font-body">
          <div className="text-red-400 font-tactical font-bold flex items-center gap-1.5 uppercase tracking-wider">
            <AlertOctagon className="w-4 h-4 text-red-400" />
            LESSON FROM SEC-OPS COMMAND:
          </div>
          <p className="leading-relaxed text-slate-300">
            In cybersecurity, attackers only need to be right once—defenders must be vigilant every time. Take a breath, analyze the red flags, and retry the simulation.
          </p>
        </div>

        <div className="space-y-3 font-hud">
          <button
            onClick={() => {
              soundService.playClick();
              onRetry();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 text-white font-black font-game text-sm tracking-wider hover:opacity-95 shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer clip-tactical"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RETRY MISSION (RESTORE LIVES)</span>
          </button>

          {onAdaptiveDrill && (
            <button
              onClick={() => {
                soundService.playClick();
                onAdaptiveDrill();
              }}
              className="w-full py-3 rounded-xl bg-cyan-950/70 border border-cyan-500/50 text-cyan-300 font-bold text-xs tracking-wider hover:bg-cyan-900 transition-all flex items-center justify-center gap-2 cursor-pointer clip-tactical"
            >
              <Target className="w-4 h-4 text-cyan-400" />
              <span>LAUNCH AI ADAPTIVE RECOVERY DRILL</span>
            </button>
          )}

          <button
            onClick={() => {
              soundService.playClick();
              onHome();
            }}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-tactical"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Command Center</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
