import React, { useState, useEffect } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';
import {
  Target,
  Shield,
  Zap,
  Flame,
  Award,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { User, ThreatCategory, Achievement } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import { GAME_ENVIRONMENTS } from '../services/environments';

interface CyberProfileViewProps {
  user: User;
  onLaunchAdaptiveDrill: (category?: ThreatCategory) => void;
  onStartMission: (missionId: string) => void;
}

export const CyberProfileView: React.FC<CyberProfileViewProps> = ({
  user,
  onLaunchAdaptiveDrill,
  onStartMission
}) => {
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [stRes, achRes] = await Promise.all([
          api.getStats(),
          api.getAchievements()
        ]);
        setStats(stRes);
        setAchievements(achRes.achievements);
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Format Radar Data
  const radarData = [
    {
      category: 'Phishing',
      score: user.categoryScores?.phishing || 85,
      fullMark: 100
    },
    {
      category: 'Passwords',
      score: user.categoryScores?.password || 90,
      fullMark: 100
    },
    {
      category: 'QR Safety',
      score: user.categoryScores?.qr || 65,
      fullMark: 100
    },
    {
      category: 'Scams',
      score: user.categoryScores?.scam || 80,
      fullMark: 100
    },
    {
      category: 'Social Eng.',
      score: user.categoryScores?.social_engineering || 75,
      fullMark: 100
    },
    {
      category: 'Multi-Threat',
      score: user.categoryScores?.multi_threat || 70,
      fullMark: 100
    }
  ];

  const weaknessCategory = (stats?.weakness?.category || 'qr') as ThreatCategory;
  const dossierEnv = GAME_ENVIRONMENTS.operative_dossier;

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Realistic Operative Dossier Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <img
          src={dossierEnv.imageUrl}
          alt={dossierEnv.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.22] contrast-125 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-[#080d19]/90 to-black/95" />
        <div className="absolute inset-0 game-vignette" />
        <div className="absolute inset-0 game-scanlines opacity-20" />
      </div>

      {/* Profile Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl game-backdrop-panel border border-cyan-500/40 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-black/80 border-2 border-cyan-400 flex items-center justify-center text-4xl shadow-xl">
            {user.avatar}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
              <h1 className="font-game text-2xl sm:text-3xl font-black text-slate-100 uppercase tracking-tight">
                {user.username}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/50 font-hud">
                LVL {user.level}: {user.levelTitle}
              </span>
            </div>
            <p className="text-xs text-slate-300 font-body mt-1">
              Command Unit / Sector: <span className="text-cyan-400 font-semibold">{user.campus || 'Cyber Defense Command'}</span>
            </p>
            <p className="text-[11px] text-slate-400 font-tactical uppercase tracking-wider">
              OPERATIVE REGISTERED: {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Big Certified Safety Score Indicator */}
        <div className="p-5 rounded-2xl bg-black/75 border border-slate-700/80 text-center min-w-[200px] shadow-inner backdrop-blur-md">
          <span className="text-[10px] text-slate-400 font-tactical font-bold uppercase tracking-widest block">
            OVERALL CYBER SAFETY SCORE
          </span>
          <div className="text-4xl sm:text-5xl font-black text-emerald-400 font-game tracking-tight mt-1">
            {user.cyberSafetyScore} <span className="text-base text-slate-500 font-hud">/ 100</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold flex items-center justify-center gap-1 mt-1 font-hud">
            <Shield className="w-3.5 h-3.5" /> HIGH DEFENSE READINESS
          </span>
        </div>
      </div>

      {/* Adaptive Drill Recommendation Banner (AI Powered) */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-black/80 to-slate-950/90 border border-amber-500/50 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-400 shrink-0">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-tactical font-bold text-amber-400 uppercase tracking-widest flex items-center gap-2">
              <span>ADAPTIVE VULNERABILITY RADAR:</span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-hud">
                TARGET: {weaknessCategory.toUpperCase()}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-body">
              Your profile indicates lower defensive reflexes against <strong className="text-amber-300">{weaknessCategory.toUpperCase()}</strong> attacks. Our AI Cyber Coach generated a custom tactical drill to solidify your muscle memory.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            onLaunchAdaptiveDrill(weaknessCategory);
          }}
          className="w-full md:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-black font-extrabold font-game text-xs sm:text-sm tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_25px_rgba(245,158,11,0.4)] whitespace-nowrap cursor-pointer flex items-center justify-center gap-2 clip-tactical"
        >
          <Sparkles className="w-4 h-4" />
          <span>LAUNCH TARGETED DRILL</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-hud">
        <div className="p-4 rounded-xl game-backdrop-panel border border-slate-700/60">
          <div className="text-[10px] text-slate-400 uppercase font-tactical">THREATS FOILED</div>
          <div className="text-2xl font-black text-cyan-400 font-game mt-1">
            {user.threatsIdentified}
          </div>
          <div className="text-[10px] text-slate-400 font-tactical">Live Scenarios Foiled</div>
        </div>
        <div className="p-4 rounded-xl game-backdrop-panel border border-slate-700/60">
          <div className="text-[10px] text-slate-400 uppercase font-tactical">ACTIVE STREAK</div>
          <div className="text-2xl font-black text-emerald-400 font-game mt-1 flex items-center gap-1">
            <Flame className="w-5 h-5 fill-emerald-500" /> {user.streak}
          </div>
          <div className="text-[10px] text-slate-400 font-tactical">Consecutive Clears</div>
        </div>
        <div className="p-4 rounded-xl game-backdrop-panel border border-slate-700/60">
          <div className="text-[10px] text-slate-400 uppercase font-tactical">BEST COMBO</div>
          <div className="text-2xl font-black text-amber-400 font-game mt-1">
            x{user.bestCombo}
          </div>
          <div className="text-[10px] text-slate-400 font-tactical">Threat Multiplier</div>
        </div>
        <div className="p-4 rounded-xl game-backdrop-panel border border-slate-700/60">
          <div className="text-[10px] text-slate-400 uppercase font-tactical">PERFECT MISSIONS</div>
          <div className="text-2xl font-black text-purple-400 font-game mt-1">
            {user.perfectMissions}
          </div>
          <div className="text-[10px] text-slate-400 font-tactical">Zero Lives Lost</div>
        </div>
      </div>

      {/* Visual Analytics Bento Grid: Radar Chart + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Threat Radar Chart */}
        <div className="p-6 rounded-2xl game-backdrop-panel border border-slate-700/70 flex flex-col items-center justify-center">
          <div className="w-full flex items-center justify-between mb-3">
            <span className="text-xs font-tactical font-bold text-cyan-400 uppercase tracking-widest">
              CYBER DEFENSE VECTOR RADAR
            </span>
            <span className="text-[11px] font-hud text-slate-400">0 - 100 Index</span>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#1e293b" />
                <PolarAngleAxis dataKey="category" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                <Radar
                  name="Defense Score"
                  dataKey="score"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance Breakdown */}
        <div className="p-6 rounded-2xl game-backdrop-panel border border-slate-700/70 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-tactical font-bold text-slate-200 uppercase tracking-widest">
              THREAT CATEGORY PROFICIENCY
            </span>
            <span className="text-[10px] text-emerald-400 font-bold font-hud uppercase">ZERO-TRUST BENCHMARK</span>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(user.categoryScores).map(([cat, rawScore]) => {
              const score = Number(rawScore) || 0;
              const isWeak = cat === weaknessCategory;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-hud">
                    <span className="text-slate-200 font-bold capitalize flex items-center gap-1.5 font-tactical">
                      {isWeak && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      {cat.replace('_', ' ')}
                    </span>
                    <span className={`font-bold ${score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
                      {score}% Proficiency
                    </span>
                  </div>
                  <div className="w-full bg-black/80 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        score >= 80
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-400'
                          : score >= 65
                          ? 'bg-gradient-to-r from-amber-500 to-amber-300'
                          : 'bg-gradient-to-r from-red-600 to-red-400'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievements Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h2 className="font-game text-lg sm:text-xl font-bold text-slate-100 uppercase tracking-wide">
              TACTICAL BADGES & ACHIEVEMENTS
            </h2>
          </div>
          <span className="text-xs font-hud text-slate-400">
            {achievements.filter((a) => a.unlocked).length} / {achievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-4 rounded-xl border transition-all ${
                ach.unlocked
                  ? 'game-backdrop-panel border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-black/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{ach.icon}</span>
                {ach.unlocked ? (
                  <span className="text-[10px] font-hud font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/50 px-2 py-0.5 rounded">
                    UNLOCKED
                  </span>
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
              </div>
              <h3 className="font-game text-sm font-bold text-slate-100 mb-1">
                {ach.title}
              </h3>
              <p className="text-[11px] font-body text-slate-300 leading-relaxed mb-2">
                {ach.description}
              </p>
              <div className="text-[11px] font-hud text-cyan-400 font-bold flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> +{ach.xpReward} XP
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
