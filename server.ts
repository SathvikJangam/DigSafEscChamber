import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import zxcvbn from 'zxcvbn';
import {
  INITIAL_MISSIONS,
  INITIAL_ACHIEVEMENTS,
  INITIAL_LEADERBOARD,
  INITIAL_DEMO_USER
} from './src/data/seedData.ts';
import {
  User,
  Mission,
  Challenge,
  Achievement,
  LeaderboardEntry,
  GameSession,
  ThreatCategory,
  AdminAnalytics
} from './src/types.ts';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Resilient zxcvbn evaluator
function evaluatePasswordWithZxcvbn(password: string, userInputs: string[] = []) {
  try {
    const fn = (zxcvbn as unknown as { default?: (p: string, u?: string[]) => any }).default || zxcvbn;
    if (typeof fn === 'function') {
      return fn(password, userInputs);
    }
  } catch (err) {
    console.warn('zxcvbn fallback invoked:', err);
  }
  const len = password.length;
  let score = 0;
  if (len >= 14) score = 4;
  else if (len >= 10) score = 3;
  else if (len >= 7) score = 2;
  else if (len >= 4) score = 1;
  return {
    score,
    guesses: Math.pow(10, score * 3),
    guesses_log10: score * 3,
    crack_times_display: {
      offline_fast_hashing_1e10_per_second: score >= 3 ? 'centuries' : 'minutes',
      offline_slow_hashing_1e4_per_second: score >= 3 ? 'centuries' : 'hours',
      online_no_throttling_10_per_second: score >= 3 ? 'years' : 'seconds',
      online_throttling_100_per_hour: score >= 3 ? 'centuries' : 'days'
    },
    feedback: {
      warning: score < 3 ? 'Short length or predictable pattern detected.' : '',
      suggestions: score < 3 ? ['Add more random words or symbols to increase entropy.'] : ['High entropy passphrase.']
    },
    sequence: []
  };
}

interface GauntletSession {
  runId: string;
  userId: string;
  currentLevel: number;
  totalLevels: number;
  tier: 'ROOKIE' | 'INTERMEDIATE' | 'ADVANCED';
  lives: number;
  score: number;
  xpEarned: number;
  combo: number;
  encounteredChallengeIds: string[];
  currentChallenge: Challenge;
  isEliminated: boolean;
  isGauntletCompleted: boolean;
  startedAt: number;
}

interface DatabaseSchema {
  users: Record<string, User & { passwordHash: string }>;
  missions: Mission[];
  achievements: Achievement[];
  leaderboard: LeaderboardEntry[];
  sessions: Record<string, GameSession>;
  gauntletRuns: Record<string, GauntletSession>;
  attempts: Array<{
    id: string;
    userId: string;
    username: string;
    challengeId: string;
    challengeTitle: string;
    category: ThreatCategory;
    isCorrect: boolean;
    responseTimeMs: number;
    timestamp: string;
  }>;
}

let db: DatabaseSchema = {
  users: {},
  missions: JSON.parse(JSON.stringify(INITIAL_MISSIONS)),
  achievements: JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS)),
  leaderboard: JSON.parse(JSON.stringify(INITIAL_LEADERBOARD)),
  sessions: {},
  gauntletRuns: {},
  attempts: [
    {
      id: 'att-seed-1',
      userId: INITIAL_DEMO_USER.id,
      username: INITIAL_DEMO_USER.username,
      challengeId: 'ch-101',
      challengeTitle: 'URGENT ACCOUNT SUSPENSION ALERT',
      category: 'phishing',
      isCorrect: true,
      responseTimeMs: 8400,
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'att-seed-2',
      userId: INITIAL_DEMO_USER.id,
      username: INITIAL_DEMO_USER.username,
      challengeId: 'ch-301',
      challengeTitle: 'PARKING METER TAMPER STICKER',
      category: 'qr',
      isCorrect: false,
      responseTimeMs: 14200,
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ]
};

// Seed demo user
const demoUserWithPass = {
  ...INITIAL_DEMO_USER,
  passwordHash: hashPassword('DemoJudge2026!')
};
db.users[INITIAL_DEMO_USER.id] = demoUserWithPass;

// Seed admin user
const adminId = 'usr-admin-secops';
db.users[adminId] = {
  id: adminId,
  username: 'SecOps_Director',
  email: 'admin@cybersafety.org',
  avatar: '🔐',
  level: 8,
  levelTitle: 'SECURITY MASTER',
  xp: 12500,
  xpToNextLevel: 15000,
  lives: 3,
  maxLives: 3,
  streak: 21,
  cyberSafetyScore: 98,
  campus: 'Cyber Defense Command',
  role: 'admin',
  createdAt: '2026-08-01T00:00:00Z',
  completedMissions: ['mission-1', 'mission-2', 'mission-3', 'mission-4', 'mission-5', 'mission-6'],
  perfectMissions: 6,
  threatsIdentified: 48,
  bestCombo: 12,
  categoryScores: {
    phishing: 98,
    password: 99,
    qr: 95,
    scam: 96,
    social_engineering: 97,
    multi_threat: 98
  },
  passwordHash: hashPassword('AdminPass2026!')
};

// Load or save database
function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const loaded = JSON.parse(content);
      if (loaded.missions && loaded.missions.length > 0) {
        db = loaded;
      }
    } else {
      saveDatabase();
    }
  } catch (err) {
    console.error('Failed to load database.json, using seed defaults:', err);
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database.json:', err);
  }
}

loadDatabase();

// Cryptographic helpers
function hashPassword(password: string): string {
  const salt = 'cyber_escape_salt_2026';
  return crypto.pbkdf2Sync(password, salt, 1000, 32, 'sha256').toString('hex');
}

function generateToken(userId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({ userId, exp: Math.floor(Date.now() / 1000) + 86400 * 7 })
  ).toString('base64url');
  const secret = process.env.JWT_SECRET || 'cyber_escape_super_secret_jwt_key_2026';
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
  return `${header}.${payload}.${signature}`;
}

function verifyToken(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const secret = process.env.JWT_SECRET || 'cyber_escape_super_secret_jwt_key_2026';
    const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${payload}`).digest('base64url');
    if (signature !== expectedSig) return null;
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return null;
    return decoded.userId || null;
  } catch {
    return null;
  }
}

function calculateLevel(xp: number): { level: number; levelTitle: string; xpToNextLevel: number } {
  if (xp < 300) return { level: 1, levelTitle: 'DIGITAL ROOKIE', xpToNextLevel: 300 };
  if (xp < 700) return { level: 2, levelTitle: 'THREAT SPOTTER', xpToNextLevel: 700 };
  if (xp < 1200) return { level: 3, levelTitle: 'CYBER SCOUT', xpToNextLevel: 1200 };
  if (xp < 2000) return { level: 4, levelTitle: 'SECURITY HUNTER', xpToNextLevel: 2000 };
  if (xp < 3200) return { level: 5, levelTitle: 'CYBER DEFENDER', xpToNextLevel: 3200 };
  if (xp < 4800) return { level: 6, levelTitle: 'DIGITAL GUARDIAN', xpToNextLevel: 4800 };
  if (xp < 7000) return { level: 7, levelTitle: 'CYBER SENTINEL', xpToNextLevel: 7000 };
  return { level: 8, levelTitle: 'SECURITY MASTER', xpToNextLevel: 10000 };
}

// Lazy Gemini API client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return geminiClient;
}

// Authentication Middleware
function authMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized. Secure session token required.' });
  }
  const token = authHeader.split(' ')[1];
  const userId = verifyToken(token);
  if (!userId || !db.users[userId]) {
    return res.status(401).json({ error: 'Session expired or invalid. Please authenticate.' });
  }
  (req as unknown as { user: User }).user = db.users[userId];
  next();
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'active', platform: 'Digital Safety Escape Room Core Engine v2.5' });
  });

  // -------------------- AUTHENTICATION APIS --------------------
  app.post('/api/auth/register', (req, res) => {
    const { username, email, password, campus } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }
    const existing = Object.values(db.users).find(
      (u) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
    );
    if (existing) {
      return res.status(400).json({ error: 'User with this email or username already exists in registry.' });
    }
    const id = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newUser: User & { passwordHash: string } = {
      id,
      username,
      email,
      avatar: '🛡️',
      level: 1,
      levelTitle: 'DIGITAL ROOKIE',
      xp: 0,
      xpToNextLevel: 300,
      lives: 3,
      maxLives: 3,
      streak: 1,
      cyberSafetyScore: 75,
      campus: campus || 'General Academy',
      role: 'player',
      createdAt: new Date().toISOString(),
      completedMissions: [],
      perfectMissions: 0,
      threatsIdentified: 0,
      bestCombo: 0,
      categoryScores: {
        phishing: 75,
        password: 75,
        qr: 75,
        scam: 75,
        social_engineering: 75,
        multi_threat: 75
      },
      passwordHash: hashPassword(password)
    };
    db.users[id] = newUser;
    saveDatabase();
    const token = generateToken(id);
    const { passwordHash: _, ...safeUser } = newUser;
    res.json({ token, user: safeUser });
  });

  app.post('/api/auth/login', (req, res) => {
    const { emailOrUsername, password } = req.body;
    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Email/username and password required.' });
    }
    const hash = hashPassword(password);
    const user = Object.values(db.users).find(
      (u) =>
        (u.email.toLowerCase() === emailOrUsername.toLowerCase() ||
          u.username.toLowerCase() === emailOrUsername.toLowerCase()) &&
        u.passwordHash === hash
    );
    if (!user) {
      return res.status(401).json({ error: 'Invalid cybersecurity credentials.' });
    }
    const token = generateToken(user.id);
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  });

  // Hackathon Demo Mode instant login
  app.post('/api/auth/demo', (_req, res) => {
    const demoUser = db.users[INITIAL_DEMO_USER.id];
    // Reset lives to 3 for clean testing
    demoUser.lives = 3;
    const token = generateToken(demoUser.id);
    const { passwordHash: _, ...safeUser } = demoUser;
    res.json({ token, user: safeUser, demoMode: true });
  });

  app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { passwordHash: _, ...safeUser } = user as User & { passwordHash?: string };
    res.json({ user: safeUser });
  });

  // -------------------- MISSIONS & CHALLENGES APIS --------------------
  app.get('/api/missions', (_req, res) => {
    // Return all missions with their challenge metadata
    res.json({ missions: db.missions });
  });

  app.get('/api/missions/:id', (req, res) => {
    const mission = db.missions.find((m) => m.id === req.params.id);
    if (!mission) {
      return res.status(404).json({ error: 'Mission not found in registry.' });
    }
    res.json({ mission });
  });

  app.get('/api/challenges/:id', (req, res) => {
    for (const m of db.missions) {
      const c = m.challenges.find((ch) => ch.id === req.params.id);
      if (c) return res.json({ challenge: c });
    }
    return res.status(404).json({ error: 'Challenge scenario not found.' });
  });

  // Admin challenge management
  app.post('/api/challenges', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin authorization required.' });
    }
    const { missionId, title, category, difficulty, scenario, options, correctAnswerId, explanation, learningObjective, clues } = req.body;
    const mission = db.missions.find((m) => m.id === missionId);
    if (!mission) {
      return res.status(404).json({ error: 'Target mission not found.' });
    }
    const newChallenge: Challenge = {
      id: `ch-custom-${Date.now()}`,
      missionId,
      title: title || 'Custom Security Drill',
      category: category || mission.category,
      difficulty: difficulty || 'INTERMEDIATE',
      scenario: scenario || 'Security threat evaluation scenario.',
      timeLimit: 120,
      xpReward: 120,
      clues: clues || [],
      options: options || [],
      correctAnswerId: correctAnswerId || options?.[0]?.id || '',
      explanation: explanation || 'Always adhere to zero-trust verification.',
      learningObjective: learningObjective || 'Identify cyber risk indicators.'
    };
    mission.challenges.push(newChallenge);
    saveDatabase();
    res.json({ success: true, challenge: newChallenge });
  });

  app.delete('/api/challenges/:id', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin authorization required.' });
    }
    let deleted = false;
    for (const m of db.missions) {
      const idx = m.challenges.findIndex((ch) => ch.id === req.params.id);
      if (idx !== -1) {
        m.challenges.splice(idx, 1);
        deleted = true;
        break;
      }
    }
    if (!deleted) {
      return res.status(404).json({ error: 'Challenge not found.' });
    }
    saveDatabase();
    res.json({ success: true, message: 'Challenge successfully deleted.' });
  });

  // -------------------- GAMEPLAY & ANTI-CHEAT ENGINE --------------------
  app.post('/api/game/start', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { missionId } = req.body;
    const mission = db.missions.find((m) => m.id === missionId) || db.missions[0];
    if (!mission || mission.challenges.length === 0) {
      return res.status(400).json({ error: 'No active challenges in mission.' });
    }

    // Reset user lives to 3 for new mission attempt if zero
    if (user.lives <= 0) {
      user.lives = 3;
    }

    const session: GameSession = {
      missionId: mission.id,
      currentChallengeIndex: 0,
      currentChallenge: mission.challenges[0],
      totalChallenges: mission.challenges.length,
      lives: user.lives,
      score: 0,
      xpEarned: 0,
      combo: 0,
      discoveredClues: [],
      hintsUsed: 0,
      timeRemaining: mission.challenges[0].timeLimit || 120,
      startedAt: Date.now(),
      isComplete: false,
      isBreached: false,
      attempts: []
    };

    db.sessions[user.id] = session;
    saveDatabase();

    res.json({
      session,
      missionTitle: mission.title,
      currentChallenge: mission.challenges[0]
    });
  });

  app.post('/api/game/clue', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { clueId } = req.body;
    const session = db.sessions[user.id];
    if (!session) {
      return res.status(400).json({ error: 'No active session found.' });
    }
    if (!session.discoveredClues.includes(clueId)) {
      session.discoveredClues.push(clueId);
      // Server calculated bonus: +50 XP for hidden investigation clue
      session.xpEarned += 50;
      session.score += 50;
      user.xp += 50;
      user.threatsIdentified += 1;
      const levelInfo = calculateLevel(user.xp);
      user.level = levelInfo.level;
      user.levelTitle = levelInfo.levelTitle;
      user.xpToNextLevel = levelInfo.xpToNextLevel;
      saveDatabase();
    }
    res.json({
      success: true,
      discoveredClues: session.discoveredClues,
      xpEarned: session.xpEarned,
      threatAnalysisBonus: 50
    });
  });

  app.post('/api/game/hint', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const session = db.sessions[user.id];
    if (!session) {
      return res.status(400).json({ error: 'No active session found.' });
    }
    session.hintsUsed += 1;
    const ch = session.currentChallenge;
    const hintText = ch.clues?.[0]
      ? `Investigate the ${ch.clues[0].location}: ${ch.clues[0].name}`
      : `Look closely at the sender credentials, urgency signals, and domain structure.`;
    saveDatabase();
    res.json({
      hint: hintText,
      hintsUsed: session.hintsUsed
    });
  });

  app.post('/api/game/answer', authMiddleware, async (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { selectedOptionId, responseTimeMs } = req.body;
    const session = db.sessions[user.id];

    if (!session || session.isComplete || session.isBreached) {
      return res.status(400).json({ error: 'No active session or session already closed.' });
    }

    const challenge = session.currentChallenge;
    const selectedOption = challenge.options.find((o) => o.id === selectedOptionId);

    if (!selectedOption) {
      return res.status(400).json({ error: 'Invalid option selected.' });
    }

    const isCorrect = selectedOption.isCorrect;
    let xpGained = 0;
    let speedBonus = 0;
    let comboMultiplier = 1;

    if (isCorrect) {
      // Speed bonus if answered under 30 seconds
      if (responseTimeMs && responseTimeMs < 30000) {
        speedBonus = 25;
      }
      session.combo += 1;
      if (session.combo > user.bestCombo) {
        user.bestCombo = session.combo;
      }
      comboMultiplier = 1 + Math.min(session.combo - 1, 5) * 0.15;
      xpGained = Math.round((challenge.xpReward + speedBonus) * comboMultiplier);

      session.xpEarned += xpGained;
      session.score += xpGained;
      user.xp += xpGained;
      user.threatsIdentified += 1;
      user.streak += 1;

      // Improve category score
      user.categoryScores[challenge.category] = Math.min(
        100,
        (user.categoryScores[challenge.category] || 75) + 3
      );
    } else {
      // Wrong answer: deduct a life
      session.combo = 0;
      session.lives = Math.max(0, session.lives - 1);
      user.lives = session.lives;
      user.streak = 0;

      // Penalize category score
      user.categoryScores[challenge.category] = Math.max(
        35,
        (user.categoryScores[challenge.category] || 75) - 6
      );
    }

    // Recompute overall Cyber Safety Score
    const cats = Object.values(user.categoryScores);
    const avgScore = Math.round(cats.reduce((a, b) => a + b, 0) / cats.length);
    user.cyberSafetyScore = avgScore;

    // Recalculate level
    const levelInfo = calculateLevel(user.xp);
    const prevLevel = user.level;
    user.level = levelInfo.level;
    user.levelTitle = levelInfo.levelTitle;
    user.xpToNextLevel = levelInfo.xpToNextLevel;
    const didLevelUp = user.level > prevLevel;

    // Log attempt for analytics
    db.attempts.unshift({
      id: `att-${Date.now()}`,
      userId: user.id,
      username: user.username,
      challengeId: challenge.id,
      challengeTitle: challenge.title,
      category: challenge.category,
      isCorrect,
      responseTimeMs: responseTimeMs || 5000,
      timestamp: new Date().toISOString()
    });

    session.attempts.push({
      challengeId: challenge.id,
      selectedOptionId,
      isCorrect,
      responseTimeMs: responseTimeMs || 5000,
      discoveredClues: [...session.discoveredClues]
    });

    // Check breach condition
    if (session.lives <= 0) {
      session.isBreached = true;
    }

    // Check if next challenge exists
    const mission = db.missions.find((m) => m.id === session.missionId);
    let nextChallenge: Challenge | null = null;
    let isMissionComplete = false;

    if (!session.isBreached) {
      if (mission && session.currentChallengeIndex + 1 < mission.challenges.length) {
        session.currentChallengeIndex += 1;
        session.currentChallenge = mission.challenges[session.currentChallengeIndex];
        nextChallenge = session.currentChallenge;
      } else {
        session.isComplete = true;
        isMissionComplete = true;
        if (!user.completedMissions.includes(session.missionId)) {
          user.completedMissions.push(session.missionId);
        }
        if (session.lives === user.maxLives) {
          user.perfectMissions += 1;
          user.xp += 250; // Perfect mission bonus
          session.xpEarned += 250;
        }
      }
    }

    saveDatabase();

    // AI Cyber Coach generation
    const warningSigns = challenge.clues.map((c) => `${c.name}: ${c.description}`);
    const explanationText = selectedOption.explanation;

    res.json({
      isCorrect,
      selectedOption,
      lives: session.lives,
      score: session.score,
      xpGained,
      speedBonus,
      combo: session.combo,
      isBreached: session.isBreached,
      isMissionComplete,
      didLevelUp,
      level: user.level,
      levelTitle: user.levelTitle,
      cyberSafetyScore: user.cyberSafetyScore,
      nextChallenge,
      aiCoachFeedback: {
        isCorrect,
        verdict: isCorrect ? '⚡ THREAT NEUTRALIZED' : '🚨 CRITICAL SECURITY FAULT',
        threatType: challenge.category.toUpperCase(),
        identifiedWarningSigns: warningSigns,
        explanation: explanationText,
        threatAnalysisBonus: isCorrect ? 50 : 0,
        xpAwarded: xpGained,
        nextStepRecommendation: isCorrect
          ? 'Maintain zero-trust posture. Advance to the next security checkpoint.'
          : `Review ${challenge.category} indicators. Do not take unsolicited requests at face value.`,
        weaknessIdentified: isCorrect ? undefined : challenge.category
      }
    });
  });

  app.post('/api/game/complete', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const session = db.sessions[user.id];

    // Check achievement unlocks
    const unlockedAchievements: Achievement[] = [];
    if (user.completedMissions.length >= 1) {
      const ach = db.achievements.find((a) => a.id === 'ach-1');
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        unlockedAchievements.push(ach);
      }
    }
    if (user.completedMissions.length >= 5) {
      const ach = db.achievements.find((a) => a.id === 'ach-8');
      if (ach && !ach.unlocked) {
        ach.unlocked = true;
        ach.unlockedAt = new Date().toISOString();
        unlockedAchievements.push(ach);
      }
    }

    saveDatabase();

    res.json({
      success: true,
      user,
      session,
      unlockedAchievements,
      finalEscapeReady: user.completedMissions.length >= 5
    });
  });

  // -------------------- PASSWORD ANALYSIS & ZXCVBN APIS --------------------
  app.post('/api/password/analyze', (req, res) => {
    const { password, userInputs } = req.body;
    if (typeof password !== 'string') {
      return res.status(400).json({ error: 'Password string required.' });
    }
    const result = evaluatePasswordWithZxcvbn(password, Array.isArray(userInputs) ? userInputs : []);
    const crackTimes = result.crack_times_display;
    const score = result.score;
    const feedback = result.feedback;
    const isTerminalOverrideValid = score >= 3;
    const entropy = Math.round(result.guesses_log10 * 3.322 * 10) / 10;

    res.json({
      score,
      guesses: result.guesses,
      guessesLog10: result.guesses_log10,
      entropy,
      crackTimesDisplay: {
        offlineFastHashing1e10PerSecond: crackTimes.offline_fast_hashing_1e10_per_second,
        offlineSlowHashing1e4PerSecond: crackTimes.offline_slow_hashing_1e4_per_second,
        onlineNoThrottling10PerSecond: crackTimes.online_no_throttling_10_per_second,
        onlineThrottling100PerHour: crackTimes.online_throttling_100_per_hour
      },
      feedback: {
        warning: feedback.warning || (score >= 3 ? 'High-entropy passphrase profile. No dictionary or keyboard flaws.' : 'Easily guessable pattern detected.'),
        suggestions: feedback.suggestions.length > 0
          ? feedback.suggestions
          : score >= 3
          ? ['Excellent strength! Store your passphrases in an encrypted password manager.']
          : ['Combine 4+ unrelated words or use random symbols to resist dictionary attacks.']
      },
      sequenceSummary: (result.sequence || []).map((s: any) => ({
        pattern: s.pattern,
        token: s.token,
        guesses: s.guesses
      })),
      isTerminalOverrideValid,
      verdict: score >= 3 ? 'TERMINAL_OVERRIDE_PERMITTED' : 'ACCESS_DENIED_LOW_ENTROPY'
    });
  });

  app.post('/api/password/terminal-override', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { password } = req.body;
    const session = db.sessions[user.id];

    if (typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({ error: 'Password string required for terminal bypass.' });
    }

    const result = evaluatePasswordWithZxcvbn(password);
    const score = result.score;
    const passed = score >= 3;

    if (passed) {
      const xpReward = 180 + (score === 4 ? 70 : 0);
      user.xp += xpReward;
      user.threatsIdentified += 1;
      user.streak += 1;
      user.categoryScores.password = Math.min(100, (user.categoryScores.password || 75) + 4);
      const levelInfo = calculateLevel(user.xp);
      user.level = levelInfo.level;
      user.levelTitle = levelInfo.levelTitle;
      user.xpToNextLevel = levelInfo.xpToNextLevel;

      if (session && !session.isBreached && !session.isComplete) {
        session.score += xpReward;
        session.xpEarned += xpReward;
        session.combo += 1;
      }

      saveDatabase();
      return res.json({
        success: true,
        score,
        xpAwarded: xpReward,
        message: `Terminal Override Authenticated! Entropy Score: ${score}/4. Access Granted.`,
        crackTime: result.crack_times_display.offline_slow_hashing_1e4_per_second,
        feedback: result.feedback
      });
    } else {
      if (session) {
        session.combo = 0;
        session.lives = Math.max(0, session.lives - 1);
        user.lives = session.lives;
        if (session.lives <= 0) session.isBreached = true;
      }
      user.categoryScores.password = Math.max(35, (user.categoryScores.password || 75) - 5);
      saveDatabase();
      return res.status(400).json({
        success: false,
        score,
        livesRemaining: session ? session.lives : user.lives,
        message: 'Access Denied: Password entropy below security threshold (score must be at least 3/4).',
        warning: result.feedback.warning || 'Predictable or weak sequence detected.',
        suggestions: result.feedback.suggestions
      });
    }
  });

  // -------------------- THREAT INSPECTION & VERIFICATION APIS --------------------
  app.post('/api/inspect/qr', (req, res) => {
    const { url, hasPhysicalTamper, misalignedBorder, hasOverlaySticker } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL string payload required.' });
    }

    const redFlags: string[] = [];
    let riskScore = 0;
    let isIpAddress = false;
    let isShortener = false;
    let hasHomoglyphs = false;
    let isSslSecure = false;
    let hostname = '';
    let protocol = '';

    try {
      const parsed = new URL(url.startsWith('http') ? url : `http://${url}`);
      hostname = parsed.hostname;
      protocol = parsed.protocol;
      isSslSecure = protocol === 'https:';

      if (!isSslSecure) {
        riskScore += 25;
        redFlags.push('Insecure cleartext HTTP protocol (unencrypted transport)');
      }

      // IP address check
      if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(':')) {
        isIpAddress = true;
        riskScore += 45;
        redFlags.push(`Direct IP address destination: ${hostname} (bypasses domain registration records)`);
      }

      // Link shorteners
      const shorteners = ['bit.ly', 'tinyurl.com', 't.co', 'is.gd', 'buff.ly', 'ow.ly', 'cutt.ly', 'qrco.de'];
      if (shorteners.some((s) => hostname.toLowerCase().includes(s))) {
        isShortener = true;
        riskScore += 35;
        redFlags.push(`Masked redirection shortener detected (${hostname})`);
      }

      // Abnormal TLDs
      const suspiciousTlds = ['.xyz', '.top', '.click', '.tk', '.work', '.zip', '.mov', '.cc'];
      if (suspiciousTlds.some((tld) => hostname.toLowerCase().endsWith(tld))) {
        riskScore += 25;
        redFlags.push(`High-abuse Top-Level Domain detected (${hostname})`);
      }

      // Homoglyphs or non-ascii
      if (/[^\x00-\x7F]/.test(hostname) || hostname.startsWith('xn--')) {
        hasHomoglyphs = true;
        riskScore += 50;
        redFlags.push('Punycode / Cyrillic homoglyph domain spoofing detected');
      }
    } catch {
      riskScore += 30;
      redFlags.push('Malformed or non-standard URI scheme');
    }

    // Physical tampering cues
    const isTampered = Boolean(hasPhysicalTamper || misalignedBorder || hasOverlaySticker);
    if (isTampered) {
      riskScore += 40;
      redFlags.push('Physical inspection anomaly: adhesive sticker overlay or misaligned boundary detected on physical signage');
    }

    riskScore = Math.min(100, riskScore);
    const verdict: 'SAFE' | 'SUSPICIOUS' | 'CRITICAL_RISK' =
      riskScore >= 60 ? 'CRITICAL_RISK' : riskScore >= 30 ? 'SUSPICIOUS' : 'SAFE';

    const explanation =
      verdict === 'CRITICAL_RISK'
        ? 'High-probability Quishing attack. The QR destination exploits evasion techniques (IP routing, shorteners, or physical overlay) to hijack device sessions.'
        : verdict === 'SUSPICIOUS'
        ? 'Unverified destination. Treat with caution and verify the final URL destination out-of-band before entering credentials.'
        : 'Legitimate destination. Proper HTTPS encryption and authenticated domain root detected.';

    const defensiveAdvice =
      verdict === 'SAFE'
        ? 'Safe to proceed. Always double-check browser address bar after page loads.'
        : 'Do NOT scan or open this QR code. Manually type the official organization website into your browser address bar.';

    res.json({
      verdict,
      riskScore,
      isTampered,
      destinationDetails: {
        originalUrl: url,
        hostname,
        protocol,
        isIpAddress,
        isShortener,
        hasHomoglyphs,
        isSslSecure
      },
      redFlags,
      explanation,
      defensiveAdvice
    });
  });

  app.post('/api/inspect/email', (req, res) => {
    const { senderEmail, displaySender, subject, targetUrl, displayUrl, bodyText } = req.body;
    if (!senderEmail || typeof senderEmail !== 'string') {
      return res.status(400).json({ error: 'Sender email address required.' });
    }

    const identifiedRedFlags: string[] = [];
    let phishingRiskScore = 0;

    // Check sender domain spoofing
    const domainMatch = senderEmail.match(/@([^@]+)$/);
    const domain = domainMatch ? domainMatch[1].toLowerCase() : '';
    const display = (displaySender || '').toLowerCase();
    let isSpoofedSender = false;

    const brandSpoofs = [
      { brand: 'paypal', legitimate: 'paypal.com', patterns: ['paypa1', 'pay-pal', 'paypal-security', 'paypal-update'] },
      { brand: 'amazon', legitimate: 'amazon.com', patterns: ['amaz0n', 'amazon-billing', 'amazon-support', 'amz-security'] },
      { brand: 'microsoft', legitimate: 'microsoft.com', patterns: ['micros0ft', 'ms-verify', 'office365-security'] },
      { brand: 'apple', legitimate: 'apple.com', patterns: ['app1e', 'appleid-support', 'icloud-security'] },
      { brand: 'google', legitimate: 'google.com', patterns: ['g00gle', 'google-verify', 'gmail-security'] }
    ];

    for (const b of brandSpoofs) {
      if (display.includes(b.brand) || domain.includes(b.brand)) {
        if (!domain.endsWith(b.legitimate)) {
          isSpoofedSender = true;
          phishingRiskScore += 45;
          identifiedRedFlags.push(`Spoofed Sender Domain: Displays "${displaySender}" but sends from fraudulent domain "@${domain}"`);
          break;
        }
      }
      if (b.patterns.some((p) => domain.includes(p))) {
        isSpoofedSender = true;
        phishingRiskScore += 45;
        identifiedRedFlags.push(`Typosquatted domain pattern: "@${domain}" mimics ${b.legitimate}`);
        break;
      }
    }

    // Link mismatch check
    let isMismatchedUrl = false;
    if (targetUrl && displayUrl) {
      if (targetUrl.trim().toLowerCase() !== displayUrl.trim().toLowerCase()) {
        isMismatchedUrl = true;
        phishingRiskScore += 40;
        identifiedRedFlags.push(`Mismatched Anchor Destination: Visible link displays "${displayUrl}" but redirects to hidden destination "${targetUrl}"`);
      }
    }

    // Urgency & Coercion language
    const combinedContent = `${subject || ''} ${bodyText || ''}`.toLowerCase();
    const urgencyKeywords = ['urgent', 'immediately', '24 hours', 'account suspended', 'terminated', 'action required', 'unauthorized transaction', 'arrest', 'warrant'];
    const hasUrgencyPressure = urgencyKeywords.some((k) => combinedContent.includes(k));
    if (hasUrgencyPressure) {
      phishingRiskScore += 25;
      identifiedRedFlags.push('Artificial Urgency Trigger: Pressures user to act quickly without thinking');
    }

    // Threatening / Credential harvesting language
    const harvestKeywords = ['enter password', 'confirm ssn', 'verify credentials', 'update payment', 'suspended permanently'];
    const hasThreateningLanguage = harvestKeywords.some((k) => combinedContent.includes(k));
    if (hasThreateningLanguage) {
      phishingRiskScore += 20;
      identifiedRedFlags.push('Credential Harvesting Trigger: Demands sensitive authentication credentials');
    }

    phishingRiskScore = Math.min(100, phishingRiskScore);
    const verdict: 'LEGITIMATE' | 'PHISHING' | 'SUSPICIOUS' =
      phishingRiskScore >= 50 ? 'PHISHING' : phishingRiskScore >= 25 ? 'SUSPICIOUS' : 'LEGITIMATE';

    const explanation =
      verdict === 'PHISHING'
        ? 'This communication exhibits classic spear-phishing traits: deliberate domain lookalike deception, artificial urgency, and obscured hyperlink redirection.'
        : verdict === 'SUSPICIOUS'
        ? 'Unverified external communication with ambiguous indicators. Exercise caution.'
        : 'Authenticated sender domain with matching links and no coercive triggers.';

    const tacticalAdvice =
      verdict === 'PHISHING'
        ? 'Never click links or open attachments in unsolicited security alerts. Navigate to the verified portal directly in a clean tab.'
        : 'Validate sender headers and examine SPF/DKIM verification badges.';

    res.json({
      verdict,
      phishingRiskScore,
      indicators: {
        isSpoofedSender,
        isMismatchedUrl,
        hasUrgencyPressure,
        hasThreateningLanguage
      },
      identifiedRedFlags,
      explanation,
      tacticalAdvice
    });
  });

  app.post('/api/inspect/scam', (req, res) => {
    const { messageText, platform, senderNumber, linkUrl } = req.body;
    if (!messageText || typeof messageText !== 'string') {
      return res.status(400).json({ error: 'Message text string required.' });
    }

    const detectedPatterns: string[] = [];
    let scamRiskScore = 0;
    let scamVector = 'SMS Smishing';
    const text = messageText.toLowerCase();

    // Package delivery smishing
    if (text.includes('package') || text.includes('usps') || text.includes('fedex') || text.includes('detained') || text.includes('redelivery')) {
      scamVector = 'Postal / Parcel Impersonation Smishing';
      scamRiskScore += 35;
      detectedPatterns.push('Unsolicited parcel delivery exception notice (requests fee or address update)');
    }

    // Financial / Banking smishing
    if (text.includes('bank') || text.includes('zelle') || text.includes('fraud') || text.includes('wire') || text.includes('blocked') || text.includes('otp')) {
      scamVector = 'Financial Fraud / OTP Theft Smishing';
      scamRiskScore += 45;
      detectedPatterns.push('Unsolicited banking fraud alert requesting OTP or urgent transaction confirmation');
    }

    // Job offer / Crypto investment lure
    if (text.includes('part-time') || text.includes('telegram') || text.includes('airdrop') || text.includes('$300/day') || text.includes('crypto')) {
      scamVector = 'Advance-Fee / Task Scam';
      scamRiskScore += 40;
      detectedPatterns.push('Unrealistic high-paying task scam or cryptocurrency investment lure');
    }

    // External link in SMS
    if (text.includes('http://') || text.includes('https://') || text.includes('.com') || text.includes('.ly') || linkUrl) {
      scamRiskScore += 25;
      detectedPatterns.push('Contains untrusted external link designed to harvest mobile credentials');
    }

    // Artificial urgency
    if (text.includes('within 24h') || text.includes('immediately') || text.includes('final notice') || text.includes('respond now')) {
      scamRiskScore += 20;
      detectedPatterns.push('High-urgency deadline designed to cause cognitive panic');
    }

    scamRiskScore = Math.min(100, scamRiskScore);
    const verdict: 'LEGITIMATE' | 'SCAM_SMISHING' | 'SUSPICIOUS' =
      scamRiskScore >= 50 ? 'SCAM_SMISHING' : scamRiskScore >= 25 ? 'SUSPICIOUS' : 'LEGITIMATE';

    const explanation =
      verdict === 'SCAM_SMISHING'
        ? `Confirmed ${scamVector}. Threat actors leverage spoofed SMS numbers and emotional urgency to trick victims into entering banking details or OTPs on rogue sites.`
        : 'Ambiguous message. Verify the sender number before interacting.';

    const recommendedAction =
      verdict === 'SCAM_SMISHING'
        ? 'Do not reply (STOP confirms active line). Block sender, report as spam to 7726 (SPAM), and delete message.'
        : 'Confirm authenticity through official customer service channels.';

    res.json({
      verdict,
      scamRiskScore,
      scamVector,
      detectedPatterns,
      explanation,
      recommendedAction
    });
  });

  // -------------------- GAUNTLET / SURVIVAL ESCALATION APIS (10-20 LEVELS) --------------------
  // Gather all challenges into tiered pools
  function getAllTierChallenges(): {
    tier1: Challenge[];
    tier2: Challenge[];
    tier3: Challenge[];
  } {
    const all: Challenge[] = [];
    db.missions.forEach((m) => all.push(...m.challenges));

    const tier1 = all.filter((c) => c.difficulty === 'ROOKIE');
    const tier2 = all.filter((c) => c.difficulty === 'INTERMEDIATE');
    const tier3 = all.filter((c) => c.difficulty === 'ADVANCED' || c.difficulty === 'NIGHTMARE');

    // Ensure adequate minimum pool sizes
    if (tier1.length === 0) tier1.push(all[0]);
    if (tier2.length === 0) tier2.push(all[1] || all[0]);
    if (tier3.length === 0) tier3.push(all[all.length - 1] || all[0]);

    return { tier1, tier2, tier3 };
  }

  app.get('/api/game/gauntlet/pools', (_req, res) => {
    const { tier1, tier2, tier3 } = getAllTierChallenges();
    res.json({
      tier1Count: tier1.length,
      tier2Count: tier2.length,
      tier3Count: tier3.length,
      totalChallenges: tier1.length + tier2.length + tier3.length,
      tiers: {
        tier1: { levels: '1-5', title: 'ROOKIE - Obvious Indicators & Clues' },
        tier2: { levels: '6-12', title: 'INTERMEDIATE - Subtle Spoofing & Shorteners' },
        tier3: { levels: '13-20', title: 'ADVANCED / NIGHTMARE - Homoglyphs & Entropy Mastery' }
      }
    });
  });

  app.post('/api/game/gauntlet/start', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { tier1 } = getAllTierChallenges();
    const firstChallenge = tier1[Math.floor(Math.random() * tier1.length)];

    const runId = `gauntlet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const run: GauntletSession = {
      runId,
      userId: user.id,
      currentLevel: 1,
      totalLevels: 20,
      tier: 'ROOKIE',
      lives: 3,
      score: 0,
      xpEarned: 0,
      combo: 0,
      encounteredChallengeIds: [firstChallenge.id],
      currentChallenge: firstChallenge,
      isEliminated: false,
      isGauntletCompleted: false,
      startedAt: Date.now()
    };

    db.gauntletRuns[user.id] = run;
    saveDatabase();

    res.json({
      runId,
      currentLevel: 1,
      totalLevels: 20,
      tier: 'ROOKIE',
      lives: 3,
      score: 0,
      currentChallenge: firstChallenge
    });
  });

  app.post('/api/game/gauntlet/answer', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { selectedOptionId, responseTimeMs } = req.body;
    const run = db.gauntletRuns[user.id];

    if (!run || run.isEliminated || run.isGauntletCompleted) {
      return res.status(400).json({ error: 'No active survival run found. Start a new gauntlet run.' });
    }

    const currentCh = run.currentChallenge;
    const selectedOpt = currentCh.options.find((o) => o.id === selectedOptionId);

    if (!selectedOpt) {
      return res.status(400).json({ error: 'Invalid option selected.' });
    }

    const isCorrect = selectedOpt.isCorrect;
    let xpGained = 0;
    let finalBadge: string | undefined;

    if (isCorrect) {
      run.combo += 1;
      const speedBonus = responseTimeMs && responseTimeMs < 20000 ? 30 : 0;
      const multiplier = 1 + Math.min(run.combo - 1, 6) * 0.15;
      xpGained = Math.round((currentCh.xpReward + speedBonus) * multiplier);

      run.score += xpGained;
      run.xpEarned += xpGained;
      user.xp += xpGained;
      user.threatsIdentified += 1;
      user.streak += 1;

      // Advance level
      if (run.currentLevel >= run.totalLevels) {
        run.isGauntletCompleted = true;
        finalBadge = 'Security Architect';
      } else {
        run.currentLevel += 1;
        // Determine new tier
        if (run.currentLevel <= 5) {
          run.tier = 'ROOKIE';
        } else if (run.currentLevel <= 12) {
          run.tier = 'INTERMEDIATE';
        } else {
          run.tier = 'ADVANCED';
        }

        // Pick next challenge from active tier without repeating if possible
        const pools = getAllTierChallenges();
        const activePool = run.tier === 'ROOKIE' ? pools.tier1 : run.tier === 'INTERMEDIATE' ? pools.tier2 : pools.tier3;
        const available = activePool.filter((c) => !run.encounteredChallengeIds.includes(c.id));
        const nextCh = available.length > 0
          ? available[Math.floor(Math.random() * available.length)]
          : activePool[Math.floor(Math.random() * activePool.length)];

        run.encounteredChallengeIds.push(nextCh.id);
        run.currentChallenge = nextCh;
      }
    } else {
      run.combo = 0;
      run.lives = Math.max(0, run.lives - 1);
      user.streak = 0;

      if (run.lives <= 0) {
        run.isEliminated = true;
        // Assign badge based on level achieved
        if (run.currentLevel <= 5) finalBadge = 'Cyber Novice';
        else if (run.currentLevel <= 9) finalBadge = 'Threat Spotter';
        else if (run.currentLevel <= 14) finalBadge = 'Cyber Scout';
        else if (run.currentLevel <= 18) finalBadge = 'Security Hunter';
        else finalBadge = 'Cyber Defender';
      }
    }

    const levelInfo = calculateLevel(user.xp);
    user.level = levelInfo.level;
    user.levelTitle = levelInfo.levelTitle;
    user.xpToNextLevel = levelInfo.xpToNextLevel;

    saveDatabase();

    res.json({
      isCorrect,
      currentLevel: run.currentLevel,
      totalLevels: run.totalLevels,
      tier: run.tier,
      lives: run.lives,
      score: run.score,
      xpGained,
      combo: run.combo,
      isEliminated: run.isEliminated,
      isGauntletCompleted: run.isGauntletCompleted,
      finalBadge,
      cyberSafetyScore: user.cyberSafetyScore,
      nextChallenge: run.isEliminated || run.isGauntletCompleted ? undefined : run.currentChallenge,
      explanation: selectedOpt.explanation
    });
  });

  // -------------------- PROFILE & LEADERBOARD APIS --------------------
  app.get('/api/profile', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { passwordHash: _, ...safeUser } = user as User & { passwordHash?: string };
    res.json({ profile: safeUser });
  });

  app.get('/api/profile/stats', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const userAttempts = db.attempts.filter((a) => a.userId === user.id);
    const totalAnswered = userAttempts.length;
    const correctCount = userAttempts.filter((a) => a.isCorrect).length;
    const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 85;

    // Identify strengths and weaknesses
    const entries = Object.entries(user.categoryScores) as [ThreatCategory, number][];
    entries.sort((a, b) => b[1] - a[1]);
    const strength = entries[0] ? { category: entries[0][0], score: entries[0][1] } : { category: 'phishing', score: 92 };
    const weakness = entries[entries.length - 1]
      ? { category: entries[entries.length - 1][0], score: entries[entries.length - 1][1] }
      : { category: 'qr', score: 65 };

    res.json({
      overallSafetyScore: user.cyberSafetyScore,
      accuracy,
      totalAnswered,
      threatsIdentified: user.threatsIdentified,
      streak: user.streak,
      bestCombo: user.bestCombo,
      categoryScores: user.categoryScores,
      strength,
      weakness,
      completedMissionsCount: user.completedMissions.length
    });
  });

  app.get('/api/profile/achievements', authMiddleware, (_req, res) => {
    res.json({ achievements: db.achievements });
  });

  app.get('/api/leaderboard', (req, res) => {
    const campus = req.query.campus as string | undefined;
    let list = [...db.leaderboard];

    // Ensure demo user is present in leaderboard if not already
    const demoInLead = list.find((e) => e.username === INITIAL_DEMO_USER.username);
    if (!demoInLead) {
      list.push({
        id: 'lead-demo',
        rank: 7,
        username: INITIAL_DEMO_USER.username,
        avatar: INITIAL_DEMO_USER.avatar,
        xp: INITIAL_DEMO_USER.xp + 4000,
        cyberSafetyScore: INITIAL_DEMO_USER.cyberSafetyScore,
        level: INITIAL_DEMO_USER.level,
        levelTitle: INITIAL_DEMO_USER.levelTitle,
        missionsCompleted: INITIAL_DEMO_USER.completedMissions.length,
        perfectMissions: INITIAL_DEMO_USER.perfectMissions,
        streak: INITIAL_DEMO_USER.streak,
        campus: INITIAL_DEMO_USER.campus || 'Cyber Academy',
        badge: 'Security Hunter'
      });
    }

    if (campus && campus !== 'all') {
      list = list.filter((e) => e.campus.toLowerCase().includes(campus.toLowerCase()));
    }

    list.sort((a, b) => b.xp - a.xp);
    list = list.map((entry, idx) => ({ ...entry, rank: idx + 1 }));

    res.json({
      leaderboard: list,
      campuses: [
        'All Campuses',
        'MIT Cybersecurity Lab',
        'Stanford Infosec',
        'UC Berkeley EECS',
        'Georgia Tech Cyber',
        'CMU CyLab',
        'Oxford Cyber Security',
        'Cyber Defense Academy'
      ]
    });
  });

  // -------------------- AI CYBER COACH & ADAPTIVE DIFFICULTY --------------------
  app.post('/api/ai/explain', authMiddleware, async (req, res) => {
    const { challengeTitle, category, selectedAction, isCorrect, scenario } = req.body;
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `You are the AI CYBER COACH in a high-stakes gamified cybersecurity escape room.
The player just faced this security scenario:
Title: "${challengeTitle}"
Category: "${category}"
Scenario: "${scenario}"
Player Action: "${selectedAction}"
Outcome: ${isCorrect ? 'SUCCESS (Defended)' : 'FAILURE (Compromised)'}

Generate a concise, punchy video-game Cyber Coach debrief.
Format as JSON with keys:
- verdict (string, e.g. "⚡ THREAT NEUTRALIZED" or "🚨 SECURITY BREACH DETECTED")
- threatType (string, e.g. "Credential Phishing / Domain Spoofing")
- warningSigns (array of 2-3 short bullet strings highlighting red flags)
- explanation (2-3 punchy sentences explaining the underlying security principle)
- gameTip (1 actionable tactical takeaway for surviving digital threats)
Keep it under 120 words total. No markdown fences.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          source: 'gemini-ai',
          feedback: parsed
        });
      } catch (err) {
        console.warn('Gemini API call failed, falling back to expert cyber coach rules:', err);
      }
    }

    // Expert rule-based fallback if offline or no key
    const fallbackFeedback = {
      verdict: isCorrect ? '⚡ THREAT NEUTRALIZED' : '🚨 SECURITY BREACH DETECTED',
      threatType: `${category.toUpperCase()} ATTACK VECTOR`,
      warningSigns: [
        'Mismatched sender domain or obscured URL redirection',
        'Artificial urgency designed to bypass analytical scrutiny',
        'Unauthorized credential or token harvesting request'
      ],
      explanation: isCorrect
        ? 'Excellent operational security. You adhered to zero-trust verification and refused to trust unsolicited communication.'
        : 'The threat actor exploited social engineering, urgency, or deceptive links. Always verify out-of-band before taking action.',
      gameTip: 'Never trust, always verify: check the domain root, never paste OTPs, and use hardware security keys.'
    };

    res.json({
      source: 'expert-engine',
      feedback: fallbackFeedback
    });
  });

  app.post('/api/ai/generate-challenge', authMiddleware, async (req, res) => {
    const user = (req as unknown as { user: User }).user;
    const { targetCategory } = req.body;
    const category = targetCategory || 'qr';
    const ai = getGeminiClient();

    if (ai) {
      try {
        const prompt = `Generate a realistic interactive cybersecurity challenge scenario for a player struggling with "${category}".
Return valid JSON with:
{
  "title": "Short uppercase title",
  "category": "${category}",
  "difficulty": "INTERMEDIATE",
  "scenario": "A 2-3 sentence realistic workplace or student scenario",
  "clues": [
    {"name": "Clue 1 Name", "location": "Where to find it", "description": "Specific flaw to spot"}
  ],
  "options": [
    {"id": "opt-1", "text": "Wrong risky action", "isCorrect": false, "explanation": "Why this causes a breach"},
    {"id": "opt-2", "text": "Correct defensive action", "isCorrect": true, "explanation": "Why this is correct"}
  ],
  "learningObjective": "What the player learns"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const generated = JSON.parse(response.text || '{}');
        const customChallenge: Challenge = {
          id: `ai-ch-${Date.now()}`,
          missionId: 'adaptive-drill',
          title: generated.title || 'ADAPTIVE THREAT DRILL',
          category: generated.category || category,
          difficulty: 'INTERMEDIATE',
          scenario: generated.scenario || 'Analyze this high-priority adaptive threat scenario.',
          timeLimit: 120,
          xpReward: 150,
          clues: generated.clues?.map((c: { name: string; location: string; description: string }, i: number) => ({
            id: `ai-clue-${i}`,
            name: c.name,
            location: c.location,
            description: c.description,
            threatType: 'Adaptive Threat Indicator'
          })) || [],
          options: generated.options?.map((o: { id: string; text: string; isCorrect: boolean; explanation: string }) => ({
            id: o.id,
            text: o.text,
            isCorrect: o.isCorrect,
            explanation: o.explanation
          })) || [],
          correctAnswerId: generated.options?.find((o: { isCorrect: boolean }) => o.isCorrect)?.id || 'opt-2',
          explanation: 'Targeted drill completed.',
          learningObjective: generated.learningObjective || 'Defend against adaptive threat patterns.'
        };

        return res.json({ challenge: customChallenge, source: 'gemini' });
      } catch (err) {
        console.warn('AI Challenge generation fallback:', err);
      }
    }

    // Adaptive fallback drill
    const fallbackAdaptive: Challenge = {
      id: `ai-ch-fallback-${Date.now()}`,
      missionId: 'adaptive-drill',
      title: `ADAPTIVE TARGET: ${category.toUpperCase()} DEFENSE DRILL`,
      category,
      difficulty: 'INTERMEDIATE',
      scenario: `The Cyber Coach identified ${category} as your current vulnerability area. A targeted simulation has been deployed to reinforce your muscle memory.`,
      timeLimit: 120,
      xpReward: 150,
      clues: [
        {
          id: 'ai-c-1',
          name: 'Anomalous Redirection Path',
          location: 'Protocol Header',
          description: 'Destination attempts to bypass standard authentication gateways.',
          threatType: 'Protocol Anomaly'
        }
      ],
      options: [
        {
          id: 'ad-opt-1',
          text: 'Ignore standard procedure and trust the prompt to speed up workflow',
          isCorrect: false,
          explanation: 'Rushing through security prompts without validation leads to immediate compromise.'
        },
        {
          id: 'ad-opt-2',
          text: 'Enforce strict out-of-band verification and report to Security Operations Center',
          isCorrect: true,
          explanation: 'Flawless execution! You identified and neutralized the adaptive threat.'
        }
      ],
      correctAnswerId: 'ad-opt-2',
      explanation: 'Muscle memory in cybersecurity is built through targeted repetition.',
      learningObjective: `Master threat discernment in ${category}.`
    };

    res.json({ challenge: fallbackAdaptive, source: 'expert-engine' });
  });

  // -------------------- ADMIN ANALYTICS APIS --------------------
  app.get('/api/admin/analytics', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }

    const allUsers = Object.values(db.users);
    const totalPlayers = allUsers.length;
    const activePlayers = allUsers.filter((u) => u.streak > 0).length;
    const avgScore = Math.round(
      allUsers.reduce((sum, u) => sum + (u.cyberSafetyScore || 75), 0) / (totalPlayers || 1)
    );

    // Compute category averages
    const categoryTotals: Record<ThreatCategory, { sum: number; count: number }> = {
      phishing: { sum: 0, count: 0 },
      password: { sum: 0, count: 0 },
      qr: { sum: 0, count: 0 },
      scam: { sum: 0, count: 0 },
      social_engineering: { sum: 0, count: 0 },
      multi_threat: { sum: 0, count: 0 }
    };

    allUsers.forEach((u) => {
      Object.entries(u.categoryScores || {}).forEach(([cat, val]) => {
        const k = cat as ThreatCategory;
        if (categoryTotals[k]) {
          categoryTotals[k].sum += val;
          categoryTotals[k].count += 1;
        }
      });
    });

    const categoryAverages: Record<ThreatCategory, number> = {
      phishing: Math.round(categoryTotals.phishing.sum / (categoryTotals.phishing.count || 1)),
      password: Math.round(categoryTotals.password.sum / (categoryTotals.password.count || 1)),
      qr: Math.round(categoryTotals.qr.sum / (categoryTotals.qr.count || 1)),
      scam: Math.round(categoryTotals.scam.sum / (categoryTotals.scam.count || 1)),
      social_engineering: Math.round(categoryTotals.social_engineering.sum / (categoryTotals.social_engineering.count || 1)),
      multi_threat: Math.round(categoryTotals.multi_threat.sum / (categoryTotals.multi_threat.count || 1))
    };

    const analytics: AdminAnalytics = {
      totalPlayers,
      activePlayers,
      averageSafetyScore: avgScore,
      mostFailedChallenge: 'PARKING METER TAMPER STICKER (QR Safety)',
      mostSuccessfulChallenge: 'ENTROPY EVALUATION & CRACK TIME (Password)',
      averageMissionCompletion: 68,
      commonWeakness: 'QR Code Tampering & Quishing (58% avg accuracy)',
      categoryAverages,
      difficultyDistribution: {
        ROOKIE: 5,
        INTERMEDIATE: 9,
        ADVANCED: 6,
        NIGHTMARE: 2
      },
      recentAttempts: db.attempts.slice(0, 10).map((a) => ({
        id: a.id,
        username: a.username,
        challengeTitle: a.challengeTitle,
        correct: a.isCorrect,
        timestamp: a.timestamp
      }))
    };

    res.json({ analytics });
  });

  app.post('/api/admin/reset', authMiddleware, (req, res) => {
    const user = (req as unknown as { user: User }).user;
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required.' });
    }
    db.missions = JSON.parse(JSON.stringify(INITIAL_MISSIONS));
    db.achievements = JSON.parse(JSON.stringify(INITIAL_ACHIEVEMENTS));
    db.leaderboard = JSON.parse(JSON.stringify(INITIAL_LEADERBOARD));
    saveDatabase();
    res.json({ success: true, message: 'Database reset to factory seeds.' });
  });

  // Vite middleware for dev / static build for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ['**/data/**', '**/database.json']
        }
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🔐 DIGITAL SAFETY ESCAPE ROOM Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server boot error:', err);
  process.exit(1);
});
