/**
 * Persistent storage utilities using localStorage
 * Gracefully degrades if storage is unavailable
 */

const STORAGE_KEYS = {
  ENTRIES: 'ecotrace_entries',
  PROFILE: 'ecotrace_profile',
  BADGES: 'ecotrace_badges',
  CHAT_HISTORY: 'ecotrace_chat',
};

function isStorageAvailable() {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

const storageAvailable = isStorageAvailable();

function safeGet(key, defaultValue = null) {
  if (!storageAvailable) return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function safeSet(key, value) {
  if (!storageAvailable) return false;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      // Trim oldest entries if quota exceeded
      console.warn('Storage quota exceeded, trimming old data');
      trimStorage();
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

function trimStorage() {
  const entries = safeGet(STORAGE_KEYS.ENTRIES, []);
  if (entries.length > 500) {
    safeSet(STORAGE_KEYS.ENTRIES, entries.slice(-500));
  }
}

// --- Entries ---
export function getEntries() {
  return safeGet(STORAGE_KEYS.ENTRIES, []);
}

export function saveEntry(entry) {
  const entries = getEntries();
  // Prevent duplicate IDs
  const exists = entries.findIndex((e) => e.id === entry.id);
  if (exists >= 0) {
    entries[exists] = entry;
  } else {
    entries.push(entry);
  }
  return safeSet(STORAGE_KEYS.ENTRIES, entries);
}

export function deleteEntry(id) {
  const entries = getEntries().filter((e) => e.id !== id);
  return safeSet(STORAGE_KEYS.ENTRIES, entries);
}

// --- Profile ---
export function getProfile() {
  return safeGet(STORAGE_KEYS.PROFILE, {
    name: '',
    country: 'global',
    dietType: 'omnivore',
    transportMode: 'car_petrol',
    householdSize: 1,
  });
}

export function saveProfile(profile) {
  return safeSet(STORAGE_KEYS.PROFILE, profile);
}

// --- Badges ---
export function getEarnedBadges() {
  return safeGet(STORAGE_KEYS.BADGES, []);
}

export function awardBadge(badgeId) {
  const badges = getEarnedBadges();
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    safeSet(STORAGE_KEYS.BADGES, badges);
    return true; // newly awarded
  }
  return false;
}

// --- Chat History ---
export function getChatHistory() {
  return safeGet(STORAGE_KEYS.CHAT_HISTORY, []);
}

export function saveChatHistory(messages) {
  // Keep last 50 messages to avoid storage bloat
  return safeSet(STORAGE_KEYS.CHAT_HISTORY, messages.slice(-50));
}

// --- Clear all data ---
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (storageAvailable) localStorage.removeItem(key);
  });
}

export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
