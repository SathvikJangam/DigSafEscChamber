import React, { useState } from 'react';
import {
  MessageSquare,
  AlertTriangle,
  Search,
  Check,
  ShieldCheck,
  Smartphone,
  DollarSign,
  Info
} from 'lucide-react';
import { Challenge, ChallengeClue } from '../../types';
import { soundService } from '../../services/sound';

interface ScamInspectorProps {
  challenge: Challenge;
  discoveredClues: string[];
  onDiscoverClue: (clueId: string) => void;
  onSelectOption: (optionId: string) => void;
  onUseHint: () => void;
  hintsUsed: number;
  hintText?: string;
  isSubmitting?: boolean;
}

export const ScamInspector: React.FC<ScamInspectorProps> = ({
  challenge,
  discoveredClues,
  onDiscoverClue,
  onSelectOption,
  onUseHint,
  hintsUsed,
  hintText,
  isSubmitting
}) => {
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [activeInspectorClue, setActiveInspectorClue] = useState<ChallengeClue | null>(null);

  const clues = challenge.clues || [];

  const handleClueClick = (clue: ChallengeClue) => {
    soundService.playClick();
    setActiveInspectorClue(clue);
    if (!discoveredClues.includes(clue.id)) {
      soundService.playCorrect();
      onDiscoverClue(clue.id);
    }
  };

  const handleOptionSubmit = (optId: string) => {
    setSelectedOpt(optId);
    soundService.playClick();
    onSelectOption(optId);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Threat Intelligence Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-orange-500/30">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-orange-400" />
          <span className="text-xs text-slate-300 font-bold tracking-wide">
            FINANCIAL FRAUD & SCAM PATTERN DETECTOR:
          </span>
          <span className="text-xs text-orange-400">
            Analyze the chat dialogue to flag advance-fee schemes and credential theft!
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-orange-950 border border-orange-500/40 text-orange-300 font-bold">
            INTEL FOUND: {discoveredClues.length} / {clues.length}
          </span>
          <button
            onClick={() => {
              soundService.playClick();
              onUseHint();
            }}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-amber-400 hover:border-amber-400 hover:bg-amber-950/40 transition-colors flex items-center gap-1"
          >
            <Info className="w-3.5 h-3.5" />
            <span>HINT ({hintsUsed})</span>
          </button>
        </div>
      </div>

      {hintText && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>CYBER ADVISORY: {hintText}</span>
        </div>
      )}

      {/* Discovered Clue Panel */}
      {activeInspectorClue && (
        <div className="p-3.5 rounded-xl bg-orange-950/60 border border-orange-400/60 text-xs text-slate-200 flex items-start justify-between gap-3 shadow-[0_0_20px_rgba(249,115,22,0.2)] animate-fadeIn">
          <div className="space-y-1">
            <div className="text-orange-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-400" />
              THREAT MARKER ANALYZED: {activeInspectorClue.name}
            </div>
            <p className="text-slate-300">{activeInspectorClue.description}</p>
            <div className="text-[10px] text-emerald-400 font-semibold">
              +50 Threat Analysis XP Awarded To Profile
            </div>
          </div>
          <button
            onClick={() => setActiveInspectorClue(null)}
            className="text-slate-400 hover:text-white px-2 py-1 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Realistic Smartphone Messenger Simulator */}
      <div className="max-w-md mx-auto rounded-3xl bg-slate-950 border-4 border-slate-800 p-4 shadow-2xl space-y-4">
        {/* Mobile Status Bar */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 px-2">
          <span>09:42</span>
          <div className="flex items-center gap-1.5">
            <span>5G</span>
            <span>98%</span>
          </div>
        </div>

        {/* Chat Header */}
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
          <div className="w-10 h-10 rounded-full bg-orange-950/80 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold">
            💰
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1">
              <span>Recruiter Sarah (Global Tech Careers)</span>
              <span className="text-[9px] px-1 rounded bg-slate-800 text-slate-400 font-mono">UNVERIFIED</span>
            </div>
            <div className="text-[10px] text-slate-400">+1 (800) 555-0199 • Telegram Direct</div>
          </div>
        </div>

        {/* Chat Dialogue Bubbles */}
        <div className="space-y-3 p-2 text-xs">
          <div className="p-3 rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 text-slate-300 max-w-[85%] space-y-1">
            <p>
              Hi there! We reviewed your background and selected you for a remote AI Data Reviewer position ($65/hr).
            </p>
            <span className="text-[9px] text-slate-500 block text-right">09:40</span>
          </div>

          <div
            onClick={() => {
              const c = clues.find((x) => x.location.toLowerCase().includes('message') || x.name.toLowerCase().includes('advance') || x.name.toLowerCase().includes('fee') || x.name.toLowerCase().includes('upfront')) || clues[0];
              if (c) handleClueClick(c);
            }}
            className="p-3 rounded-2xl rounded-tl-none bg-orange-950/40 border border-orange-500/40 text-orange-200 max-w-[90%] space-y-2 cursor-pointer hover:bg-orange-950/60 transition-colors group"
          >
            <p className="leading-relaxed">
              Before your hardware kit is dispatched, company policy requires an onboarding equipment security deposit of $350 via Apple Pay, Zelle, or Crypto transfer. This will be refunded 100% in your first paycheck!
            </p>
            <div className="flex items-center justify-between text-[10px] text-cyan-400 border-t border-orange-500/20 pt-1">
              <span>Click to inspect upfront fee red flag</span>
              <Search className="w-3 h-3" />
            </div>
          </div>

          <div
            onClick={() => {
              const c = clues.find((x) => x.location.toLowerCase().includes('otp') || x.name.toLowerCase().includes('code') || x.name.toLowerCase().includes('verification')) || clues[1] || clues[0];
              if (c) handleClueClick(c);
            }}
            className="p-3 rounded-2xl rounded-tl-none bg-red-950/40 border border-red-500/40 text-red-200 max-w-[90%] space-y-2 cursor-pointer hover:bg-red-950/60 transition-colors group"
          >
            <p className="leading-relaxed">
              Also, we just sent a 6-digit confirmation code to your phone to activate your corporate payroll profile. Please reply with that code right now!
            </p>
            <div className="flex items-center justify-between text-[10px] text-cyan-400 border-t border-red-500/20 pt-1">
              <span>Click to inspect OTP intercept attempt</span>
              <Search className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Brief */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 space-y-2">
        <div className="text-orange-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <MessageSquare className="w-4 h-4" /> SCENARIO INTEL // SOCIAL FRAUD ENGINE
        </div>
        <p className="leading-relaxed">{challenge.scenario}</p>
      </div>

      {/* Tactical Decision Gate */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="cyber-font text-base sm:text-lg font-bold text-slate-100">
            TACTICAL DEFENSE SELECTION:
          </span>
          <span className="text-xs text-slate-400 font-mono">Select your defensive action:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {challenge.options.map((opt, idx) => {
            const isSelected = selectedOpt === opt.id;
            return (
              <button
                key={opt.id}
                disabled={isSubmitting}
                onClick={() => handleOptionSubmit(opt.id)}
                className={`p-4 rounded-xl text-left border transition-all cursor-pointer flex items-start gap-3 ${
                  isSelected
                    ? 'bg-orange-950/60 border-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-xs text-orange-400">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm font-semibold text-slate-200 leading-snug">
                    {opt.text}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
