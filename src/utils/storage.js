/**
 * Persistent storage utilities using localStorage
 * Gracefully degrades if storage is unavailable (private browsing, quota exceeded)
 * @module storage
 */

/** Storage key constants — centralised to avoid typos */
const STORAGE_KEYS = {
  ENTRIES: 'ecotrace_entries',
  PROFILE: 'ecotrace_profile',
  BADGES: 'ecotrace_badges',
  CHAT_HISTORY: 'ecotrace_chat',
};

/** Maximum number of log entries to retain before trimming */
const MAX_ENTRIES = 500;

/** Maximum number of chat messages to retain */
const MAX_CHAT_MESSAGES = 50;

/**
 * Check whether localStorage is available in the current environment
 * @returns {boolean} True if storage is accessible
 */
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

/**
 * Safely read and parse a value from localStorage
 * @param {string} key - Storage key to read
 * @param {*} defaultValue - Value returned if key is absent or parse fails
 * @returns {*} Parsed value or defaultValue
 */
function safeGet(key, defaultValue = null) {
  if (!storageAvailable) {return defaultValue;}
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * Safely serialise and write a value to localStorage
 * Automatically trims entries if quota is exceeded
 * @param {string} key - Storage key to write
 * @param {*} value - Value to serialise and store
 * @returns {boolean} True if the write succeeded
 */
function safeSet(key, value) {
  if (!storageAvailable) {return false;}
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    if (e.name === 'QuotaExceededError') {
      console.warn('[EcoTrace] Storage quota exceeded — trimming old entries');
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

/**
 * Trim the entries list to MAX_ENTRIES to free storage space
 * @returns {void}
 */
function trimStorage() {
  const entries = safeGet(STORAGE_KEYS.ENTRIES, []);
  if (entries.length > MAX_ENTRIES) {
    safeSet(STORAGE_KEYS.ENTRIES, entries.slice(-MAX_ENTRIES));
  }
}

// ─── Entries ──────────────────────────────────────────────────────────────────

/**
 * Retrieve all stored log entries
 * @returns {Array} Array of log entry objects
 */
export function getEntries() {
  return safeGet(STORAGE_KEYS.ENTRIES, []);
}

/**
 * Save a log entry, updating it if an entry with the same id already exists
 * @param {{ id: string }} entry - Entry object to save or update
 * @returns {boolean} True if save succeeded
 */
export function saveEntry(entry) {
  const entries = getEntries();
  const exists = entries.findIndex((e) => e.id === entry.id);
  if (exists >= 0) {
    entries[exists] = entry;
  } else {
    entries.push(entry);
  }
  return safeSet(STORAGE_KEYS.ENTRIES, entries);
}

/**
 * Delete a log entry by its id
 * @param {string} id - ID of the entry to remove
 * @returns {boolean} True if delete succeeded
 */
export function deleteEntry(id) {
  const entries = getEntries().filter((e) => e.id !== id);
  return safeSet(STORAGE_KEYS.ENTRIES, entries);
}

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * Retrieve the user profile, returning sensible defaults if none is stored
 * @returns {{ name: string, country: string, dietType: string, transportMode: string, householdSize: number }}
 */
export function getProfile() {
  return safeGet(STORAGE_KEYS.PROFILE, {
    name: '',
    country: 'global',
    dietType: 'omnivore',
    transportMode: 'car_petrol',
    householdSize: 1,
  });
}

/**
 * Persist the user profile
 * @param {Object} profile - Profile object to store
 * @returns {boolean} True if save succeeded
 */
export function saveProfile(profile) {
  return safeSet(STORAGE_KEYS.PROFILE, profile);
}

// ─── Badges ───────────────────────────────────────────────────────────────────

/**
 * Retrieve the list of earned badge IDs
 * @returns {string[]} Array of badge ID strings
 */
export function getEarnedBadges() {
  return safeGet(STORAGE_KEYS.BADGES, []);
}

/**
 * Award a badge if it has not already been earned
 * @param {string} badgeId - ID of the badge to award
 * @returns {boolean} True if the badge was newly awarded, false if already held
 */
export function awardBadge(badgeId) {
  const badges = getEarnedBadges();
  if (!badges.includes(badgeId)) {
    badges.push(badgeId);
    safeSet(STORAGE_KEYS.BADGES, badges);
    return true;
  }
  return false;
}

// ─── Chat History ─────────────────────────────────────────────────────────────

/**
 * Retrieve stored chat message history
 * @returns {Array<{ role: string, content: string, id: string, timestamp: number }>}
 */
export function getChatHistory() {
  return safeGet(STORAGE_KEYS.CHAT_HISTORY, []);
}

/**
 * Persist chat history, retaining only the most recent MAX_CHAT_MESSAGES messages
 * @param {Array} messages - Full message array to persist
 * @returns {boolean} True if save succeeded
 */
export function saveChatHistory(messages) {
  return safeSet(STORAGE_KEYS.CHAT_HISTORY, messages.slice(-MAX_CHAT_MESSAGES));
}

// ─── Utilities ────────────────────────────────────────────────────────────────

/**
 * Remove all EcoTrace data from localStorage
 * @returns {void}
 */
export function clearAllData() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    if (storageAvailable) {localStorage.removeItem(key);}
  });
}

/**
 * Generate a unique ID string using timestamp and random suffix
 * @returns {string} Unique ID in format "timestamp_randomsuffix"
 */
export function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
