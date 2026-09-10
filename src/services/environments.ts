export interface GameEnvironment {
  id: string;
  name: string;
  code: string;
  subtitle: string;
  imageUrl: string;
  accent: string;
  description: string;
}

export const GAME_ENVIRONMENTS: Record<string, GameEnvironment> = {
  ops_bunker: {
    id: 'ops_bunker',
    code: 'SEC-OPS // SECTOR 01',
    name: 'Cyber War Room Command Center',
    subtitle: 'Tactical Defense Operations Mainframe',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=2560&q=85',
    accent: '#06b6d4',
    description: 'Central command operations room with active threat telemetry grids and global attack monitors.'
  },
  server_vault: {
    id: 'server_vault',
    code: 'VAULT // CRYPTO-04',
    name: 'Classified Cold-Aisle Server Vault',
    subtitle: 'Cryptographic Storage & Core Mainframe',
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2560&q=85',
    accent: '#3b82f6',
    description: 'Subterranean server farm protected by biometric airlocks, biometric safes, and optical fiber links.'
  },
  containment_breach: {
    id: 'containment_breach',
    code: 'ALERT // LEVEL RED',
    name: 'Quarantine Containment Corridor',
    subtitle: 'Emergency Lockdown Infiltration Point',
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=2560&q=85',
    accent: '#ef4444',
    description: 'Active emergency quarantine zone with strobe warning lighting and physical blast doors.'
  },
  smart_city_kiosk: {
    id: 'smart_city_kiosk',
    code: 'URBAN // NODE-09',
    name: 'Smart City Terminal Hub',
    subtitle: 'Physical Infrastructure & Transit Intercept',
    imageUrl: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=2560&q=85',
    accent: '#10b981',
    description: 'High-density urban street terminal vulnerable to malicious QR stickers and public kiosk hardware tampering.'
  },
  financial_intel: {
    id: 'financial_intel',
    code: 'FIN-INTEL // TRADING',
    name: 'Financial Fraud Operations Floor',
    subtitle: 'High-Frequency Transaction Surveillance',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=2560&q=85',
    accent: '#f59e0b',
    description: 'Financial intelligence monitoring center analyzing wire fraud schemes and deepfake social engineering.'
  },
  signal_intercept: {
    id: 'signal_intercept',
    code: 'SIGINT // ARRAY-12',
    name: 'Telecom & RF Signal Listening Post',
    subtitle: 'Cellular Tower & Audio Interception Room',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=2560&q=85',
    accent: '#a855f7',
    description: 'Radio frequency surveillance lab analyzing spoofed caller IDs and conversational impersonation vectors.'
  },
  operative_dossier: {
    id: 'operative_dossier',
    code: 'HQ // ARMORY-X',
    name: 'Operative Tactical Armory & Briefing Deck',
    subtitle: 'Field Gear, Forensics & Cyber Profile Dossier',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=2560&q=85',
    accent: '#06b6d4',
    description: 'Classified forensics lab where operative credentials, threat analytics, and badges are validated.'
  }
};

/**
 * Returns the matching realistic environment for a specific threat category or view
 */
export function getEnvironmentForContext(categoryOrView?: string): GameEnvironment {
  switch (categoryOrView) {
    case 'password':
      return GAME_ENVIRONMENTS.server_vault;
    case 'qr':
      return GAME_ENVIRONMENTS.smart_city_kiosk;
    case 'scam':
      return GAME_ENVIRONMENTS.financial_intel;
    case 'social_engineering':
      return GAME_ENVIRONMENTS.signal_intercept;
    case 'phishing':
      return GAME_ENVIRONMENTS.ops_bunker;
    case 'cinematic':
      return GAME_ENVIRONMENTS.containment_breach;
    case 'profile':
    case 'achievements':
      return GAME_ENVIRONMENTS.operative_dossier;
    case 'leaderboard':
      return GAME_ENVIRONMENTS.ops_bunker;
    case 'admin':
      return GAME_ENVIRONMENTS.ops_bunker;
    default:
      return GAME_ENVIRONMENTS.ops_bunker;
  }
}

/**
 * Mission Card thumbnail photos for real-world threat fidelity
 */
export const MISSION_THUMBNAILS: Record<string, string> = {
  'mission-1': 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80', // Phishing corporate email workstation
  'mission-2': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80', // Server vault racks
  'mission-3': 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=800&q=80', // Urban QR kiosk street
  'mission-4': 'https://images.unsplash.com/photo-1642543492481-44e81e3914a7?auto=format&fit=crop&w=800&q=80', // Financial scam trading screens
  'mission-5': 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80', // Telecom phone dispatch / listening station
};
