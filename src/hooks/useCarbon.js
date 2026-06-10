/**
 * Custom hooks for carbon footprint data management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getEntries, saveEntry, deleteEntry,
  getProfile, saveProfile,
  getEarnedBadges, awardBadge,
  getChatHistory, saveChatHistory,
  generateId,
} from '../utils/storage.js';
import {
  calcTotalEmissions,
  aggregateByCategory,
  projectAnnualEmissions,
  getCurrentStreak,
  validateEntry,
} from '../utils/carbonCalc.js';
import { BADGES, GLOBAL_AVERAGE_KG_PER_YEAR } from '../types/constants.js';

/**
 * Main hook for managing activity log entries
 */
export function useEntries() {
  const [entries, setEntries] = useState(() => getEntries());
  const [error, setError] = useState(null);

  const addEntry = useCallback((entryData) => {
    const entry = {
      id: generateId(),
      date: new Date().toISOString(),
      ...entryData,
    };
    const { valid, errors } = validateEntry(entry);
    if (!valid) {
      setError(errors.join(', '));
      return false;
    }
    const saved = saveEntry(entry);
    if (saved) {
      setEntries(getEntries());
      setError(null);
      return true;
    }
    setError('Failed to save entry');
    return false;
  }, []);

  const removeEntry = useCallback((id) => {
    deleteEntry(id);
    setEntries(getEntries());
  }, []);

  const totalKg = calcTotalEmissions(entries);
  const byCategory = aggregateByCategory(entries);
  const streak = getCurrentStreak(entries);

  const annualProjection =
    entries.length > 0
      ? projectAnnualEmissions(
          entries,
          new Date(entries[0]?.date || Date.now()),
          new Date()
        )
      : 0;

  return {
    entries,
    addEntry,
    removeEntry,
    totalKg,
    byCategory,
    annualProjection,
    streak,
    error,
  };
}

/**
 * Hook for user profile management
 */
export function useProfile() {
  const [profile, setProfile] = useState(() => getProfile());

  const updateProfile = useCallback((updates) => {
    const updated = { ...profile, ...updates };
    saveProfile(updated);
    setProfile(updated);
  }, [profile]);

  return { profile, updateProfile };
}

/**
 * Hook for badge/achievement system
 */
export function useBadges(entries, annualProjection) {
  const [earnedBadges, setEarnedBadges] = useState(() => getEarnedBadges());
  const [newBadge, setNewBadge] = useState(null);

  useEffect(() => {
    const checks = [
      {
        id: 'first_log',
        condition: entries.length >= 1,
      },
      {
        id: 'week_streak',
        condition: getCurrentStreak(entries) >= 7,
      },
      {
        id: 'under_average',
        condition: annualProjection > 0 && annualProjection < GLOBAL_AVERAGE_KG_PER_YEAR,
      },
    ];

    checks.forEach(({ id, condition }) => {
      if (condition) {
        const isNew = awardBadge(id);
        if (isNew) {
          const badgeData = BADGES.find((b) => b.id === id);
          setNewBadge(badgeData);
          setEarnedBadges(getEarnedBadges());
          // Auto-clear notification after 4s
          setTimeout(() => setNewBadge(null), 4000);
        }
      }
    });
  }, [entries, annualProjection]);

  return { earnedBadges, newBadge };
}

/**
 * Hook for AI chat history
 */
export function useChatHistory() {
  const [messages, setMessages] = useState(() => getChatHistory());

  const addMessage = useCallback((role, content) => {
    setMessages((prev) => {
      const updated = [...prev, { role, content, id: generateId(), timestamp: Date.now() }];
      saveChatHistory(updated);
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([]);
    saveChatHistory([]);
  }, []);

  return { messages, addMessage, clearHistory };
}
