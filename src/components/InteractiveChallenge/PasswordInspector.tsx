import React, { useState } from 'react';
import {
  Lock,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Cpu,
  Search,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Challenge, ChallengeClue } from '../../types';
import { soundService } from '../../services/sound';
import { api } from '../../services/api';

interface PasswordInspectorProps {
  challenge: Challenge;
  discoveredClues: string[];
  onDiscoverClue: (clueId: string) => void;
  onSelectOption: (optionId: string) => void;
  onUseHint: () => void;
  hintsUsed: number;
  hintText?: string;
  isSubmitting?: boolean;
}

export const PasswordInspector: React.FC<PasswordInspectorProps> = ({
  challenge,
  discoveredClues,
  onDiscoverClue,
  onSelectOption,
  onUseHint,
  hintsUsed,
  hintText,
  isSubmitting
}) => {
  const [activeTab, setActiveTab] = useState<'candidates' | 'terminal'>('candidates');
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [activeInspectorClue, setActiveInspectorClue] = useState<ChallengeClue | null>(null);

  // Terminal Override live state
  const [overrideInput, setOverrideInput] = useState('');
  const [terminalScore, setTerminalScore] = useState<number>(0);
  const [terminalFeedback, setTerminalFeedback] = useState<{
    warning: string;
    suggestions: string[];
    crackTime: string;
    entropy: number;
    verdict: string;
  } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Handle typing evaluation
  const handlePasswordTyping = async (text: string) => {
    setOverrideInput(text);
    if (!text.trim()) {
      setTerminalScore(0);
      setTerminalFeedback(null);
      return;
    }
    setIsEvaluating(true);
    try {
      const res = await api.analyzePassword(text);
      setTerminalScore(res.score);
      setTerminalFeedback({
        warning: res.feedback.warning,
        suggestions: res.feedback.suggestions,
        crackTime: res.crackTimesDisplay.offlineSlowHashing1e4PerSecond,
        entropy: res.entropy,
        verdict: res.verdict
      });
    } catch {
      // Offline fallback heuristic estimation
      let s = 0;
      if (text.length >= 12) s += 2;
      else if (text.length >= 8) s += 1;
      if (/[A-Z]/.test(text) && /[a-z]/.test(text)) s += 1;
      if (/[0-9]/.test(text) && /[^A-Za-z0-9]/.test(text)) s += 1;
      const scoreClamped = Math.min(4, s);
      setTerminalScore(scoreClamped);
      setTerminalFeedback({
        warning: scoreClamped < 3 ? 'Weak length or predictable character set' : 'Strong pattern',
        suggestions: ['Use 4+ random words or passphrases with varied symbols.'],
        crackTime: scoreClamped >= 3 ? 'Centuries' : 'Few minutes',
        entropy: text.length * 4,
        verdict: scoreClamped >= 3 ? 'TERMINAL_OVERRIDE_PERMITTED' : 'ACCESS_DENIED_LOW_ENTROPY'
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleExecuteOverride = async () => {
    if (!overrideInput.trim()) return;
    soundService.playClick();
    try {
      const res = await api.overridePasswordTerminal(overrideInput);
      if (res.success) {
        soundService.playCorrect();
        setOverrideMessage({ success: true, text: `✓ ${res.message} (+${res.xpAwarded} XP)` });
        // Automatically select the correct option if available
        const correctOpt = challenge.options.find((o) => o.isCorrect);
        if (correctOpt) {
          setTimeout(() => {
            onSelectOption(correctOpt.id);
          }, 1200);
        }
      }
    } catch (err: unknown) {
      soundService.playWrong();
      const msg = err instanceof Error ? err.message : 'Terminal rejected password. Score must be at least 3/4.';
      setOverrideMessage({ success: false, text: `🚨 ${msg}` });
    }
  };

  // Password analysis samples for interactive simulator
  const samplePasswords = [
    {
      text: 'Summer2026!',
      entropy: 34,
      crackTime: '0.8 seconds (GPU Brute-force)',
      vulnerabilities: ['Common seasonal dictionary word', 'Predictable capitalization & trailing digit'],
      rating: 'CRITICAL VULNERABILITY',
      color: 'text-red-400',
      border: 'border-red-500/40'
    },
    {
      text: 'P@$$w0rd123!',
      entropy: 42,
      crackTime: '3.4 minutes (Hashcat dictionary list)',
      vulnerabilities: ['Standard character substitutions (leetspeak)', 'Sequential numbers'],
      rating: 'HIGH RISK',
      color: 'text-amber-400',
      border: 'border-amber-500/40'
    },
    {
      text: 'timber-galaxy-whisper-origami-77',
      entropy: 94,
      crackTime: '8.4 Trillion Years (Quantum resistant)',
      vulnerabilities: ['Zero dictionary chaining vulnerabilities', 'High character length (32 chars)'],
      rating: 'FORTRESS CLASS (SAFE)',
      color: 'text-emerald-400',
      border: 'border-emerald-500/40'
    }
  ];

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
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/30">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-300 font-bold tracking-wide">
            GPU BRUTE-FORCE & ENTROPY LAB:
          </span>
          <span className="text-xs text-emerald-400">
            Click password candidates below to inspect entropy & dictionary vulnerabilities!
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-bold">
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
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-400/60 text-xs text-slate-200 flex items-start justify-between gap-3 shadow-[0_0_20px_rgba(16,185,129,0.2)] animate-fadeIn">
          <div className="space-y-1">
            <div className="text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              THREAT MARKER ANALYZED: {activeInspectorClue.name}
            </div>
            <p className="text-slate-300">{activeInspectorClue.description}</p>
            <div className="text-[10px] text-cyan-400 font-semibold">
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

      {/* Scenario Brief */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 space-y-2">
        <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <Lock className="w-4 h-4" /> SCENARIO INTEL // CREDENTIAL SECURITY GATEWAY
        </div>
        <p className="leading-relaxed">{challenge.scenario}</p>
      </div>

      {/* Mode / Format Switcher */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => {
            soundService.playClick();
            setActiveTab('candidates');
          }}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
            activeTab === 'candidates'
              ? 'border-emerald-400 text-emerald-300 bg-emerald-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          FORMAT A: CANDIDATE INSPECTOR
        </button>
        <button
          onClick={() => {
            soundService.playClick();
            setActiveTab('terminal');
          }}
          className={`px-4 py-2 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 ${
            activeTab === 'terminal'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          FORMAT B: TERMINAL OVERRIDE (ZXCVBN LIVE)
        </button>
      </div>

      {activeTab === 'candidates' ? (
        /* Interactive Entropy & Crack-Time Simulator Cards */
        <div className="space-y-3">
          <div className="text-xs text-slate-400 uppercase tracking-wider font-bold">
            INTERACTIVE CANDIDATE TELEMETRY (CLICK TO INVESTIGATE):
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {samplePasswords.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  const c = clues[i] || clues[0];
                  if (c) handleClueClick(c);
                }}
                className={`p-4 rounded-xl bg-slate-950/90 border ${item.border} hover:scale-[1.02] cursor-pointer transition-all space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-bold">CANDIDATE #{i + 1}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-900 ${item.color}`}>
                    {item.rating}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-slate-100 bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 break-all">
                  {item.text}
                </div>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Entropy Bits:</span>
                    <span className="font-bold text-slate-200">{item.entropy} bits</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Crack Time:</span>
                    <span className={`font-bold ${item.color}`}>{item.crackTime}</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-900 text-[11px] text-cyan-400 flex items-center justify-between">
                  <span>Inspect pattern flaws</span>
                  <Search className="w-3 h-3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Terminal Override Mode (zxcvbn live engine) */
        <div className="space-y-4 p-4 rounded-xl bg-slate-950 border border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-cyan-400 font-bold tracking-wider">
              <KeyRound className="w-4 h-4 text-cyan-400" />
              <span>TERMINAL OVERRIDE GATE // LIVE ZXCVBN ENTROPY EVALUATOR</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono">
              THRESHOLD REQUIRED: SCORE ≥ 3/4
            </span>
          </div>

          <p className="text-xs text-slate-300">
            Type an ultra-secure passphrase into the terminal to bypass this locked security gateway.
            Dropbox's <span className="text-cyan-400 font-semibold">zxcvbn algorithm</span> analyzes dictionary words, leetspeak, keyboard spatial sequences, and entropy in real time!
          </p>

          <div className="space-y-2">
            <div className="relative">
              <input
                type="text"
                value={overrideInput}
                onChange={(e) => handlePasswordTyping(e.target.value)}
                placeholder="e.g. correct-horse-battery-staple or secure-passphrase..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-cyan-300 font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />
              {isEvaluating && (
                <div className="absolute right-3 top-2.5 text-[11px] text-slate-400 animate-pulse">
                  Analyzing...
                </div>
              )}
            </div>

            {/* Score 0 to 4 meter */}
            <div className="space-y-1">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>Entropy Score: {terminalScore} / 4</span>
                <span className={terminalScore >= 3 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                  {terminalScore === 0 && 'CRITICAL VULNERABILITY'}
                  {terminalScore === 1 && 'VERY WEAK'}
                  {terminalScore === 2 && 'MODERATE (GUESSABLE)'}
                  {terminalScore === 3 && 'STRONG (OVERRIDE READY)'}
                  {terminalScore === 4 && 'FORTRESS CLASS (UNCRACKABLE)'}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-2">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full rounded-sm transition-all duration-300 ${
                      terminalScore >= step
                        ? step <= 2
                          ? 'bg-red-500'
                          : step === 3
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Feedback & Crack Time details */}
          {terminalFeedback && (
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Estimated Crack Time:</span>
                <span className="font-bold text-cyan-300 font-mono">{terminalFeedback.crackTime}</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Calculated Entropy:</span>
                <span className="font-bold text-slate-200 font-mono">{terminalFeedback.entropy} bits</span>
              </div>
              {terminalFeedback.warning && (
                <div className="text-amber-400 flex items-start gap-1.5 pt-1 border-t border-slate-800">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{terminalFeedback.warning}</span>
                </div>
              )}
              {terminalFeedback.suggestions?.length > 0 && (
                <div className="text-slate-400 text-[11px]">
                  Tip: {terminalFeedback.suggestions.join(' ')}
                </div>
              )}
            </div>
          )}

          {overrideMessage && (
            <div
              className={`p-3 rounded-lg text-xs font-mono flex items-center justify-between ${
                overrideMessage.success
                  ? 'bg-emerald-950/60 border border-emerald-500/60 text-emerald-300'
                  : 'bg-red-950/60 border border-red-500/60 text-red-300'
              }`}
            >
              <span>{overrideMessage.text}</span>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={handleExecuteOverride}
              disabled={terminalScore < 3 || isSubmitting}
              className={`px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                terminalScore >= 3
                  ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:brightness-110 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>EXECUTE TERMINAL OVERRIDE</span>
            </button>
          </div>
        </div>
      )}

      {/* Tactical Decision Gate */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="cyber-font text-base sm:text-lg font-bold text-slate-100">
            TACTICAL DEFENSE SELECTION:
          </span>
          <span className="text-xs text-slate-400 font-mono">Select your verified action:</span>
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
                    ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-xs text-emerald-400">
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
