/**
 * Unit tests for carbon calculation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calcTransportEmission,
  calcFoodEmission,
  calcEnergyEmission,
  calcShoppingEmission,
  aggregateByCategory,
  calcTotalEmissions,
  projectAnnualEmissions,
  compareToBenchmarks,
  formatEmission,
  getEmissionColor,
  groupByDay,
  getCurrentStreak,
  getPreviousDay,
  sanitizeText,
  validateEntry,
} from '../src/utils/carbonCalc.js';

// ─── Transport ────────────────────────────────────────────────────────────────

describe('calcTransportEmission', () => {
  it('calculates petrol car emission correctly', () => {
    expect(calcTransportEmission('car_petrol', 100)).toBeCloseTo(19.2, 1);
  });

  it('returns 0 for cycling', () => {
    expect(calcTransportEmission('cycling', 50)).toBe(0);
  });

  it('returns 0 for walking', () => {
    expect(calcTransportEmission('walking', 10)).toBe(0);
  });

  it('handles zero distance', () => {
    expect(calcTransportEmission('car_petrol', 0)).toBe(0);
  });

  it('throws on unknown transport mode', () => {
    expect(() => calcTransportEmission('hovercraft', 10)).toThrow('Unknown transport mode');
  });

  it('throws on negative distance', () => {
    expect(() => calcTransportEmission('car_petrol', -5)).toThrow('non-negative');
  });

  it('electric car has lower emission than petrol', () => {
    const electric = calcTransportEmission('car_electric', 100);
    const petrol   = calcTransportEmission('car_petrol', 100);
    expect(electric).toBeLessThan(petrol);
  });

  it('train has lower emission than bus', () => {
    const train = calcTransportEmission('train', 100);
    const bus   = calcTransportEmission('bus', 100);
    expect(train).toBeLessThan(bus);
  });
});

// ─── Food ─────────────────────────────────────────────────────────────────────

describe('calcFoodEmission', () => {
  it('calculates beef emission correctly', () => {
    expect(calcFoodEmission('beef', 1)).toBeCloseTo(27.0, 1);
  });

  it('legumes have lower emission than beef', () => {
    expect(calcFoodEmission('legumes', 1)).toBeLessThan(calcFoodEmission('beef', 1));
  });

  it('handles decimal amounts', () => {
    expect(calcFoodEmission('chicken', 0.5)).toBeCloseTo(3.45, 1);
  });

  it('throws on unknown food type', () => {
    expect(() => calcFoodEmission('unicorn_steak', 1)).toThrow('Unknown food type');
  });

  it('throws on negative amount', () => {
    expect(() => calcFoodEmission('beef', -1)).toThrow('non-negative');
  });
});

// ─── Energy ───────────────────────────────────────────────────────────────────

describe('calcEnergyEmission', () => {
  it('calculates grid electricity correctly', () => {
    expect(calcEnergyEmission('electricity_grid', 100)).toBeCloseTo(23.3, 1);
  });

  it('solar has lower emission than grid', () => {
    expect(calcEnergyEmission('solar', 100)).toBeLessThan(
      calcEnergyEmission('electricity_grid', 100)
    );
  });

  it('throws on unknown energy type', () => {
    expect(() => calcEnergyEmission('fusion', 100)).toThrow('Unknown energy type');
  });
});

// ─── Shopping ─────────────────────────────────────────────────────────────────

describe('calcShoppingEmission', () => {
  it('calculates laptop emission correctly', () => {
    expect(calcShoppingEmission('electronics_laptop', 1)).toBeCloseTo(300, 0);
  });

  it('scales linearly with quantity', () => {
    const single = calcShoppingEmission('clothing', 1);
    const double = calcShoppingEmission('clothing', 2);
    expect(double).toBeCloseTo(single * 2, 5);
  });

  it('throws on unknown item type', () => {
    expect(() => calcShoppingEmission('yacht', 1)).toThrow('Unknown item type');
  });
});

// ─── Aggregation ──────────────────────────────────────────────────────────────

describe('aggregateByCategory', () => {
  const entries = [
    { category: 'transport', emissionKg: 10 },
    { category: 'food',      emissionKg: 5  },
    { category: 'transport', emissionKg: 3  },
  ];

  it('sums emissions by category', () => {
    const result = aggregateByCategory(entries);
    expect(result.transport).toBe(13);
    expect(result.food).toBe(5);
  });

  it('handles empty array', () => {
    expect(aggregateByCategory([])).toEqual({});
  });
});

describe('calcTotalEmissions', () => {
  it('sums all emissions', () => {
    const entries = [
      { emissionKg: 10.5 },
      { emissionKg: 4.3  },
    ];
    expect(calcTotalEmissions(entries)).toBeCloseTo(14.8, 1);
  });

  it('returns 0 for empty array', () => {
    expect(calcTotalEmissions([])).toBe(0);
  });
});

// ─── Projection ───────────────────────────────────────────────────────────────

describe('projectAnnualEmissions', () => {
  it('scales from 30 days to annual', () => {
    const entries = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 86400000).toISOString(),
      emissionKg: 10,
    }));
    const start = new Date(Date.now() - 30 * 86400000);
    const end = new Date();
    const projection = projectAnnualEmissions(entries, start, end);
    // 30 days * 10 kg = 300 kg / 30 days * 365 = ~3650 kg
    expect(projection).toBeGreaterThan(3000);
    expect(projection).toBeLessThan(4000);
  });

  it('returns 0 for empty entries', () => {
    expect(projectAnnualEmissions([], new Date(), new Date())).toBe(0);
  });
});

// ─── Benchmarks ───────────────────────────────────────────────────────────────

describe('compareToBenchmarks', () => {
  it('returns negative vsGlobalAverage when under average', () => {
    const result = compareToBenchmarks(2000);
    expect(result.vsGlobalAverage).toBeLessThan(0);
  });

  it('returns positive vsGlobalAverage when over average', () => {
    const result = compareToBenchmarks(10000);
    expect(result.vsGlobalAverage).toBeGreaterThan(0);
  });

  it('includes benchmarks in result', () => {
    const result = compareToBenchmarks(5000);
    expect(result).toHaveProperty('globalAverageKg');
    expect(result).toHaveProperty('targetKg');
  });
});

// ─── Formatting ───────────────────────────────────────────────────────────────

describe('formatEmission', () => {
  it('formats kg under 1000', () => {
    expect(formatEmission(500)).toBe('500.0 kg');
  });

  it('converts to tonnes for >= 1000 kg', () => {
    expect(formatEmission(2500)).toBe('2.50 tonnes');
  });

  it('formats 0 correctly', () => {
    expect(formatEmission(0)).toBe('0.0 kg');
  });
});

describe('getEmissionColor', () => {
  it('returns green for low emissions', () => {
    expect(getEmissionColor(1500)).toBe('#4ade80');
  });

  it('returns red for very high emissions', () => {
    expect(getEmissionColor(15000)).toBe('#ef4444');
  });

  it('returns yellow for moderate emissions', () => {
    expect(getEmissionColor(4000)).toBe('#facc15');
  });
});

// ─── Grouping & Streaks ───────────────────────────────────────────────────────

describe('groupByDay', () => {
  it('groups entries by date', () => {
    const entries = [
      { date: '2024-01-01T10:00:00Z' },
      { date: '2024-01-01T15:00:00Z' },
      { date: '2024-01-02T09:00:00Z' },
    ];
    const grouped = groupByDay(entries);
    expect(Object.keys(grouped)).toHaveLength(2);
    expect(grouped['2024-01-01']).toHaveLength(2);
  });
});

// ─── getPreviousDay ───────────────────────────────────────────────────────────

describe('getPreviousDay', () => {
  it('returns the previous calendar day', () => {
    expect(getPreviousDay('2024-03-15')).toBe('2024-03-14');
  });

  it('handles month boundary correctly', () => {
    expect(getPreviousDay('2024-03-01')).toBe('2024-02-29');
  });

  it('handles year boundary correctly', () => {
    expect(getPreviousDay('2024-01-01')).toBe('2023-12-31');
  });
});


// ─── Security: Input Sanitization ─────────────────────────────────────────────

describe('sanitizeText', () => {
  it('escapes HTML characters', () => {
    const result = sanitizeText('<script>alert("xss")</script>');
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('escapes ampersands', () => {
    expect(sanitizeText('cats & dogs')).toBe('cats &amp; dogs');
  });

  it('escapes quotes', () => {
    expect(sanitizeText('"quoted"')).toContain('&quot;');
  });

  it('truncates at 500 characters', () => {
    const long = 'a'.repeat(600);
    expect(sanitizeText(long)).toHaveLength(500);
  });

  it('handles non-string input gracefully', () => {
    expect(sanitizeText(null)).toBe('');
    expect(sanitizeText(undefined)).toBe('');
    expect(sanitizeText(42)).toBe('');
  });
});

// ─── Validation ───────────────────────────────────────────────────────────────

describe('validateEntry', () => {
  const validEntry = {
    category: 'transport',
    activityType: 'car_petrol',
    emissionKg: 10,
    date: '2024-01-01T00:00:00Z',
  };

  it('validates a correct entry', () => {
    expect(validateEntry(validEntry).valid).toBe(true);
  });

  it('rejects missing category', () => {
    const { valid, errors } = validateEntry({ ...validEntry, category: '' });
    expect(valid).toBe(false);
    expect(errors).toContain('Category is required');
  });

  it('rejects negative emission', () => {
    const { valid } = validateEntry({ ...validEntry, emissionKg: -5 });
    expect(valid).toBe(false);
  });

  it('rejects missing date', () => {
    const { valid } = validateEntry({ ...validEntry, date: '' });
    expect(valid).toBe(false);
  });

  it('rejects NaN emission', () => {
    const { valid } = validateEntry({ ...validEntry, emissionKg: NaN });
    expect(valid).toBe(false);
  });
});
