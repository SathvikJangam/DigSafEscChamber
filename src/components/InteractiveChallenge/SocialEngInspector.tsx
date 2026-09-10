import React, { useState } from 'react';
import {
  PhoneCall,
  Mic,
  Volume2,
  AlertTriangle,
  Search,
  Check,
  ShieldCheck,
  Users,
  Radio,
  Info
} from 'lucide-react';
import { Challenge, ChallengeClue } from '../../types';
import { soundService } from '../../services/sound';

interface SocialEngInspectorProps {
  challenge: Challenge;
  discoveredClues: string[];
  onDiscoverClue: (clueId: string) => void;
  onSelectOption: (optionId: string) => void;
  onUseHint: () => void;
  hintsUsed: number;
  hintText?: string;
  isSubmitting?: boolean;
}

export const SocialEngInspector: React.FC<SocialEngInspectorProps> = ({
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-purple-500/30">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-slate-300 font-bold tracking-wide">
            VOIP INTERCEPTION & SOCIAL ENGINEERING DETECTOR:
          </span>
          <span className="text-xs text-purple-400">
            Analyze the live telecom voice stream for authority pressure and protocol violations!
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
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
        <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-400/60 text-xs text-slate-200 flex items-start justify-between gap-3 shadow-[0_0_20px_rgba(168,85,247,0.2)] animate-fadeIn">
          <div className="space-y-1">
            <div className="text-purple-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
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

      {/* Telecom Voice Call Simulator Console */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 space-y-6">
        {/* Call Status Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center text-red-400 animate-pulse">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-100 flex items-center gap-2">
                <span>INCOMING TELECOM // CALLER ID: "Internal IT Helpdesk"</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/40">
                  UNTRUSTED TRUNK
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Line 1 • Duration: 01:24 • Codec: G.711 VoIP
              </div>
            </div>
          </div>

          {/* Animated Audio Frequency Waves */}
          <div className="flex items-end gap-1 h-6">
            {[40, 70, 95, 30, 80, 60, 100, 45, 85, 35, 90, 50].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-purple-400/80 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 4) * 0.2}s`
                }}
              />
            ))}
          </div>
        </div>

        {/* Live Call Transcript with Interactive Red Flag Zones */}
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3 text-xs leading-relaxed">
          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5 text-purple-400" /> LIVE VOIP AUDIO TRANSCRIPTION
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-300">
            <span className="text-purple-400 font-bold">Caller: </span>
            "Hey! This is Dave from Corporate Tier-3 Infrastructure. Look, we have an emergency server migration happening right now."
          </div>

          <div
            onClick={() => {
              const c = clues.find((x) => x.name.toLowerCase().includes('authority') || x.name.toLowerCase().includes('intimidation') || x.description.toLowerCase().includes('executive')) || clues[0];
              if (c) handleClueClick(c);
            }}
            className="p-3 rounded-lg bg-red-950/30 border border-red-500/40 text-red-200 cursor-pointer hover:bg-red-950/50 transition-colors group"
          >
            <span className="text-red-400 font-bold">Caller: </span>
            "The Chief Information Officer is standing right over my shoulder and demanding this be patched in 10 minutes or people are going to get written up!"
            <div className="flex items-center justify-between text-[10px] text-cyan-400 pt-1.5 mt-1.5 border-t border-red-500/20">
              <span>Click to inspect Executive Authority Intimidation marker</span>
              <Search className="w-3 h-3" />
            </div>
          </div>

          <div
            onClick={() => {
              const c = clues.find((x) => x.name.toLowerCase().includes('mfa') || x.name.toLowerCase().includes('token') || x.name.toLowerCase().includes('ticket') || x.name.toLowerCase().includes('push')) || clues[1] || clues[0];
              if (c) handleClueClick(c);
            }}
            className="p-3 rounded-lg bg-purple-950/30 border border-purple-500/40 text-purple-200 cursor-pointer hover:bg-purple-950/50 transition-colors group"
          >
            <span className="text-purple-400 font-bold">Caller: </span>
            "I'm sending an MFA push notification to your phone right now. You just need to tap 'Approve' or read me your One-Time Password so I can bypass the active lockout."
            <div className="flex items-center justify-between text-[10px] text-cyan-400 pt-1.5 mt-1.5 border-t border-purple-500/20">
              <span>Click to inspect MFA fatigue / Out-of-band bypass marker</span>
              <Search className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Brief */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 space-y-2">
        <div className="text-purple-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4" /> SCENARIO INTEL // SOCIAL PRETEXTING
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
                    ? 'bg-purple-950/60 border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-xs text-purple-400">
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
