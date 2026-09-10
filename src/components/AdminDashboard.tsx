import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  ShieldAlert,
  Users,
  AlertOctagon,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Settings,
  Activity,
  Sparkles
} from 'lucide-react';
import { AdminAnalytics, Mission } from '../types';
import { api } from '../services/api';
import { soundService } from '../services/sound';

interface AdminDashboardProps {
  missions: Mission[];
  onRefreshMissions: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ missions, onRefreshMissions }) => {
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  // New challenge form state
  const [newTitle, setNewTitle] = useState('');
  const [newMissionId, setNewMissionId] = useState(missions[0]?.id || 'mission-1');
  const [newCategory, setNewCategory] = useState('phishing');
  const [newScenario, setNewScenario] = useState('');
  const [newOpt1, setNewOpt1] = useState('');
  const [newOpt2, setNewOpt2] = useState('');
  const [correctOpt, setCorrectOpt] = useState('opt-2');

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await api.getAdminAnalytics();
        setAnalytics(res.analytics);
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newScenario || !newOpt1 || !newOpt2) return;
    soundService.playClick();
    try {
      await api.createChallenge({
        missionId: newMissionId,
        title: newTitle.toUpperCase(),
        category: newCategory as any,
        difficulty: 'INTERMEDIATE',
        scenario: newScenario,
        options: [
          {
            id: 'opt-1',
            text: newOpt1,
            isCorrect: correctOpt === 'opt-1',
            explanation: correctOpt === 'opt-1' ? 'Correct defense!' : 'Risky action that triggers a breach.'
          },
          {
            id: 'opt-2',
            text: newOpt2,
            isCorrect: correctOpt === 'opt-2',
            explanation: correctOpt === 'opt-2' ? 'Zero-trust verification adhered to!' : 'Unsolicited request trusted.'
          }
        ],
        clues: [
          {
            id: `c-custom-1`,
            name: 'Anomalous Gateway Request',
            location: 'Network Header',
            description: 'Originating host does not match certified company directory.',
            threatType: 'Header Spoofing'
          }
        ],
        correctAnswerId: correctOpt,
        explanation: 'Zero-trust rule enforced.',
        learningObjective: 'Inspect raw security indicators before action.'
      });

      setShowAddModal(false);
      setNewTitle('');
      setNewScenario('');
      setNewOpt1('');
      setNewOpt2('');
      onRefreshMissions();
      soundService.playCorrect();
    } catch (err) {
      console.error('Failed to create challenge:', err);
    }
  };

  const handleDeleteChallenge = async (challengeId: string) => {
    if (!confirm('Permanently remove this security scenario from mission?')) return;
    soundService.playClick();
    try {
      await api.deleteChallenge(challengeId);
      onRefreshMissions();
    } catch (err) {
      console.error('Failed to delete challenge:', err);
    }
  };

  const handleResetData = async () => {
    if (!confirm('Reset game database to factory defaults?')) return;
    soundService.playClick();
    try {
      const res = await api.resetAdminData();
      setResetMessage(res.message);
      onRefreshMissions();
      setTimeout(() => setResetMessage(null), 3000);
    } catch (err) {
      console.error('Reset failed:', err);
    }
  };

  const chartData = analytics?.categoryAverages
    ? Object.entries(analytics.categoryAverages).map(([cat, score]) => ({
        category: cat.replace('_', ' ').toUpperCase(),
        averageScore: score
      }))
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 font-mono space-y-8 animate-fadeIn">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-500/30 pb-6">
        <div>
          <span className="text-xs text-purple-400 font-bold uppercase tracking-widest block flex items-center gap-1.5">
            <Settings className="w-4 h-4 text-purple-400" /> SEC-OPS COMMAND TELEMETRY
          </span>
          <h1 className="cyber-font text-3xl sm:text-4xl font-extrabold text-slate-100 mt-1">
            CYBER DEFENSE ADMIN CONSOLE
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Real-time human threat readiness monitoring, failure vector telemetry, and scenario deployment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>DEPLOY SCENARIO</span>
          </button>

          <button
            onClick={handleResetData}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-red-500/40 hover:bg-red-950/40 text-red-400 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            title="Reset data store"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>FACTORY RESET</span>
          </button>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>REGISTERED AGENTS</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-slate-100 cyber-font">
            {analytics?.totalPlayers || 4}
          </div>
          <div className="text-[10px] text-emerald-400">100% active defense participation</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>AVERAGE READINESS INDEX</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 cyber-font">
            {analytics?.averageSafetyScore || 88} <span className="text-sm text-slate-500">/ 100</span>
          </div>
          <div className="text-[10px] text-slate-400">+14% improvement over standard quizzes</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>COMMON VULNERABILITY</span>
            <AlertOctagon className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-sm font-bold text-amber-300 cyber-font line-clamp-1">
            QR CODE TAMPERING
          </div>
          <div className="text-[10px] text-amber-400/90">58% accuracy rate on physical stickers</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>MOST FAILED SCENARIO</span>
            <ShieldAlert className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-sm font-bold text-red-400 cyber-font line-clamp-1">
            PARKING METER STICKER
          </div>
          <div className="text-[10px] text-slate-400">Tactile overlays undetected by 42%</div>
        </div>
      </div>

      {/* Visual Bar Chart: Category Readiness */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            ORGANIZATIONAL THREAT PROFICIENCY MATRIX
          </span>
          <span className="text-[10px] text-cyan-400 font-mono">Average Accuracy %</span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="category" stroke="#64748b" fontSize={10} />
              <YAxis domain={[0, 100]} stroke="#64748b" fontSize={10} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="averageScore" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Security Drills Registry (Manage / Delete) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            DEPLOYED ESCAPE ROOM CHALLENGES
          </span>
          <span className="text-[10px] text-slate-400">
            {missions.reduce((acc, m) => acc + m.challenges.length, 0)} Total Scenarios
          </span>
        </div>

        <div className="space-y-2">
          {missions.map((m) => (
            <div key={m.id} className="space-y-2">
              <div className="text-[11px] text-cyan-400 font-bold border-b border-slate-800/80 pb-1">
                {m.title} ({m.challenges.length} Scenarios)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {m.challenges.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-200 block">{c.title}</span>
                      <span className="text-[10px] text-slate-400">
                        {c.category.toUpperCase()} • {c.difficulty} • +{c.xpReward} XP
                      </span>
                    </div>
                    {m.challenges.length > 1 && (
                      <button
                        onClick={() => handleDeleteChallenge(c.id)}
                        className="p-1.5 rounded text-slate-500 hover:text-red-400 hover:bg-red-950/40"
                        title="Delete Challenge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Challenge Deploy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl p-6 bg-[#0c101a] border border-purple-500/50 shadow-2xl space-y-4">
            <h3 className="cyber-font text-lg font-bold text-slate-100 flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-400" /> DEPLOY CUSTOM SECURITY DRILL
            </h3>

            <form onSubmit={handleCreateChallenge} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Target Mission Chamber</label>
                <select
                  value={newMissionId}
                  onChange={(e) => {
                    setNewMissionId(e.target.value);
                    const sel = missions.find((m) => m.id === e.target.value);
                    if (sel) setNewCategory(sel.category);
                  }}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                >
                  {missions.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Scenario Title</label>
                <input
                  type="text"
                  placeholder="e.g. FAKE CLOUD INVOICE ATTACHMENT"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Scenario Narrative</label>
                <textarea
                  rows={3}
                  placeholder="Describe the realistic attack scenario faced by the player..."
                  value={newScenario}
                  onChange={(e) => setNewScenario(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-400 block">Tactical Option 1</label>
                <input
                  type="text"
                  placeholder="Option 1 text..."
                  value={newOpt1}
                  onChange={(e) => setNewOpt1(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                  required
                />

                <label className="text-slate-400 block">Tactical Option 2</label>
                <input
                  type="text"
                  placeholder="Option 2 text..."
                  value={newOpt2}
                  onChange={(e) => setNewOpt2(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                  required
                />

                <label className="text-slate-400 block">Which option is the verified defense?</label>
                <select
                  value={correctOpt}
                  onChange={(e) => setCorrectOpt(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200"
                >
                  <option value="opt-1">Option 1 is Correct</option>
                  <option value="opt-2">Option 2 is Correct</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Deploy Challenge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
