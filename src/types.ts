export type ThreatCategory = 
  | 'phishing'
  | 'password'
  | 'qr'
  | 'scam'
  | 'social_engineering'
  | 'multi_threat';

export type ChallengeDifficulty = 'ROOKIE' | 'INTERMEDIATE' | 'ADVANCED' | 'NIGHTMARE';

export interface Clue {
  id: string;
  name: string;
  description: string;
  threatType: string;
  location: string;
  discovered?: boolean;
}

export type ChallengeClue = Clue;

export interface ChallengeOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  riskPenalty?: string;
}

export interface Challenge {
  id: string;
  missionId: string;
  title: string;
  category: ThreatCategory;
  difficulty: ChallengeDifficulty;
  scenario: string;
  timeLimit: number; // in seconds (e.g. 60-180)
  xpReward: number;
  clues: Clue[];
  options: ChallengeOption[];
  correctAnswerId: string;
  explanation: string;
  learningObjective: string;
  // Specific interactive mock data
  mockData?: {
    email?: {
      senderName: string;
      senderEmail: string;
      replyTo?: string;
      subject: string;
      date: string;
      body: string;
      rawHeaders?: string;
      targetUrl: string;
      displayUrl: string;
      attachmentName?: string;
      attachmentType?: string;
    };
    passwordScenario?: {
      candidates: Array<{
        id: string;
        passwordText: string;
        strength: 'Weak' | 'Medium' | 'Strong' | 'Critical Failure';
        crackTime: string;
        entropy: number;
        flaws: string[];
      }>;
      context: string;
    };
    qrScenario?: {
      qrLabel: string;
      locationPoster: string;
      scannedUrl: string;
      realDestination: string;
      sslValid: boolean;
      domainAge: string;
      redFlags: string[];
    };
    scamScenario?: {
      platform: 'WhatsApp' | 'SMS' | 'Telegram' | 'Instagram';
      senderNumber: string;
      senderVerified: boolean;
      messages: Array<{
        fromUser: boolean;
        text: string;
        time: string;
      }>;
      rewardClaimUrl?: string;
    };
    socialEngScenario?: {
      callerName: string;
      callerRole: string;
      claimedDepartment: string;
      urgencyLevel: 'LOW' | 'HIGH' | 'CRITICAL';
      dialogue: Array<{
        speaker: string;
        text: string;
        isFlagged?: boolean;
      }>;
    };
  };
}

export interface Mission {
  id: string;
  title: string;
  codeName?: string;
  description: string;
  category: ThreatCategory;
  difficulty: ChallengeDifficulty;
  order?: number;
  locked?: boolean;
  challenges: Challenge[];
  estimatedTime?: string;
  iconName?: string;
  timeLimit?: number;
  xpReward?: number;
}

export interface User {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  levelTitle: string;
  xp: number;
  xpToNextLevel: number;
  lives: number;
  maxLives: number;
  streak: number;
  cyberSafetyScore: number;
  campus?: string;
  role: 'player' | 'admin';
  createdAt: string;
  completedMissions: string[];
  perfectMissions: number;
  threatsIdentified: number;
  bestCombo: number;
  categoryScores: Record<ThreatCategory, number>;
}

export interface GameSession {
  missionId: string;
  currentChallengeIndex: number;
  currentChallenge: Challenge;
  totalChallenges: number;
  lives: number;
  score: number;
  xpEarned: number;
  combo: number;
  discoveredClues: string[];
  hintsUsed: number;
  timeRemaining: number;
  startedAt: number;
  isComplete: boolean;
  isBreached: boolean;
  attempts: Array<{
    challengeId: string;
    selectedOptionId: string;
    isCorrect: boolean;
    responseTimeMs: number;
    discoveredClues: string[];
  }>;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  unlocked: boolean;
  unlockedAt?: string;
  xpValue: number;
  progress?: {
    current: number;
    target: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  avatar: string;
  xp: number;
  cyberSafetyScore: number;
  level: number;
  levelTitle: string;
  missionsCompleted: number;
  perfectMissions: number;
  streak: number;
  campus: string;
  badge: string;
}

export interface AiCoachFeedback {
  isCorrect: boolean;
  verdict: string;
  threatType: string;
  identifiedWarningSigns: string[];
  explanation: string;
  threatAnalysisBonus: number;
  xpAwarded: number;
  nextStepRecommendation: string;
  weaknessIdentified?: ThreatCategory;
}

export interface AdminAnalytics {
  totalPlayers: number;
  activePlayers: number;
  averageSafetyScore: number;
  mostFailedChallenge: string;
  mostSuccessfulChallenge: string;
  averageMissionCompletion: number;
  commonWeakness: string;
  categoryAverages: Record<ThreatCategory, number>;
  difficultyDistribution: Record<ChallengeDifficulty, number>;
  recentAttempts: Array<{
    id: string;
    username: string;
    challengeTitle: string;
    correct: boolean;
    timestamp: string;
  }>;
}
