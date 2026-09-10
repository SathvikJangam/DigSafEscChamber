import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Flame,
  Shield,
  Search,
  Filter,
  Users,
  Zap,
  Sparkles
} from 'lucide-react';
import { LeaderboardEntry, User } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import { GAME_ENVIRONMENTS } from '../services/environments';

interface LeaderboardViewProps {
  currentUser: User | null;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ currentUser }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [campuses, setCampuses] = useState<string[]>([]);
  const [selectedCampus, setSelectedCampus] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const leaderboardEnv = GAME_ENVIRONMENTS.leaderboard_ranks;

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      try {
        const campusParam = selectedCampus === 'all' ? undefined : selectedCampus;
        const res = await api.getLeaderboard(campusParam);
        setLeaderboard(res.leaderboard);
        if (res.campuses && res.campuses.length > 0) {
          setCampuses(res.campuses);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, [selectedCampus]);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8 animate-fadeIn">
      {/* Realistic Ops Room Background */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <img
          src={leaderboardEnv.imageUrl}
          alt={leaderboardEnv.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.20] contrast-125 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-[#080d19]/90 to-black/95" />
        <div className="absolute inset-0 game-vignette" />
        <div className="absolute inset-0 game-scanlines opacity-20" />
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
        <div>
          <span className="text-xs text-amber-400 font-tactical font-bold uppercase tracking-widest block flex items-center gap-1.5">
            <Trophy className="w-4 h-4 text-amber-400" /> GLOBAL OPERATIVE LEADERBOARD
          </span>
          <h1 className="font-game text-3xl sm:text-4xl font-black text-slate-100 uppercase tracking-tight mt-1">
            CYBER SENTINEL RANKS
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 font-body">
            Ranked by overall verified defense telemetry, XP bounties, and perfect mission runs.
          </p>
        </div>

        {/* Campus Filter Selector */}
        <div className="flex items-center gap-2 game-backdrop-panel border border-slate-700/80 p-1.5 rounded-xl font-hud">
          <Filter className="w-4 h-4 text-slate-400 ml-2" />
          <select
            value={selectedCampus}
            onChange={(e) => {
              soundService.playClick();
              setSelectedCampus(e.target.value);
            }}
            className="bg-transparent text-xs text-slate-200 border-none outline-none pr-4 py-1 cursor-pointer font-tactical"
          >
            <option value="all" className="bg-[#0b101d] text-white">All Sectors & Units</option>
            <option value="MIT Cybersecurity Lab" className="bg-[#0b101d] text-white">MIT Cybersecurity Lab</option>
            <option value="Stanford Infosec" className="bg-[#0b101d] text-white">Stanford Infosec</option>
            <option value="UC Berkeley EECS" className="bg-[#0b101d] text-white">UC Berkeley EECS</option>
            <option value="Georgia Tech Cyber" className="bg-[#0b101d] text-white">Georgia Tech Cyber</option>
            <option value="CMU CyLab" className="bg-[#0b101d] text-white">CMU CyLab</option>
            <option value="Cyber Defense Academy" className="bg-[#0b101d] text-white">Cyber Defense Academy</option>
          </select>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {leaderboard.length >= 3 && selectedCampus === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
          {/* Rank 2 */}
          <div className="p-5 rounded-2xl game-backdrop-panel border border-slate-700/80 order-2 md:order-1 flex flex-col items-center text-center shadow-xl">
            <span className="text-2xl mb-1">🥈</span>
            <span className="text-xs font-tactical font-bold text-slate-300">RANK #2</span>
            <div className="text-3xl my-2">{leaderboard[1].avatar}</div>
            <div className="font-game text-lg font-bold text-slate-100">{leaderboard[1].username}</div>
            <div className="text-xs text-cyan-400 font-tactical mt-0.5">{leaderboard[1].campus}</div>
            <div className="mt-3 px-3.5 py-1.5 rounded-lg bg-black/70 border border-slate-700 text-xs font-hud font-bold text-emerald-400">
              {leaderboard[1].cyberSafetyScore}/100 • {leaderboard[1].xp} XP
            </div>
          </div>

          {/* Rank 1 */}
          <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/40 via-black/80 to-slate-950/90 border-2 border-amber-500/70 order-1 md:order-2 flex flex-col items-center text-center shadow-[0_0_35px_rgba(245,158,11,0.25)] backdrop-blur-md">
            <span className="text-3xl mb-1">👑</span>
            <span className="text-xs font-tactical font-extrabold text-amber-400 tracking-wider">GLOBAL LEADER (RANK #1)</span>
            <div className="text-4xl my-2">{leaderboard[0].avatar}</div>
            <div className="font-game text-xl font-black text-amber-300 uppercase">{leaderboard[0].username}</div>
            <div className="text-xs text-cyan-400 font-tactical mt-0.5">{leaderboard[0].campus}</div>
            <div className="mt-3 px-4 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/60 text-xs font-hud font-extrabold text-amber-300 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              <Zap className="w-4 h-4" /> {leaderboard[0].xp} TOTAL XP
            </div>
          </div>

          {/* Rank 3 */}
          <div className="p-5 rounded-2xl game-backdrop-panel border border-slate-700/80 order-3 md:order-3 flex flex-col items-center text-center shadow-xl">
            <span className="text-2xl mb-1">🥉</span>
            <span className="text-xs font-tactical font-bold text-slate-300">RANK #3</span>
            <div className="text-3xl my-2">{leaderboard[2].avatar}</div>
            <div className="font-game text-lg font-bold text-slate-100">{leaderboard[2].username}</div>
            <div className="text-xs text-cyan-400 font-tactical mt-0.5">{leaderboard[2].campus}</div>
            <div className="mt-3 px-3.5 py-1.5 rounded-lg bg-black/70 border border-slate-700 text-xs font-hud font-bold text-emerald-400">
              {leaderboard[2].cyberSafetyScore}/100 • {leaderboard[2].xp} XP
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="rounded-2xl game-backdrop-panel border border-slate-700/80 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-hud">
            <thead className="bg-black/70 text-slate-300 uppercase tracking-wider border-b border-slate-700/80 font-tactical">
              <tr>
                <th className="py-3.5 px-4">RANK</th>
                <th className="py-3.5 px-4">OPERATIVE</th>
                <th className="py-3.5 px-4">CAMPUS / AFFILIATION</th>
                <th className="py-3.5 px-4 text-center">SAFETY SCORE</th>
                <th className="py-3.5 px-4 text-center">STREAK</th>
                <th className="py-3.5 px-4 text-right">TOTAL XP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {leaderboard.map((entry) => {
                const isCurrent = currentUser && currentUser.username.toLowerCase() === entry.username.toLowerCase();
                return (
                  <tr
                    key={entry.id}
                    className={`transition-colors ${
                      isCurrent
                        ? 'bg-cyan-950/40 font-bold border-l-4 border-cyan-400'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-hud">
                      <span
                        className={`inline-block w-7 h-7 rounded-full text-center leading-7 font-bold ${
                          entry.rank === 1
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                            : entry.rank === 2
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-400/50'
                            : entry.rank === 3
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-700/50'
                            : 'text-slate-400'
                        }`}
                      >
                        #{entry.rank}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{entry.avatar}</span>
                        <div>
                          <span className="text-slate-100 font-semibold font-game tracking-wide">{entry.username}</span>
                          {isCurrent && (
                            <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-tactical">
                              YOU
                            </span>
                          )}
                          <span className="block text-[10px] text-slate-400 font-tactical">
                            LVL {entry.level} • {entry.levelTitle}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300 font-body">{entry.campus}</td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="font-bold text-emerald-400 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30">
                        {entry.cyberSafetyScore}/100
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-amber-400 flex items-center justify-center gap-1 font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-amber-500" /> {entry.streak}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-cyan-400 flex items-center justify-end gap-1">
                        <Zap className="w-3.5 h-3.5" /> {entry.xp.toLocaleString()} XP
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
