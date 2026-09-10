import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ShieldCheck,
  Copy,
  Check,
  X,
  Share2,
  Award,
  Lock,
  QrCode,
  Flame,
  Zap
} from 'lucide-react';
import { User } from '../types';
import { soundService } from '../services/sound';

interface ShareCardModalProps {
  user: User;
  onClose: () => void;
}

export const ShareCardModal: React.FC<ShareCardModalProps> = ({ user, onClose }) => {
  const [copied, setCopied] = useState(false);

  const copyShareText = () => {
    soundService.playClick();
    const shareText = `🔐 I just survived the DIGITAL SAFETY ESCAPE ROOM with a Certified Cyber Safety Score of ${user.cyberSafetyScore}/100! 
Level: ${user.level} (${user.levelTitle}) 
Threats Foiled: ${user.threatsIdentified} 
Think you can escape? Test your digital survival instincts now!`;

    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn font-mono">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-[#090e17] border border-cyan-500/40 shadow-2xl relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <span className="text-xs text-cyan-400 uppercase tracking-widest font-bold">
            [ CERTIFIED ESCAPE CERTIFICATE ]
          </span>
          <h2 className="cyber-font text-2xl font-bold text-slate-100 mt-1">
            CYBER DEFENDER CREDENTIAL
          </h2>
        </div>

        {/* Printable/Screenshot-ready Result Card */}
        <div
          id="cyber-certificate-card"
          className="p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-[#0a1220] to-slate-950 border-2 border-cyan-500/50 shadow-inner relative overflow-hidden text-left space-y-4"
        >
          {/* Cyber watermarks */}
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{user.avatar}</span>
              <div>
                <div className="text-base font-bold text-slate-100 cyber-font">
                  {user.username}
                </div>
                <div className="text-[10px] text-cyan-400 font-mono">
                  {user.campus || 'Cyber Defense Command'}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-slate-400 block font-mono">STATUS</span>
              <span className="text-xs font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                VERIFIED ESCAPEE
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-[10px] text-slate-400">OFFICIAL CYBER SAFETY SCORE</div>
              <div className="text-4xl font-extrabold text-cyan-400 cyber-font tracking-tight">
                {user.cyberSafetyScore} <span className="text-lg text-slate-500 font-mono">/100</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-slate-400">RANK & TITLE</div>
              <div className="text-sm font-bold text-emerald-400 cyber-font">
                LVL {user.level}: {user.levelTitle}
              </div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                {user.xp} TOTAL XP
              </div>
            </div>
          </div>

          {/* Mini Category Bars */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
            {Object.entries(user.categoryScores).slice(0, 4).map(([cat, score]) => (
              <div key={cat} className="flex items-center justify-between gap-2">
                <span className="text-slate-400 capitalize w-24 text-[10px] truncate">{cat.replace('_', ' ')}</span>
                <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className="text-slate-300 font-bold text-[10px] w-8 text-right">{score}%</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[9px] text-slate-500 font-mono">
            <span>DIGITAL SAFETY ESCAPE ROOM v2.5</span>
            <span>ISSUED: {new Date().toLocaleDateString()}</span>
          </div>
        </div>

        {/* Share CTA */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={copyShareText}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold cyber-font text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>COPIED SCORE TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>COPY SCORE TO SHARE</span>
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
