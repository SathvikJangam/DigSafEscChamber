import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, Lock, Terminal, ArrowRight, Zap, AlertTriangle, Radio } from 'lucide-react';
import { soundService } from '../services/sound';
import { GAME_ENVIRONMENTS } from '../services/environments';

interface CinematicIntroProps {
  onEnter: () => void;
  onSkip?: () => void;
}

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onEnter, onSkip }) => {
  const [step, setStep] = useState(0);
  const bgEnv = GAME_ENVIRONMENTS.containment_breach;

  useEffect(() => {
    // Timed cinematic progression
    const timer1 = setTimeout(() => {
      setStep(1); // System locked
      soundService.playAlarm();
    }, 600);

    const timer2 = setTimeout(() => {
      setStep(2); // Unknown threat detected
      soundService.playWrong();
    }, 2200);

    const timer3 = setTimeout(() => {
      setStep(3); // Mission prompt & enter button
      soundService.playCorrect();
    }, 3800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleEnterClick = () => {
    soundService.playClick();
    soundService.playStart ? soundService.playCombo() : soundService.playCorrect();
    onEnter();
  };

  return (
    <div className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-8">
      {/* Realistic Breach Containment Background Photo */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <img
          src={bgEnv.imageUrl}
          alt="Emergency Containment Sector"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.25] contrast-130 saturate-120"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-[#07050a]/85 to-black/95" />
        <div className="absolute inset-0 game-vignette-heavy" />
        <div className="absolute inset-0 game-scanlines opacity-25" />
      </div>

      {/* Skip button for quick testing */}
      {onSkip && (
        <button
          onClick={onSkip}
          className="absolute top-6 right-6 text-xs font-tactical text-slate-400 hover:text-cyan-300 z-30 transition-colors uppercase tracking-widest bg-black/60 px-3 py-1 rounded border border-slate-700/60 backdrop-blur-md"
        >
          [ SKIP INTRO → ]
        </button>
      )}

      <div className="relative z-10 max-w-2xl w-full text-center flex flex-col items-center">
        {/* Revolving Cyber Vault Lock */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="relative w-36 h-36 sm:w-44 sm:h-44 mb-8 flex items-center justify-center"
        >
          {/* Outer rotating ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40 animate-[spin_20s_linear_infinite]" />
          {/* Middle counter-rotating ring */}
          <div className="absolute inset-3 rounded-full border border-red-500/40 animate-[spin_12s_linear_infinite_reverse]" />
          {/* Inner ring */}
          <div className="absolute inset-6 rounded-full border-2 border-cyan-400/60 bg-black/90 flex items-center justify-center cyber-box-glow">
            {step < 2 ? (
              <Lock className="w-12 h-12 text-red-500 animate-pulse drop-shadow-[0_0_15px_rgba(239,68,68,0.9)]" />
            ) : (
              <ShieldAlert className="w-12 h-12 text-cyan-400 animate-bounce drop-shadow-[0_0_15px_rgba(6,182,212,0.9)]" />
            )}
          </div>
          {/* HUD status crosshairs */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-400" />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-cyan-400" />
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-1 h-4 bg-cyan-400" />
          <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-1 h-4 bg-cyan-400" />
        </motion.div>

        {/* Cinematic Status Prompts */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-red-950/70 border border-red-500/50 text-red-400 font-tactical text-xs tracking-widest uppercase backdrop-blur-md">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                DEFENSE GRID COMPROMISED // INTRUSION DETECTED
              </div>
              <h2 className="font-game text-3xl sm:text-6xl font-black text-red-500 tracking-wider drop-shadow-[0_0_25px_rgba(239,68,68,0.6)] uppercase">
                SYSTEM LOCKED
              </h2>
              <p className="font-body text-sm sm:text-base text-slate-300 max-w-md mx-auto">
                Authentication protocols suspended. Emergency containment barriers activated.
              </p>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-3"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-950/70 border border-amber-500/50 text-amber-400 font-tactical text-xs tracking-widest uppercase backdrop-blur-md">
                <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
                ACTIVE INTRUSION CORRELATION
              </div>
              <h2 className="font-game text-3xl sm:text-5xl font-black text-amber-400 tracking-wider drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] uppercase">
                UNKNOWN THREAT DETECTED
              </h2>
              <p className="font-body text-sm sm:text-base text-slate-200 max-w-md mx-auto">
                Multi-vector cyber threat payload propagating across enterprise subnets.
              </p>
            </motion.div>
          )}

          {step >= 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6 w-full"
            >
              <div className="p-5 sm:p-7 rounded-2xl game-backdrop-panel border border-cyan-500/40 text-left shadow-2xl">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
                  <span className="text-xs text-cyan-400 flex items-center gap-1.5 font-tactical font-bold tracking-widest uppercase">
                    <Zap className="w-3.5 h-3.5 text-cyan-400" /> MISSION DIRECTIVE: CLASSIFIED
                  </span>
                  <span className="text-[11px] text-slate-400 font-tactical uppercase tracking-wider">
                    CONTAINMENT PROTOCOL READY
                  </span>
                </div>

                <div className="space-y-3 text-slate-200 leading-relaxed">
                  <p className="text-cyan-300 font-bold text-lg font-game tracking-wide uppercase">
                    YOUR SURVIVAL DIRECTIVE:
                  </p>
                  <ul className="space-y-2.5 text-slate-200 pl-4 border-l-2 border-cyan-500/40 font-body text-sm sm:text-base">
                    <li className="flex items-center gap-2.5">
                      <span className="text-cyan-400 font-game font-bold text-base">01.</span>
                      <span><strong>IDENTIFY THE THREATS</strong> in realistic phishing emails, password vaults, and QR kiosks.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-amber-400 font-game font-bold text-base">02.</span>
                      <span><strong>SURVIVE THE ATTACKS</strong> with 3 lives. Avoid traps, calculate entropy, and outsmart social engineers.</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <span className="text-emerald-400 font-game font-bold text-base">03.</span>
                      <span><strong>ESCAPE THE SYSTEM</strong> to unlock your Certified Cyber Safety Score and top the leaderboards.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Enter Button */}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEnterClick}
                className="w-full sm:w-auto px-10 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-black font-black font-game text-lg tracking-wider shadow-[0_0_35px_rgba(6,182,212,0.6)] hover:shadow-[0_0_50px_rgba(6,182,212,0.9)] transition-all flex items-center justify-center gap-3 mx-auto cursor-pointer clip-tactical"
              >
                <span>ENTER THE ESCAPE ROOM</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
