import React from 'react';
import {
  ShieldAlert,
  Lock,
  QrCode,
  Flame,
  Users,
  Target,
  Clock,
  Zap,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Radio,
  Crosshair
} from 'lucide-react';
import { Mission, User } from '../types';
import { soundService } from '../services/sound';
import { MISSION_THUMBNAILS, GAME_ENVIRONMENTS } from '../services/environments';

interface MissionsListViewProps {
  missions: Mission[];
  user: User;
  onSelectMission: (missionId: string) => void;
  onLaunchAdaptiveDrill: () => void;
}

export const MissionsListView: React.FC<MissionsListViewProps> = ({
  missions,
  user,
  onSelectMission,
  onLaunchAdaptiveDrill
}) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'phishing':
        return ShieldAlert;
      case 'password':
        return Lock;
      case 'qr':
        return QrCode;
      case 'scam':
        return Flame;
      case 'social_engineering':
        return Users;
      default:
        return Target;
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'ROOKIE':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-500/50';
      case 'INTERMEDIATE':
        return 'text-cyan-400 bg-cyan-950/70 border-cyan-500/50';
      case 'ADVANCED':
        return 'text-amber-400 bg-amber-950/70 border-amber-500/50';
      case 'NIGHTMARE':
        return 'text-red-400 bg-red-950/70 border-red-500/50';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-700';
    }
  };

  const getMissionThumbnail = (m: Mission, idx: number) => {
    if (MISSION_THUMBNAILS[m.id]) return MISSION_THUMBNAILS[m.id];
    const envKeys = Object.keys(GAME_ENVIRONMENTS);
    const fallbackEnv = GAME_ENVIRONMENTS[envKeys[idx % envKeys.length]];
    return fallbackEnv.imageUrl;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Header Tactical Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs text-cyan-400 font-tactical font-bold uppercase tracking-widest">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>ACTIVE CONTAINMENT SECTORS // ESCAPE DIRECTORY</span>
          </div>
          <h1 className="font-game text-3xl sm:text-4xl font-black text-slate-100 mt-1 uppercase tracking-tight">
            ESCAPE CHAMBER ROSTER
          </h1>
          <p className="font-body text-slate-300 text-xs sm:text-sm mt-1">
            Choose a classified threat sector to start your tactical containment run. 3 lives per chamber.
          </p>
        </div>

        <button
          onClick={() => {
            soundService.playClick();
            onLaunchAdaptiveDrill();
          }}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 text-black font-extrabold font-game text-xs tracking-wider hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(245,158,11,0.35)] flex items-center gap-2 cursor-pointer clip-tactical"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI ADAPTIVE THREAT DRILL</span>
        </button>
      </div>

      {/* Chamber Cards Grid with Photographic Realistic Thumbnails */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {missions.map((m, idx) => {
          const IconComponent = getIcon(m.category);
          const isCompleted = user.completedMissions?.includes(m.id);
          const thumbUrl = getMissionThumbnail(m, idx);

          return (
            <div
              key={m.id}
              className={`rounded-2xl overflow-hidden game-backdrop-panel border transition-all duration-300 flex flex-col justify-between group game-card-hover ${
                isCompleted
                  ? 'border-emerald-500/50 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                  : 'border-slate-700/60 hover:border-cyan-400/60'
              }`}
            >
              {/* Photo Thumbnail Header */}
              <div className="relative h-44 overflow-hidden">
                <img
                  src={thumbUrl}
                  alt={m.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter brightness-[0.82] contrast-115"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1d] via-[#0a0f1d]/40 to-transparent" />

                {/* Top Badge Overlay */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded bg-black/80 border border-slate-700/80 text-[11px] font-hud font-bold text-slate-200 backdrop-blur-md">
                    SECTOR 0{idx + 1}
                  </span>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-hud font-bold px-2 py-0.5 rounded border backdrop-blur-md ${getDifficultyColor(
                        m.difficulty
                      )}`}
                    >
                      {m.difficulty}
                    </span>

                    {isCompleted && (
                      <span className="flex items-center gap-1 text-[11px] font-hud font-bold text-emerald-400 bg-black/85 border border-emerald-500/60 px-2 py-0.5 rounded backdrop-blur-md">
                        <CheckCircle2 className="w-3.5 h-3.5" /> SECURED
                      </span>
                    )}
                  </div>
                </div>

                {/* Chamber Icon and Title Over Photo */}
                <div className="absolute bottom-2 left-4 right-4 flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-black/85 border border-slate-700/80 text-cyan-400 backdrop-blur-md">
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <h3 className="font-game text-base sm:text-lg font-bold text-slate-100 tracking-wide line-clamp-1">
                    {m.title}
                  </h3>
                </div>
              </div>

              {/* Card Body Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <p className="font-body text-xs text-slate-300 leading-relaxed line-clamp-2">
                  {m.description}
                </p>

                {/* Meta Telemetry Stats */}
                <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-slate-800/80 text-xs font-hud">
                  <div>
                    <span className="text-slate-400 text-[10px] font-tactical uppercase block">CHALLENGES</span>
                    <span className="font-bold text-slate-200">{m.challenges.length} Puzzles</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-tactical uppercase block">XP BOUNTY</span>
                    <span className="font-bold text-cyan-400 flex items-center gap-0.5">
                      <Zap className="w-3.5 h-3.5 text-cyan-400" /> {m.xpReward} XP
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] font-tactical uppercase block">DRILL TIME</span>
                    <span className="font-bold text-slate-300 flex items-center gap-0.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> ~2 Mins
                    </span>
                  </div>
                </div>

                {/* Tactical Launch Button */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      soundService.playClick();
                      onSelectMission(m.id);
                    }}
                    className={`w-full py-3 rounded-xl font-bold font-game text-xs tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer clip-tactical ${
                      isCompleted
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600'
                        : 'bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.35)] hover:shadow-[0_0_30px_rgba(6,182,212,0.65)] hover:scale-[1.02]'
                    }`}
                  >
                    <span>{isCompleted ? 'RE-RUN CONTAINMENT DRILL' : 'INFILTRATE ESCAPE CHAMBER'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
