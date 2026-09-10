import React, { useState } from 'react';
import {
  QrCode,
  Scan,
  AlertTriangle,
  Search,
  Check,
  ShieldAlert,
  ShieldCheck,
  ExternalLink,
  Smartphone,
  Eye,
  Info
} from 'lucide-react';
import { Challenge, ChallengeClue } from '../../types';
import { soundService } from '../../services/sound';

interface QRInspectorProps {
  challenge: Challenge;
  discoveredClues: string[];
  onDiscoverClue: (clueId: string) => void;
  onSelectOption: (optionId: string) => void;
  onUseHint: () => void;
  hintsUsed: number;
  hintText?: string;
  isSubmitting?: boolean;
}

export const QRInspector: React.FC<QRInspectorProps> = ({
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
  const [isPeeled, setIsPeeled] = useState(false);
  const [isScanned, setIsScanned] = useState(false);
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

  const handlePeel = () => {
    soundService.playClick();
    setIsPeeled(true);
    const c = clues.find((x) => x.location.toLowerCase().includes('sticker') || x.name.toLowerCase().includes('tamper')) || clues[0];
    if (c) handleClueClick(c);
  };

  const handleScanPreview = () => {
    soundService.playClick();
    setIsScanned(true);
    const c = clues.find((x) => x.location.toLowerCase().includes('url') || x.name.toLowerCase().includes('domain') || x.name.toLowerCase().includes('http')) || clues[1] || clues[0];
    if (c) handleClueClick(c);
  };

  const handleOptionSubmit = (optId: string) => {
    setSelectedOpt(optId);
    soundService.playClick();
    onSelectOption(optId);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Top Threat Intelligence Banner */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/30">
        <div className="flex items-center gap-2">
          <QrCode className="w-4 h-4 text-amber-400" />
          <span className="text-xs text-slate-300 font-bold tracking-wide">
            QUISHING & PHYSICAL TAMPER INSPECTION:
          </span>
          <span className="text-xs text-amber-400">
            Examine the physical meter and scan payload for sticker overlays and rogue URLs!
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs px-2.5 py-1 rounded bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
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
        <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-400/60 text-xs text-slate-200 flex items-start justify-between gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-fadeIn">
          <div className="space-y-1">
            <div className="text-amber-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
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

      {/* Physical Terminal & Viewfinder Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Asset Graphic (Parking Meter / Poster) */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-3 left-3 text-[10px] text-slate-500 font-bold uppercase">
            PHYSICAL SURFACE EVIDENCE // METER #402
          </div>

          <div className="w-56 p-4 rounded-xl bg-slate-900 border-2 border-slate-700 shadow-2xl relative my-4">
            <div className="text-xs font-bold text-slate-200 mb-2">CITY METRO PARKING</div>
            <p className="text-[10px] text-slate-400 mb-3">Scan to pay meter quickly via smartphone</p>

            {/* QR Sticker Container with interactive peel */}
            <div className="relative mx-auto w-32 h-32 bg-white rounded-lg p-2.5 flex items-center justify-center shadow-inner">
              {/* Fake QR graphic matrix */}
              <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-slate-100">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`rounded-[1px] ${
                      [0, 1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24].includes(i)
                        ? 'bg-black'
                        : 'bg-slate-300'
                    }`}
                  />
                ))}
              </div>

              {/* Physical Overlay Sticker indicator */}
              <div
                className={`absolute inset-0 rounded-lg border-2 border-dashed border-red-500/80 bg-red-950/20 backdrop-blur-[1px] flex flex-col items-center justify-center p-1 transition-all ${
                  isPeeled ? 'translate-x-3 translate-y-3 rotate-6' : ''
                }`}
              >
                <span className="text-[9px] font-bold text-red-400 bg-black/80 px-1 py-0.5 rounded">
                  {isPeeled ? 'ADHESIVE STICKER PEEL' : 'TACTILE OVERLAY'}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                onClick={handlePeel}
                className="px-3 py-1.5 rounded bg-red-950/80 border border-red-500/50 hover:bg-red-900 text-red-300 text-xs font-bold transition-all"
              >
                [ PEEL / EXAMINE EDGES ]
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
            Notice how the QR code feels slightly raised. A glossy adhesive label has been placed over the official municipal screen.
          </p>
        </div>

        {/* Smartphone Camera Scanner Payload Preview */}
        <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center relative">
          <div className="absolute top-3 left-3 text-[10px] text-slate-500 font-bold uppercase">
            SMARTPHONE VIEWFINDER // URL DECODER
          </div>

          <div className="w-64 rounded-2xl bg-slate-900 border border-slate-700 p-4 shadow-xl space-y-4 my-2">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5 text-cyan-400" /> Camera 1X
              </span>
              <span className="text-emerald-400 font-bold">QR RECOGNIZED</span>
            </div>

            {/* Viewfinder reticle */}
            <div className="relative h-32 border border-cyan-500/40 rounded-lg flex items-center justify-center bg-cyan-950/10">
              <Scan className="w-12 h-12 text-cyan-400 animate-pulse" />
              <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />
            </div>

            {/* Decoded URL Banner */}
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-left space-y-1">
              <div className="text-[10px] text-slate-400 font-bold">DECODED DESTINATION:</div>
              <div className="text-xs text-red-400 font-mono break-all font-bold">
                http://fast-meter-pay.cc/auth?meter=402
              </div>
              <div className="text-[10px] text-amber-400 pt-1 border-t border-slate-900">
                ⚠️ Warning: Insecure HTTP & Non-Government TLD (.cc instead of .gov)
              </div>
            </div>

            <button
              onClick={handleScanPreview}
              className="w-full py-2 rounded bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900 text-cyan-300 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Search className="w-3.5 h-3.5" />
              <span>INSPECT URL PROTOCOL & TLD</span>
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Brief */}
      <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-sm text-slate-300 space-y-2">
        <div className="text-amber-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> SCENARIO INTEL // PHYSICAL CYBER ATTACK
        </div>
        <p className="leading-relaxed">{challenge.scenario}</p>
      </div>

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
                    ? 'bg-amber-950/60 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-xs text-amber-400">
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
