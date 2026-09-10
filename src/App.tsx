import React, { useState, useEffect } from 'react';
import { User, Mission, ThreatCategory } from './types';
import { api } from './services/api';
import { soundService } from './services/sound';
import { CyberHUD } from './components/CyberHUD';
import { LandingPage } from './components/LandingPage';
import { CinematicIntro } from './components/CinematicIntro';
import { MissionsListView } from './components/MissionsListView';
import { EscapeRoomArena } from './components/EscapeRoomArena';
import { CyberProfileView } from './components/CyberProfileView';
import { LeaderboardView } from './components/LeaderboardView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { HowItWorksModal } from './components/HowItWorksModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('cyber_view') || 'landing' : 'landing';
  });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string>(() => {
    return typeof window !== 'undefined' ? sessionStorage.getItem('cyber_mission_id') || 'mission-1' : 'mission-1';
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [howItWorksOpen, setHowItWorksOpen] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const navigateTo = (view: string, missionId?: string) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cyber_view', view);
      if (missionId) {
        sessionStorage.setItem('cyber_mission_id', missionId);
      }
    }
  };

  // Load existing session & missions on mount
  useEffect(() => {
    async function init() {
      try {
        // Fetch missions
        const mRes = await api.getMissions();
        if (mRes.missions) {
          setMissions(mRes.missions);
        }

        // Fetch user if token present
        const uRes = await api.getMe();
        if (uRes.user) {
          setUser(uRes.user);
          const savedView = sessionStorage.getItem('cyber_view');
          if (savedView && savedView !== 'landing') {
            setCurrentView(savedView);
          } else {
            setCurrentView('dashboard');
          }
        }
      } catch {
        // Guest mode by default
      } finally {
        setLoadingInitial(false);
      }
    }
    init();
  }, []);

  const handleRefreshMissions = async () => {
    try {
      const res = await api.getMissions();
      if (res.missions) setMissions(res.missions);
    } catch (err) {
      console.error('Failed to refresh missions:', err);
    }
  };

  const handlePlayDemo = async () => {
    soundService.playClick();
    try {
      const res = await api.demoLogin();
      setUser(res.user);
      soundService.playSuccess();
      navigateTo('cinematic');
    } catch (err) {
      console.error('Demo login error:', err);
    }
  };

  const handleEnterFromLanding = () => {
    soundService.playClick();
    if (user) {
      navigateTo('cinematic');
    } else {
      setAuthMode('login');
      setAuthModalOpen(true);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setAuthModalOpen(false);
    navigateTo('cinematic');
  };

  const handleLogout = () => {
    soundService.playClick();
    api.logout();
    setUser(null);
    navigateTo('landing');
  };

  const handleStartMission = (mId: string) => {
    setSelectedMissionId(mId);
    navigateTo('game', mId);
  };

  const handleLaunchAdaptiveDrill = async (targetCategory?: ThreatCategory) => {
    soundService.playClick();
    try {
      const res = await api.generateAdaptiveChallenge(targetCategory);
      if (res.challenge) {
        // Add adaptive drill to missions
        const adaptiveMission: Mission = {
          id: `adaptive-${Date.now()}`,
          title: 'AI ADAPTIVE THREAT DRILL',
          category: res.challenge.category,
          difficulty: 'INTERMEDIATE',
          description: `Custom generated threat simulation specifically targeting ${res.challenge.category.toUpperCase()} vulnerabilities identified by your Cyber Coach.`,
          challenges: [res.challenge],
          timeLimit: 120,
          xpReward: 200
        };
        setMissions((prev) => [adaptiveMission, ...prev]);
        setSelectedMissionId(adaptiveMission.id);
        setCurrentView('game');
      }
    } catch (err) {
      console.error('Failed to launch adaptive drill:', err);
      // Fallback to QR code mission if adaptive fails
      setSelectedMissionId('mission-3');
      setCurrentView('game');
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#07090e] flex items-center justify-center font-mono text-cyan-400">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span>CONNECTING TO DEFENSE MAINFRAME...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col font-mono selection:bg-cyan-500 selection:text-black">
      {/* Top Cyber Command Center HUD */}
      <CyberHUD
        user={user}
        currentView={currentView}
        onNavigate={(view) => {
          soundService.playClick();
          if (view === 'login') {
            setAuthMode('login');
            setAuthModalOpen(true);
          } else if (view === 'register') {
            setAuthMode('register');
            setAuthModalOpen(true);
          } else {
            navigateTo(view);
          }
        }}
        onLogout={handleLogout}
        lives={user?.lives || 3}
        combo={user?.streak || 0}
        onDemoClick={handlePlayDemo}
      />

      {/* Main View Router */}
      <main className="flex-1 relative">
        {currentView === 'landing' && (
          <LandingPage
            onEnter={handleEnterFromLanding}
            onHowItWorks={() => setHowItWorksOpen(true)}
            onPlayDemo={handlePlayDemo}
          />
        )}

        {currentView === 'cinematic' && (
          <CinematicIntro
            onEnter={() => navigateTo('missions')}
            onSkip={() => navigateTo('missions')}
          />
        )}

        {(currentView === 'dashboard' || currentView === 'missions') && user && (
          <MissionsListView
            missions={missions}
            user={user}
            onSelectMission={handleStartMission}
            onLaunchAdaptiveDrill={handleLaunchAdaptiveDrill}
          />
        )}

        {currentView === 'game' && user && (
          <EscapeRoomArena
            missionId={selectedMissionId}
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onExitToMissions={() => navigateTo('missions')}
            onExitToProfile={() => navigateTo('profile')}
            onLaunchAdaptiveDrill={handleLaunchAdaptiveDrill}
          />
        )}

        {currentView === 'profile' && user && (
          <CyberProfileView
            user={user}
            onLaunchAdaptiveDrill={handleLaunchAdaptiveDrill}
            onStartMission={handleStartMission}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView currentUser={user} />
        )}

        {currentView === 'achievements' && user && (
          <CyberProfileView
            user={user}
            onLaunchAdaptiveDrill={handleLaunchAdaptiveDrill}
            onStartMission={handleStartMission}
          />
        )}

        {currentView === 'admin' && user?.role === 'admin' && (
          <AdminDashboard
            missions={missions}
            onRefreshMissions={handleRefreshMissions}
          />
        )}
      </main>

      {/* Global Modals */}
      {authModalOpen && (
        <AuthModal
          initialMode={authMode}
          onSuccess={handleAuthSuccess}
          onClose={() => setAuthModalOpen(false)}
        />
      )}

      {howItWorksOpen && (
        <HowItWorksModal
          onClose={() => setHowItWorksOpen(false)}
          onEnterGame={() => {
            setHowItWorksOpen(false);
            handleEnterFromLanding();
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-[#05070a] py-6 px-4 text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="font-bold text-slate-300">DIGITAL SAFETY ESCAPE ROOM</span>
            <span className="text-slate-600">// v2.5</span>
          </div>
          <p className="text-slate-400">
            “Don't just learn cybersecurity. <strong className="text-cyan-400">Survive it.</strong>”
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setHowItWorksOpen(true)}
              className="hover:text-cyan-400 transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={handlePlayDemo}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Judge Demo Mode
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
