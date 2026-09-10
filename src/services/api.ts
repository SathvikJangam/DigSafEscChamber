import {
  User,
  Mission,
  Challenge,
  Achievement,
  LeaderboardEntry,
  GameSession,
  ThreatCategory,
  AiCoachFeedback,
  AdminAnalytics
} from '../types';

let token: string | null = typeof window !== 'undefined' ? localStorage.getItem('cyber_escape_jwt') : null;

export const setAuthToken = (newToken: string | null) => {
  token = newToken;
  if (typeof window !== 'undefined') {
    if (newToken) {
      localStorage.setItem('cyber_escape_jwt', newToken);
    } else {
      localStorage.removeItem('cyber_escape_jwt');
    }
  }
};

export const getAuthToken = () => token;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Request failed`);
  }

  return data as T;
}

export const api = {
  // Auth
  async register(username: string, email: string, password: string, campus?: string) {
    const res = await request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password, campus })
    });
    setAuthToken(res.token);
    return res;
  },

  async login(emailOrUsername: string, password: string) {
    const res = await request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername, password })
    });
    setAuthToken(res.token);
    return res;
  },

  async demoLogin() {
    const res = await request<{ token: string; user: User; demoMode: boolean }>('/api/auth/demo', {
      method: 'POST'
    });
    setAuthToken(res.token);
    return res;
  },

  async getMe() {
    return request<{ user: User }>('/api/auth/me');
  },

  logout() {
    setAuthToken(null);
  },

  // Missions
  async getMissions() {
    return request<{ missions: Mission[] }>('/api/missions');
  },

  async getMission(id: string) {
    return request<{ mission: Mission }>(`/api/missions/${id}`);
  },

  // Game Engine
  async startGame(missionId: string) {
    return request<{ session: GameSession; missionTitle: string; currentChallenge: Challenge }>('/api/game/start', {
      method: 'POST',
      body: JSON.stringify({ missionId })
    });
  },

  async submitAnswer(selectedOptionId: string, responseTimeMs: number) {
    return request<{
      isCorrect: boolean;
      selectedOption: { text: string; explanation: string };
      lives: number;
      score: number;
      xpGained: number;
      speedBonus: number;
      combo: number;
      isBreached: boolean;
      isMissionComplete: boolean;
      didLevelUp: boolean;
      level: number;
      levelTitle: string;
      cyberSafetyScore: number;
      nextChallenge: Challenge | null;
      aiCoachFeedback: AiCoachFeedback;
    }>('/api/game/answer', {
      method: 'POST',
      body: JSON.stringify({ selectedOptionId, responseTimeMs })
    });
  },

  async discoverClue(clueId: string) {
    return request<{ success: boolean; discoveredClues: string[]; xpEarned: number; threatAnalysisBonus: number }>(
      '/api/game/clue',
      {
        method: 'POST',
        body: JSON.stringify({ clueId })
      }
    );
  },

  async getHint() {
    return request<{ hint: string; hintsUsed: number }>('/api/game/hint', {
      method: 'POST'
    });
  },

  async completeGame() {
    return request<{
      success: boolean;
      user: User;
      session: GameSession;
      unlockedAchievements: Achievement[];
      finalEscapeReady: boolean;
    }>('/api/game/complete', {
      method: 'POST'
    });
  },

  // Profile & Leaderboard
  async getStats() {
    return request<{
      overallSafetyScore: number;
      accuracy: number;
      totalAnswered: number;
      threatsIdentified: number;
      streak: number;
      bestCombo: number;
      categoryScores: Record<ThreatCategory, number>;
      strength: { category: string; score: number };
      weakness: { category: string; score: number };
      completedMissionsCount: number;
    }>('/api/profile/stats');
  },

  async getAchievements() {
    return request<{ achievements: Achievement[] }>('/api/profile/achievements');
  },

  async getLeaderboard(campus?: string) {
    const query = campus ? `?campus=${encodeURIComponent(campus)}` : '';
    return request<{ leaderboard: LeaderboardEntry[]; campuses: string[] }>(`/api/leaderboard${query}`);
  },

  // AI Cyber Coach & Adaptive Drills
  async explainThreat(data: {
    challengeTitle: string;
    category: string;
    selectedAction: string;
    isCorrect: boolean;
    scenario: string;
  }) {
    return request<{ source: string; feedback: Record<string, unknown> }>('/api/ai/explain', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async generateAdaptiveChallenge(targetCategory?: ThreatCategory) {
    return request<{ challenge: Challenge; source: string }>('/api/ai/generate-challenge', {
      method: 'POST',
      body: JSON.stringify({ targetCategory })
    });
  },

  // Admin
  async getAdminAnalytics() {
    return request<{ analytics: AdminAnalytics }>('/api/admin/analytics');
  },

  async createChallenge(challengeData: Partial<Challenge>) {
    return request<{ success: boolean; challenge: Challenge }>('/api/challenges', {
      method: 'POST',
      body: JSON.stringify(challengeData)
    });
  },

  async deleteChallenge(id: string) {
    return request<{ success: boolean; message: string }>(`/api/challenges/${id}`, {
      method: 'DELETE'
    });
  },

  async resetAdminData() {
    return request<{ success: boolean; message: string }>('/api/admin/reset', {
      method: 'POST'
    });
  },

  // Password Analysis Engine (zxcvbn)
  async analyzePassword(password: string, userInputs?: string[]) {
    return request<{
      score: number;
      guesses: number;
      guessesLog10: number;
      entropy: number;
      crackTimesDisplay: {
        offlineFastHashing1e10PerSecond: string;
        offlineSlowHashing1e4PerSecond: string;
        onlineNoThrottling10PerSecond: string;
        onlineThrottling100PerHour: string;
      };
      feedback: {
        warning: string;
        suggestions: string[];
      };
      sequenceSummary: Array<{ pattern: string; token: string; guesses: number }>;
      isTerminalOverrideValid: boolean;
      verdict: string;
    }>('/api/password/analyze', {
      method: 'POST',
      body: JSON.stringify({ password, userInputs })
    });
  },

  async overridePasswordTerminal(password: string) {
    return request<{
      success: boolean;
      score: number;
      xpAwarded: number;
      message: string;
      crackTime?: string;
      warning?: string;
      suggestions?: string[];
      livesRemaining?: number;
    }>('/api/password/terminal-override', {
      method: 'POST',
      body: JSON.stringify({ password })
    });
  },

  // Threat Inspection APIs
  async inspectQR(data: { url: string; hasPhysicalTamper?: boolean; misalignedBorder?: boolean; hasOverlaySticker?: boolean }) {
    return request<{
      verdict: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL_RISK';
      riskScore: number;
      isTampered: boolean;
      destinationDetails: {
        originalUrl: string;
        hostname: string;
        protocol: string;
        isIpAddress: boolean;
        isShortener: boolean;
        hasHomoglyphs: boolean;
        isSslSecure: boolean;
      };
      redFlags: string[];
      explanation: string;
      defensiveAdvice: string;
    }>('/api/inspect/qr', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async inspectEmail(data: {
    senderEmail: string;
    displaySender?: string;
    subject?: string;
    targetUrl?: string;
    displayUrl?: string;
    bodyText?: string;
  }) {
    return request<{
      verdict: 'LEGITIMATE' | 'PHISHING' | 'SUSPICIOUS';
      phishingRiskScore: number;
      indicators: {
        isSpoofedSender: boolean;
        isMismatchedUrl: boolean;
        hasUrgencyPressure: boolean;
        hasThreateningLanguage: boolean;
      };
      identifiedRedFlags: string[];
      explanation: string;
      tacticalAdvice: string;
    }>('/api/inspect/email', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async inspectScam(data: {
    messageText: string;
    platform?: string;
    senderNumber?: string;
    linkUrl?: string;
  }) {
    return request<{
      verdict: 'LEGITIMATE' | 'SCAM_SMISHING' | 'SUSPICIOUS';
      scamRiskScore: number;
      scamVector: string;
      detectedPatterns: string[];
      explanation: string;
      recommendedAction: string;
    }>('/api/inspect/scam', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Gauntlet / Survival Mode (10-20 Levels)
  async startGauntlet() {
    return request<{
      runId: string;
      currentLevel: number;
      totalLevels: number;
      tier: 'ROOKIE' | 'INTERMEDIATE' | 'ADVANCED';
      lives: number;
      score: number;
      currentChallenge: Challenge;
    }>('/api/game/gauntlet/start', {
      method: 'POST'
    });
  },

  async answerGauntlet(selectedOptionId: string, responseTimeMs?: number) {
    return request<{
      isCorrect: boolean;
      currentLevel: number;
      totalLevels: number;
      tier: 'ROOKIE' | 'INTERMEDIATE' | 'ADVANCED';
      lives: number;
      score: number;
      xpGained: number;
      combo: number;
      isEliminated: boolean;
      isGauntletCompleted: boolean;
      finalBadge?: string;
      cyberSafetyScore: number;
      nextChallenge?: Challenge;
      explanation: string;
    }>('/api/game/gauntlet/answer', {
      method: 'POST',
      body: JSON.stringify({ selectedOptionId, responseTimeMs })
    });
  }
};
