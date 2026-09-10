import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Heart,
  Zap,
  Flame,
  Clock,
  Award,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import {
  Challenge,
  GameSession,
  User,
  AiCoachFeedback
} from '../types';
import { api } from '../services/api';
import { soundService } from '../services/sound';
import { EmailInspector } from './InteractiveChallenge/EmailInspector';
import { PasswordInspector } from './InteractiveChallenge/PasswordInspector';
import { QRInspector } from './InteractiveChallenge/QRInspector';
import { ScamInspector } from './InteractiveChallenge/ScamInspector';
import { SocialEngInspector } from './InteractiveChallenge/SocialEngInspector';
import { CyberCoachModal } from './CyberCoachModal';
import { GameOverModal } from './GameOverModal';
import { FinalEscapeModal } from './FinalEscapeModal';
import { ShareCardModal } from './ShareCardModal';
import { getEnvironmentForContext } from '../services/environments';

interface EscapeRoomArenaProps {
  missionId: string;
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  onExitToMissions: () => void;
  onExitToProfile: () => void;
  onLaunchAdaptiveDrill: () => void;
}

export const EscapeRoomArena: React.FC<EscapeRoomArenaProps> = ({
  missionId,
  user,
  onUpdateUser,
  onExitToMissions,
  onExitToProfile,
  onLaunchAdaptiveDrill
}) => {
  const [session, setSession] = useState<GameSession | null>(null);
  const [missionTitle, setMissionTitle] = useState<string>('THREAT CONTAINMENT CHAMBER');
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [discoveredClues, setDiscoveredClues] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number>(120);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [hintText, setHintText] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [coachFeedback, setCoachFeedback] = useState<AiCoachFeedback | null>(null);
  const [lastXPBreakdown, setLastXPBreakdown] = useState<{ xpGained: number; speedBonus: number }>({
    xpGained: 0,
    speedBonus: 0
  });

  // Modals state
  const [isBreached, setIsBreached] = useState(false);
  const [isEscapeComplete, setIsEscapeComplete] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  // Timing ref
  const challengeStartTime = useRef<number>(Date.now());
  const timerIntervalRef = useRef<any>(null);

  // Initialize mission session
  const initMission = async (mid: string) => {
    try {
      soundService.playStart ? soundService.playStart() : soundService.playClick();
      const res = await api.startGame(mid);
      setSession(res.session);
      setMissionTitle(res.missionTitle);
      setCurrentChallenge(res.currentChallenge);
      setDiscoveredClues([]);
      setTimeRemaining(res.currentChallenge.timeLimit || 120);
      setHintsUsed(0);
      setHintText(undefined);
      setIsBreached(false);
      setIsEscapeComplete(false);
      setCoachFeedback(null);
      challengeStartTime.current = Date.now();
    } catch (err) {
      console.error('Failed to start mission session:', err);
    }
  };

  useEffect(() => {
    initMission(missionId);
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [missionId]);

  // Countdown timer
  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!currentChallenge || isBreached || isEscapeComplete || coachFeedback) return;

    timerIntervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current);
          soundService.playAlarm();
          return 0;
        }
        if (prev === 20) {
          soundService.playAlarm();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerIntervalRef.current);
  }, [currentChallenge, isBreached, isEscapeComplete, coachFeedback]);

  // Handle clue discovery
  const handleDiscoverClue = async (clueId: string) => {
    if (discoveredClues.includes(clueId)) return;
    try {
      const res = await api.discoverClue(clueId);
      setDiscoveredClues(res.discoveredClues);
      onUpdateUser({
        ...user,
        xp: user.xp + res.threatAnalysisBonus,
        threatsIdentified: user.threatsIdentified + 1
      });
    } catch (err) {
      console.error('Failed to discover clue:', err);
    }
  };

  // Handle hint request
  const handleUseHint = async () => {
    try {
      const res = await api.getHint();
      setHintText(res.hint);
      setHintsUsed(res.hintsUsed);
    } catch (err) {
      console.error('Failed to get hint:', err);
    }
  };

  // Handle tactical option selection
  const handleSelectOption = async (optionId: string) => {
    if (isSubmitting || !currentChallenge || !session) return;
    setIsSubmitting(true);
    const responseTimeMs = Date.now() - challengeStartTime.current;

    try {
      const res = await api.submitAnswer(optionId, responseTimeMs);

      if (res.isCorrect) {
        soundService.playCombo ? soundService.playCombo() : soundService.playCorrect();
      } else {
        soundService.playWrong();
      }

      setLastXPBreakdown({
        xpGained: res.xpGained,
        speedBonus: res.speedBonus
      });

      // Update session state
      setSession((prev) =>
        prev
          ? {
              ...prev,
              lives: res.lives,
              score: res.score,
              combo: res.combo
            }
          : null
      );

      // Update user state
      onUpdateUser({
        ...user,
        lives: res.lives,
        xp: user.xp + res.xpGained,
        streak: res.isCorrect ? user.streak + 1 : 0,
        bestCombo: Math.max(user.bestCombo, res.combo),
        cyberSafetyScore: res.cyberSafetyScore,
        level: res.level,
        levelTitle: res.levelTitle
      });

      // Display AI Coach Debrief
      setCoachFeedback(res.aiCoachFeedback);

      if (res.isBreached) {
        setTimeout(() => {
          soundService.playAlarm();
          setIsBreached(true);
        }, 1200);
      } else if (res.isMissionComplete) {
        setTimeout(() => {
          setIsEscapeComplete(true);
        }, 1200);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Advance to next challenge when coach modal continues
  const handleCoachContinue = () => {
    setCoachFeedback(null);
    if (session && session.currentChallengeIndex + 1 < session.totalChallenges) {
      const nextIdx = session.currentChallengeIndex + 1;
      const nextCh = session.currentChallenge; // Backend updated it
      setSession((prev) => (prev ? { ...prev, currentChallengeIndex: nextIdx } : null));
      setCurrentChallenge(nextCh);
      setDiscoveredClues([]);
      setTimeRemaining(nextCh.timeLimit || 120);
      setHintText(undefined);
      challengeStartTime.current = Date.now();
    } else if (session?.isComplete || isEscapeComplete) {
      setIsEscapeComplete(true);
    }
  };

  if (!currentChallenge || !session) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-cyan-400 font-tactical">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
          <span className="tracking-widest uppercase">INITIALIZING THREAT SIMULATION CHAMBER...</span>
        </div>
      </div>
    );
  }

  const category = currentChallenge.category;
  const activeEnv = getEnvironmentForContext(category);

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6 animate-fadeIn">
      {/* Realistic Dynamic Environment Background for the Active Sector */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <img
          src={activeEnv.imageUrl}
          alt={activeEnv.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter brightness-[0.22] contrast-125 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-[#060913]/90 to-black/95" />
        <div className="absolute inset-0 game-vignette" />
        <div className="absolute inset-0 game-scanlines opacity-20" />
      </div>

      {/* Chamber Header & Progress Bar */}
      <div className="p-4 sm:p-5 rounded-2xl game-backdrop-panel border border-cyan-500/30 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-cyan-300 font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 uppercase font-tactical tracking-wider">
              {activeEnv.code} // {missionTitle}
            </span>
            <span className="text-[11px] text-slate-300 font-bold font-hud uppercase tracking-wider">
              CHALLENGE {session.currentChallengeIndex + 1} OF {session.totalChallenges}
            </span>
          </div>
          <h2 className="font-game text-xl sm:text-2xl font-bold text-slate-100 mt-1.5 tracking-wide uppercase">
            {currentChallenge.title}
          </h2>
        </div>

        {/* Challenge Progress Segments */}
        <div className="flex items-center gap-1.5 w-full md:w-auto">
          {[...Array(session.totalChallenges)].map((_, i) => (
            <div
              key={i}
              className={`h-2.5 flex-1 md:w-12 rounded-full transition-all ${
                i < session.currentChallengeIndex
                  ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.7)]'
                  : i === session.currentChallengeIndex
                  ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]'
                  : 'bg-slate-800/80 border border-slate-700/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Interactive Challenge Renderer */}
      <div>
        {category === 'phishing' && (
          <EmailInspector
            challenge={currentChallenge}
            discoveredClues={discoveredClues}
            onDiscoverClue={handleDiscoverClue}
            onSelectOption={handleSelectOption}
            onUseHint={handleUseHint}
            hintsUsed={hintsUsed}
            hintText={hintText}
            isSubmitting={isSubmitting}
          />
        )}

        {category === 'password' && (
          <PasswordInspector
            challenge={currentChallenge}
            discoveredClues={discoveredClues}
            onDiscoverClue={handleDiscoverClue}
            onSelectOption={handleSelectOption}
            onUseHint={handleUseHint}
            hintsUsed={hintsUsed}
            hintText={hintText}
            isSubmitting={isSubmitting}
          />
        )}

        {category === 'qr' && (
          <QRInspector
            challenge={currentChallenge}
            discoveredClues={discoveredClues}
            onDiscoverClue={handleDiscoverClue}
            onSelectOption={handleSelectOption}
            onUseHint={handleUseHint}
            hintsUsed={hintsUsed}
            hintText={hintText}
            isSubmitting={isSubmitting}
          />
        )}

        {category === 'scam' && (
          <ScamInspector
            challenge={currentChallenge}
            discoveredClues={discoveredClues}
            onDiscoverClue={handleDiscoverClue}
            onSelectOption={handleSelectOption}
            onUseHint={handleUseHint}
            hintsUsed={hintsUsed}
            hintText={hintText}
            isSubmitting={isSubmitting}
          />
        )}

        {(category === 'social_engineering' || category === 'multi_threat') && (
          <SocialEngInspector
            challenge={currentChallenge}
            discoveredClues={discoveredClues}
            onDiscoverClue={handleDiscoverClue}
            onSelectOption={handleSelectOption}
            onUseHint={handleUseHint}
            hintsUsed={hintsUsed}
            hintText={hintText}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Modals */}
      {/* 1. AI Cyber Coach Real-Time Debrief */}
      {coachFeedback && (
        <CyberCoachModal
          feedback={coachFeedback}
          xpGained={lastXPBreakdown.xpGained}
          speedBonus={lastXPBreakdown.speedBonus}
          combo={session.combo}
          lives={session.lives}
          onContinue={handleCoachContinue}
          isMissionComplete={isEscapeComplete}
        />
      )}

      {/* 2. System Breached Game Over */}
      {isBreached && (
        <GameOverModal
          onRetry={() => initMission(missionId)}
          onHome={onExitToMissions}
          onAdaptiveDrill={onLaunchAdaptiveDrill}
        />
      )}

      {/* 3. Final Escape Room Victory */}
      {isEscapeComplete && (
        <FinalEscapeModal
          user={user}
          session={session}
          onViewProfile={onExitToProfile}
          onGenerateShareCard={() => setShowShareCard(true)}
          onPlayAgain={() => initMission(missionId)}
        />
      )}

      {/* 4. Shareable Certificate Card Modal */}
      {showShareCard && (
        <ShareCardModal user={user} onClose={() => setShowShareCard(false)} />
      )}
    </div>
  );
};
