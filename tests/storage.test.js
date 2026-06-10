/**
 * Unit tests for storage utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  getEntries, saveEntry, deleteEntry,
  getProfile, saveProfile,
  getEarnedBadges, awardBadge,
  generateId,
  clearAllData,
} from '../src/utils/storage.js';

beforeEach(() => {
  localStorage.clear();
});

// ─── Entries ──────────────────────────────────────────────────────────────────

describe('getEntries / saveEntry', () => {
  it('returns empty array when no entries', () => {
    expect(getEntries()).toEqual([]);
  });

  it('saves and retrieves an entry', () => {
    const entry = { id: 'test_1', category: 'transport', emissionKg: 5, date: '2024-01-01' };
    saveEntry(entry);
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('test_1');
  });

  it('updates an entry with the same id', () => {
    const entry = { id: 'test_1', emissionKg: 5 };
    saveEntry(entry);
    saveEntry({ id: 'test_1', emissionKg: 10 });
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].emissionKg).toBe(10);
  });

  it('saves multiple entries', () => {
    saveEntry({ id: 'e1', emissionKg: 1 });
    saveEntry({ id: 'e2', emissionKg: 2 });
    expect(getEntries()).toHaveLength(2);
  });
});

describe('deleteEntry', () => {
  it('removes entry by id', () => {
    saveEntry({ id: 'del_1', emissionKg: 5 });
    deleteEntry('del_1');
    expect(getEntries()).toHaveLength(0);
  });

  it('does not affect other entries when deleting', () => {
    saveEntry({ id: 'keep', emissionKg: 3 });
    saveEntry({ id: 'del_2', emissionKg: 7 });
    deleteEntry('del_2');
    const entries = getEntries();
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe('keep');
  });
});

// ─── Profile ──────────────────────────────────────────────────────────────────

describe('getProfile / saveProfile', () => {
  it('returns default profile when none saved', () => {
    const profile = getProfile();
    expect(profile).toHaveProperty('country');
    expect(profile).toHaveProperty('dietType');
  });

  it('saves and retrieves profile', () => {
    saveProfile({ name: 'Alice', country: 'uk', dietType: 'vegan' });
    const profile = getProfile();
    expect(profile.name).toBe('Alice');
    expect(profile.dietType).toBe('vegan');
  });
});

// ─── Badges ───────────────────────────────────────────────────────────────────

describe('getEarnedBadges / awardBadge', () => {
  it('starts with no badges', () => {
    expect(getEarnedBadges()).toEqual([]);
  });

  it('awards a new badge and returns true', () => {
    const isNew = awardBadge('first_log');
    expect(isNew).toBe(true);
    expect(getEarnedBadges()).toContain('first_log');
  });

  it('does not duplicate a badge and returns false', () => {
    awardBadge('first_log');
    const isNew = awardBadge('first_log');
    expect(isNew).toBe(false);
    expect(getEarnedBadges()).toHaveLength(1);
  });
});

// ─── ID Generation ───────────────────────────────────────────────────────────

describe('generateId', () => {
  it('generates a non-empty string', () => {
    expect(typeof generateId()).toBe('string');
    expect(generateId().length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateId));
    expect(ids.size).toBe(100);
  });
});

// ─── Clear All ────────────────────────────────────────────────────────────────

describe('clearAllData', () => {
  it('removes all stored data', () => {
    saveEntry({ id: 'x', emissionKg: 5 });
    saveProfile({ name: 'Test' });
    awardBadge('first_log');
    clearAllData();
    expect(getEntries()).toEqual([]);
    expect(getEarnedBadges()).toEqual([]);
  });
});
