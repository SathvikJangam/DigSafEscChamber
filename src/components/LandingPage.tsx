import React from 'react';
import { motion } from 'motion/react';
import {
  ShieldAlert,
  Lock,
  QrCode,
  Flame,
  ArrowRight,
  BrainCircuit,
  Target,
  Sparkles,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Crosshair,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { soundService } from '../services/sound';
import { GAME_ENVIRONMENTS, MISSION_THUMBNAILS } from '../services/environments';

interface LandingPageProps {
  onEnter: () => void;
  onHowItWorks: () => void;
  onPlayDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onHowItWorks, onPlayDemo }) => {
  const bgEnv = GAME_ENVIRONMENTS.ops_bunker;

  return (
    <div className="relative min-h-screen text-slate-100 overflow-hidden">
      {/* Photorealistic Realistic Gaming Background Image with Layered Atmospheric Overlays */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <img
          src={bgEnv.imageUrl}
          alt="Tactical Cyber Command Operations Center"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105 filter brightness-[0.32] contrast-125 saturate-110"
        />
        {/* Realistic Vignette & Atmospheric Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#06080d]/85 via-[#070a12]/80 to-[#04060a]/95" />
        <div className="absolute inset-0 game-vignette" />
        <div className="absolute inset-0 game-scanlines opacity-20" />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Tactical Sector Identification Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-black/60 border border-cyan-500/40 text-cyan-300 font-tactical text-xs sm:text-sm tracking-widest uppercase backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>GLOBAL DEFENSE SECTOR 01 // VIRTUAL CONTAINMENT FACILITY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>

          {/* Main AAA Game Titles */}
          <div className="space-y-1">
            <h1 className="font-game text-4xl sm:text-7xl font-black tracking-tight uppercase leading-none drop-shadow-2xl">
              <span className="text-slate-100 block">DIGITAL SAFETY</span>
              <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent block mt-2 drop-shadow-[0_0_35px_rgba(6,182,212,0.45)]">
                ESCAPE ROOM
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="font-body text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            <strong className="text-cyan-300 font-semibold">Real-world cyber threats are relentless.</strong>{' '}
            Your training shouldn't be passive slides or boring quizzes.
          </p>

          <p className="font-tactical text-base sm:text-lg text-slate-400 tracking-wider uppercase">
            “DON'T JUST LEARN CYBERSECURITY. <span className="text-emerald-400 font-extrabold">SURVIVE IT.</span>”
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={() => {
                soundService.playClick();
                onEnter();
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-black font-extrabold font-game text-base sm:text-lg tracking-wider shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer clip-tactical"
            >
              <span>ENTER THE ESCAPE ROOM</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onPlayDemo();
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-amber-500/20 border-2 border-amber-500/60 text-amber-300 font-bold font-tactical text-base tracking-wider hover:bg-amber-500/30 hover:border-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.25)] backdrop-blur-md"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>JUDGE DEMO RUN (2 MIN)</span>
            </button>

            <button
              onClick={() => {
                soundService.playClick();
                onHowItWorks();
              }}
              className="w-full sm:w-auto px-6 py-4 rounded-xl bg-slate-900/80 border border-slate-700/80 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/50 font-tactical text-base tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md"
            >
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>BRIEFING & MANUAL</span>
            </button>
          </div>

          {/* Quick Real-Time Telemetry Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
            <div className="p-3.5 rounded-xl game-backdrop-panel text-center">
              <div className="text-2xl sm:text-3xl font-hud font-bold text-cyan-400">6 CHAMBERS</div>
              <div className="text-xs font-tactical text-slate-400 uppercase tracking-wider">Tactical Threat Sectors</div>
            </div>
            <div className="p-3.5 rounded-xl game-backdrop-panel text-center">
              <div className="text-2xl sm:text-3xl font-hud font-bold text-red-400">3 LIVES</div>
              <div className="text-xs font-tactical text-slate-400 uppercase tracking-wider">Zero-Trust Rules</div>
            </div>
            <div className="p-3.5 rounded-xl game-backdrop-panel text-center">
              <div className="text-2xl sm:text-3xl font-hud font-bold text-emerald-400">AI COACH</div>
              <div className="text-xs font-tactical text-slate-400 uppercase tracking-wider">Adaptive Threat Debrief</div>
            </div>
            <div className="p-3.5 rounded-xl game-backdrop-panel text-center">
              <div className="text-2xl sm:text-3xl font-hud font-bold text-amber-400">INDEX /100</div>
              <div className="text-xs font-tactical text-slate-400 uppercase tracking-wider">Cyber Safety Rating</div>
            </div>
          </div>
        </div>

        {/* Real-World Threat Sectors with Photographic Previews */}
        <div className="mt-24">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 text-xs font-tactical text-cyan-400 uppercase tracking-widest mb-1">
              <Crosshair className="w-3.5 h-3.5" />
              <span>ACTIVE ESCAPE SECTORS // HIGH-FIDELITY SIMULATION</span>
            </div>
            <h2 className="font-game text-3xl sm:text-5xl font-extrabold text-slate-100 tracking-tight">
              CONTAIN 6 REALISTIC THREAT SCENARIOS
            </h2>
            <p className="font-body text-slate-300 text-sm sm:text-base mt-2">
              Step into real-world physical environments modeling modern attack surfaces.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                id: '01',
                mid: 'mission-1',
                title: 'PHISHING PROTOCOL',
                environment: 'Corporate Glass Terminal',
                desc: 'Inspect forged sender domains, analyze raw RFC-822 headers, and catch malicious disguised invoice macros.',
                icon: ShieldAlert,
                accent: 'border-cyan-500/40 text-cyan-400',
                thumb: MISSION_THUMBNAILS['mission-1']
              },
              {
                id: '02',
                mid: 'mission-2',
                title: 'PASSWORD VAULT',
                environment: 'Cold-Aisle Server Vault',
                desc: 'Defeat password spraying rigs, evaluate true entropy bits, and secure critical biometric database keys.',
                icon: Lock,
                accent: 'border-blue-500/40 text-blue-400',
                thumb: MISSION_THUMBNAILS['mission-2']
              },
              {
                id: '03',
                mid: 'mission-3',
                title: 'QR TRAP (QUISHING)',
                environment: 'Smart City Transit Kiosk',
                desc: 'Detect physical sticker tampering on parking meters, decode redirect URLs, and block rogue Wi-Fi beacons.',
                icon: QrCode,
                accent: 'border-emerald-500/40 text-emerald-400',
                thumb: MISSION_THUMBNAILS['mission-3']
              },
              {
                id: '04',
                mid: 'mission-4',
                title: 'SCAM NETWORK',
                environment: 'Financial Trade Floor',
                desc: 'Unmask wire fraud schemes, intercept fake recruiter deposits, and neutralize urgency manipulation.',
                icon: Flame,
                accent: 'border-amber-500/40 text-amber-400',
                thumb: MISSION_THUMBNAILS['mission-4']
              },
              {
                id: '05',
                mid: 'mission-5',
                title: 'SOCIAL ENGINEERING',
                environment: 'Telecom Intercept Post',
                desc: 'Counter executive vishing calls, bypass authority intimidation, and reject tailgating pretext scenarios.',
                icon: Users,
                accent: 'border-purple-500/40 text-purple-400',
                thumb: MISSION_THUMBNAILS['mission-5']
              },
              {
                id: '06',
                mid: 'mission-1',
                title: 'THE DIGITAL LOCKDOWN',
                environment: 'Emergency Containment Center',
                desc: 'FINAL BOSS: A multi-vector cyber contagion attacking infrastructure. Coordinate rapid containment before total blackout!',
                icon: Target,
                accent: 'border-red-500/50 text-red-400',
                thumb: GAME_ENVIRONMENTS.containment_breach.imageUrl
              }
            ].map((room) => {
              const IconComponent = room.icon;
              return (
                <div
                  key={room.id}
                  onClick={onEnter}
                  className={`group rounded-2xl overflow-hidden game-backdrop-panel border ${room.accent} game-card-hover flex flex-col justify-between cursor-pointer`}
                >
                  {/* Photo Thumbnail Header */}
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={room.thumb}
                      alt={room.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500 filter brightness-90 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/40 to-transparent" />
                    
                    {/* Top Tag Badges */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded bg-black/75 border border-slate-700/80 text-xs font-hud font-bold text-slate-200 backdrop-blur-md">
                        CHAMBER {room.id}
                      </span>
                      <span className="px-2.5 py-1 rounded bg-black/75 border border-slate-700/80 text-[11px] font-tactical text-cyan-300 backdrop-blur-md uppercase tracking-wider">
                        {room.environment}
                      </span>
                    </div>

                    <div className="absolute bottom-2 left-4 flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-black/80 border border-slate-700 text-cyan-400">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <h3 className="font-game text-lg font-bold text-slate-100 tracking-wide">
                        {room.title}
                      </h3>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <p className="font-body text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {room.desc}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-tactical">
                      <span className="text-slate-400 uppercase">3 LIVES // TIMED RUN</span>
                      <span className="text-cyan-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        INITIALIZE SECTOR <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* The Core Paradigm Shift Section */}
        <div className="mt-24 max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs font-tactical text-cyan-400 uppercase tracking-widest block">
              [ PEDAGOGY VS GAMIFICATION ]
            </span>
            <h2 className="font-game text-2xl sm:text-4xl font-bold text-slate-100 mt-1">
              TURNING CYBERSECURITY INTO MUSCLE MEMORY
            </h2>
            <p className="font-body text-slate-300 text-sm sm:text-base mt-2">
              Old annual compliance slides don't prepare humans. Immersive gamified escape rooms do.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old Way */}
            <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 backdrop-blur-md space-y-4">
              <div className="flex items-center gap-2 text-red-400 font-tactical text-sm tracking-wider font-bold">
                <XCircle className="w-5 h-5 text-red-400" />
                TRADITIONAL TRAINING (INEFFECTIVE)
              </div>
              <div className="text-lg font-bold text-slate-200 font-game">
                PASSIVE SLIDES → 100% QUIZ → IMMEDIATE AMNESIA
              </div>
              <ul className="font-body text-xs sm:text-sm text-slate-300 space-y-2.5 leading-relaxed">
                <li>• Boring multiple-choice questions with obvious "gotcha" answers</li>
                <li>• No real emotional stakes, zero cost or consequence for reckless clicks</li>
                <li>• Phishing, password vaults, and QR attacks discussed in abstract theory</li>
                <li>• Zero behavioral retention: employees click phishing emails 48 hours later</li>
              </ul>
            </div>

            {/* Escape Room Way */}
            <div className="p-6 rounded-2xl bg-emerald-950/25 border border-emerald-500/40 backdrop-blur-md space-y-4 shadow-[0_0_25px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-2 text-emerald-400 font-tactical text-sm tracking-wider font-bold">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                DIGITAL SAFETY ESCAPE ROOM
              </div>
              <div className="text-lg font-bold text-emerald-300 font-game">
                ENTER → INVESTIGATE → RISK → LEARN → ADAPT → SURVIVE
              </div>
              <ul className="font-body text-xs sm:text-sm text-slate-200 space-y-2.5 leading-relaxed">
                <li>• 🎮 60% AAA Game Mechanics, 🔐 25% Threat Forensics, 🤖 15% AI Coaching</li>
                <li>• High-stakes escape room with 3 lives, countdown timers, and XP combos</li>
                <li>• Interactive email inspectors, raw headers, password hashes, and QR shorteners</li>
                <li>• Generates an actionable Cyber Safety Score and targeted adaptive training drills</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-24 p-8 sm:p-12 rounded-3xl game-backdrop-panel border border-cyan-500/40 text-center max-w-4xl mx-auto space-y-6 shadow-2xl">
          <BrainCircuit className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
          <h2 className="font-game text-3xl sm:text-4xl font-extrabold text-slate-100">
            TEST YOUR CYBER SURVIVAL INSTINCTS NOW
          </h2>
          <p className="font-body text-slate-300 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Enter the simulation with 3 lives. Every mistake triggers an immediate tactical debrief. Escape all sectors to certify your Cyber Risk rating.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => {
                soundService.playClick();
                onPlayDemo();
              }}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-black font-extrabold font-game text-base tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] cursor-pointer clip-tactical"
            >
              LAUNCH HACKATHON DEMO (INSTANT OPERATIVE ACCESS)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
