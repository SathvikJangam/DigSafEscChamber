import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Heart,
  Search,
  BrainCircuit,
  Award,
  Zap,
  Flame,
  X,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { soundService } from '../services/sound';

interface HowItWorksModalProps {
  onClose: () => void;
  onEnterGame: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({ onClose, onEnterGame }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 bg-[#090d16] border border-cyan-500/40 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
            [ OPERATIVE BRIEFING // PROTOCOL 101 ]
          </span>
          <h2 className="cyber-font text-2xl sm:text-3xl font-extrabold text-slate-100 mt-1">
            HOW THE ESCAPE ROOM WORKS
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            “Don't just learn cybersecurity. Survive it.”
          </p>
        </div>

        {/* Steps Grid */}
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-500/40 text-cyan-400 shrink-0">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 cyber-font text-sm">
                1. INVESTIGATE BEFORE DECIDING
              </h3>
              <p className="text-slate-400 leading-relaxed mt-1">
                Inside every scenario (inbox, password vault, QR meter, phone call), click suspicious items to uncover hidden attack markers. Every discovered clue awards <strong className="text-cyan-400">+50 Threat Analysis XP</strong> to your profile.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-red-950 border border-red-500/40 text-red-400 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 cyber-font text-sm">
                2. GUARD YOUR 3 LIVES
              </h3>
              <p className="text-slate-400 leading-relaxed mt-1">
                You enter each mission with 3 lives. Falling for an attack vector or rushing through a prompt drains a life. Lose all 3, and the system is breached.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-400 shrink-0">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 cyber-font text-sm">
                3. REAL-TIME AI CYBER COACH DEBRIEFS
              </h3>
              <p className="text-slate-400 leading-relaxed mt-1">
                Whether you defend successfully or trigger a trap, an AI Cyber Coach delivers an instant tactical debrief explaining the real-world attack methodology and practical zero-trust defense rules.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400 shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 cyber-font text-sm">
                4. CERTIFIED CYBER SAFETY SCORE
              </h3>
              <p className="text-slate-400 leading-relaxed mt-1">
                Your decisions dynamically calibrate your 0-100 Risk Profile Index across Phishing, Passwords, QR safety, Financial Scams, and Social Engineering.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              soundService.playClick();
              onEnterGame();
            }}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 text-black font-extrabold cyber-font text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            <span>UNDERSTOOD // ENTER ESCAPE ROOM</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
