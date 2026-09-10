import React from 'react';
import { motion } from 'motion/react';
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Zap,
  Flame,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Award
} from 'lucide-react';
import { AiCoachFeedback } from '../types';
import { soundService } from '../services/sound';

interface CyberCoachModalProps {
  feedback: AiCoachFeedback;
  xpGained: number;
  speedBonus: number;
  combo: number;
  lives: number;
  onContinue: () => void;
  isMissionComplete?: boolean;
}

export const CyberCoachModal: React.FC<CyberCoachModalProps> = ({
  feedback,
  xpGained,
  speedBonus,
  combo,
  lives,
  onContinue,
  isMissionComplete
}) => {
  const isCorrect = feedback.isCorrect;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className={`w-full max-w-xl rounded-2xl p-6 sm:p-8 bg-[#090d18] border ${
          isCorrect ? 'border-emerald-500/70 shadow-[0_0_50px_rgba(16,185,129,0.3)]' : 'border-red-500/70 shadow-[0_0_50px_rgba(239,68,68,0.3)]'
        } shadow-2xl relative overflow-hidden`}
      >
        {/* Glow backdrop */}
        <div
          className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-[100px] pointer-events-none ${
            isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'
          }`}
        />
        <div className="absolute inset-0 game-scanlines opacity-15 pointer-events-none" />

        {/* Coach Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isCorrect
                  ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                  : 'bg-red-950/80 border border-red-500/50 text-red-400'
              }`}
            >
              <BrainCircuit className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-xs text-cyan-400 font-tactical font-bold tracking-widest uppercase flex items-center gap-1.5">
                <span>AI CYBER COACH</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  REAL-TIME DEBRIEF
                </span>
              </div>
              <div className="text-[11px] text-slate-300 font-body">Tactical Defense Analysis Engine</div>
            </div>
          </div>

          <div className="text-right font-hud">
            <span className="text-[10px] text-slate-400 font-tactical uppercase tracking-wider block">LIVES REMAINING</span>
            <span className={`text-sm font-bold ${lives > 1 ? 'text-emerald-400' : 'text-red-400'}`}>
              ❤️ {lives} / 3
            </span>
          </div>
        </div>

        {/* Verdict Banner */}
        <div
          className={`p-3.5 rounded-xl border flex items-center gap-3 mb-5 ${
            isCorrect
              ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
              : 'bg-red-950/50 border-red-500/50 text-red-300'
          }`}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-red-400 shrink-0" />
          )}
          <div>
            <div className="font-game text-base sm:text-lg font-bold tracking-wide uppercase">
              {feedback.verdict}
            </div>
            <div className="text-xs opacity-90 font-hud">
              Vector: <span className="font-bold uppercase font-tactical">{feedback.threatType}</span>
            </div>
          </div>
        </div>

        {/* XP & Score Reward Breakdown (if correct) */}
        {isCorrect && (
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-black/60 border border-slate-800 mb-5 text-center text-xs font-hud">
            <div>
              <div className="text-slate-400 text-[10px] font-tactical">XP AWARDED</div>
              <div className="text-emerald-400 font-bold text-sm flex items-center justify-center gap-1 font-game">
                <Zap className="w-3.5 h-3.5" /> +{xpGained} XP
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-tactical">SPEED BONUS</div>
              <div className="text-cyan-400 font-bold text-sm flex items-center justify-center gap-1 font-game">
                <Clock className="w-3.5 h-3.5" /> +{speedBonus} XP
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px] font-tactical">COMBO STREAK</div>
              <div className="text-amber-400 font-bold text-sm flex items-center justify-center gap-1 font-game">
                <Flame className="w-3.5 h-3.5" /> x{combo}
              </div>
            </div>
          </div>
        )}

        {/* Warning signs identified */}
        {feedback.identifiedWarningSigns && feedback.identifiedWarningSigns.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <div className="text-xs font-tactical font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              IDENTIFIED ATTACK INDICATORS:
            </div>
            <ul className="text-xs text-slate-300 space-y-1 pl-4 border-l-2 border-cyan-500/40 font-body">
              {feedback.identifiedWarningSigns.map((sign, idx) => (
                <li key={idx} className="leading-snug">
                  • {sign}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Explanation */}
        <div className="p-3.5 rounded-xl bg-black/60 border border-slate-800 text-xs text-slate-200 leading-relaxed mb-5 font-body">
          <span className="text-cyan-300 font-tactical font-bold block mb-1 uppercase tracking-wider">TACTICAL EXPLANATION:</span>
          {feedback.explanation}
        </div>

        {/* Tactical Recommendation / Takeaway */}
        <div className="p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-xs text-cyan-200 mb-6 flex items-start gap-2 font-body">
          <AlertTriangle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-tactical font-bold uppercase tracking-wider text-cyan-300">CYBER PRINCIPLE: </span>
            {feedback.nextStepRecommendation}
          </div>
        </div>

        {/* Action button */}
        <button
          onClick={() => {
            soundService.playClick();
            onContinue();
          }}
          className={`w-full py-3.5 rounded-xl font-bold font-game text-xs sm:text-sm tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer clip-tactical ${
            isCorrect
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 text-black hover:opacity-95 shadow-[0_0_25px_rgba(16,185,129,0.4)]'
              : 'bg-gradient-to-r from-red-600 via-red-500 to-amber-600 text-white hover:opacity-95 shadow-[0_0_25px_rgba(239,68,68,0.4)]'
          }`}
        >
          <span>{isMissionComplete ? 'MISSION COMPLETED // PROCEED →' : 'ADVANCE TO NEXT CHECKPOINT →'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};
