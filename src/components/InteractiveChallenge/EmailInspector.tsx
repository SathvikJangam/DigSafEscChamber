import React, { useState } from 'react';
import {
  Mail,
  AlertTriangle,
  Search,
  ExternalLink,
  ShieldCheck,
  Check,
  FileText,
  Clock,
  Send,
  Eye,
  Info
} from 'lucide-react';
import { Challenge, ChallengeClue } from '../../types';
import { soundService } from '../../services/sound';

interface EmailInspectorProps {
  challenge: Challenge;
  discoveredClues: string[];
  onDiscoverClue: (clueId: string) => void;
  onSelectOption: (optionId: string) => void;
  onUseHint: () => void;
  hintsUsed: number;
  hintText?: string;
  isSubmitting?: boolean;
}

export const EmailInspector: React.FC<EmailInspectorProps> = ({
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
  const [hoveredLink, setHoveredLink] = useState(false);
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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/30">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan-400" />
          <span className="text-xs text-slate-300 font-bold tracking-wide">
            INVESTIGATION MODE:
          </span>
          <span className="text-xs text-cyan-400">
            Click suspicious elements in the email to uncover hidden threat markers!
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-bold">
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

      {/* Hint Alert if requested */}
      {hintText && (
        <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/50 text-amber-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>CYBER ADVISORY: {hintText}</span>
        </div>
      )}

      {/* Active Discovered Clue Modal/Drawer */}
      {activeInspectorClue && (
        <div className="p-3.5 rounded-xl bg-cyan-950/60 border border-cyan-400/60 text-xs text-slate-200 flex items-start justify-between gap-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] animate-fadeIn">
          <div className="space-y-1">
            <div className="text-cyan-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
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

      {/* Interactive Email Client Window */}
      <div className="rounded-2xl bg-slate-950/90 border border-slate-700 overflow-hidden shadow-2xl">
        {/* Email Client Header Bar */}
        <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-slate-400 font-sans ml-2 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> SecureMail v4.8 (Enterprise Inbox)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">ENCRYPTED AT REST // TLS 1.3</span>
        </div>

        {/* Email Metadata Headers */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/50 space-y-2.5 text-xs">
          {/* Sender */}
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-slate-400 w-16">FROM:</span>
            <div
              onClick={() => {
                const c = clues.find((x) => x.location.toLowerCase().includes('sender') || x.location.toLowerCase().includes('domain'));
                if (c) handleClueClick(c);
              }}
              className="px-2 py-1 rounded bg-slate-800/90 border border-slate-700 hover:border-cyan-400 hover:bg-cyan-950/40 cursor-pointer text-slate-200 flex items-center gap-1.5 transition-colors group"
            >
              <span className="font-semibold text-slate-100">Global IT Security Team</span>
              <span className="text-amber-400/90 group-hover:text-amber-300 font-mono">
                &lt;security-alert@corp-support-verification-gate.xyz&gt;
              </span>
              <Search className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
            </div>
          </div>

          {/* Recipient */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-16">TO:</span>
            <span className="text-slate-300">target-employee@enterprise.com</span>
          </div>

          {/* Date & Subject */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-16">DATE:</span>
            <span className="text-slate-400">Today, 09:41 AM (Received 3 mins ago)</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 w-16">SUBJECT:</span>
            <div
              onClick={() => {
                const c = clues.find((x) => x.location.toLowerCase().includes('subject') || x.location.toLowerCase().includes('urgency') || x.location.toLowerCase().includes('countdown'));
                if (c) handleClueClick(c);
              }}
              className="font-bold text-red-400 hover:text-red-300 cursor-pointer hover:underline flex items-center gap-1.5 group"
            >
              <span>URGENT: Corporate Account Deactivation Within 4 Hours!</span>
              <Search className="w-3 h-3 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {/* Email Body Content */}
        <div className="p-5 sm:p-7 space-y-5 text-sm text-slate-300 bg-[#090d16]">
          {/* Urgent Warning Banner */}
          <div
            onClick={() => {
              const c = clues.find((x) => x.location.toLowerCase().includes('urgency') || x.location.toLowerCase().includes('countdown'));
              if (c) handleClueClick(c);
            }}
            className="p-3 rounded-lg bg-red-950/40 border border-red-500/50 flex items-center justify-between gap-3 text-red-300 cursor-pointer hover:bg-red-950/60 transition-colors group"
          >
            <div className="flex items-center gap-2 text-xs font-bold">
              <Clock className="w-4 h-4 text-red-400 animate-pulse" />
              <span>TIME CRITICAL: Complete re-verification within 03:59:12 or access will be permanently revoked.</span>
            </div>
            <span className="text-[10px] text-cyan-400 group-hover:underline">Click to inspect urgency →</span>
          </div>

          <div className="space-y-3 font-sans leading-relaxed text-slate-300 text-sm">
            <p>Dear Valued Employee,</p>
            <p>
              Our Central Security Operations system detected an anomalous login attempt from an unrecognized IP address in Bucharest, Romania. To safeguard corporate trade secrets, your enterprise single-sign-on (SSO) profile has been placed under temporary restriction.
            </p>
            <p>
              You are required to verify your enterprise credentials and submit your current two-factor authorization token immediately using our internal portal below:
            </p>
          </div>

          {/* Deceptive Call-to-Action Link / Button */}
          <div className="py-2">
            <div
              onMouseEnter={() => setHoveredLink(true)}
              onMouseLeave={() => setHoveredLink(false)}
              onClick={() => {
                const c = clues.find((x) => x.location.toLowerCase().includes('link') || x.location.toLowerCase().includes('url') || x.location.toLowerCase().includes('hyperlink'));
                if (c) handleClueClick(c);
              }}
              className="inline-block relative cursor-pointer"
            >
              <div className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-sans font-semibold text-sm shadow-md transition-colors flex items-center gap-2">
                <span>RE-VERIFY EMPLOYEE CREDENTIALS</span>
                <ExternalLink className="w-4 h-4" />
              </div>

              {/* URL Hover Preview (Crucial Cybersecurity Simulation) */}
              {hoveredLink && (
                <div className="absolute left-0 -bottom-10 z-20 px-3 py-1.5 rounded bg-slate-900 border border-red-500 text-[11px] font-mono text-red-300 shadow-xl whitespace-nowrap flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                  <span>Real Destination: http://harvest-auth.credential-phish.net/sso/login.php</span>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-2">
              (Hover over the button above to examine the real destination URL)
            </p>
          </div>

          {/* Suspicious Attachment */}
          <div
            onClick={() => {
              const c = clues.find((x) => x.location.toLowerCase().includes('attachment'));
              if (c) handleClueClick(c);
            }}
            className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 hover:border-cyan-400 cursor-pointer flex items-center justify-between gap-3 text-xs transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-red-400" />
              <div>
                <span className="font-semibold text-slate-200">Attachment: Security_Guidelines_Mandatory.pdf.exe</span>
                <span className="text-[10px] text-slate-500 block font-mono">Size: 4.2 MB // Double file extension!</span>
              </div>
            </div>
            <span className="text-cyan-400 text-[10px] group-hover:underline">Inspect file header →</span>
          </div>

          <p className="text-xs text-slate-500 font-sans border-t border-slate-800/80 pt-3">
            IT Operations & Cyber Defense Division • Enterprise Trust Group • Automated Dispatch
          </p>
        </div>
      </div>

      {/* Tactical Decision Gate */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <span className="cyber-font text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
            <span>TACTICAL DEFENSE SELECTION:</span>
          </span>
          <span className="text-xs text-slate-400 font-mono">Select your defensive response:</span>
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
                    ? 'bg-cyan-950/60 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-xs text-cyan-400">
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
