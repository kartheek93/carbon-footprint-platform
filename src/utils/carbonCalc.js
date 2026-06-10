/**
 * Carbon footprint calculation utilities
 * Pure functions — no side effects, fully testable
 * @module carbonCalc
 */

import { EMISSION_FACTORS, GLOBAL_AVERAGE_KG_PER_YEAR, TARGET_KG_PER_YEAR } from '../types/constants.js';

/** Decimal precision for emission values */
const EMISSION_PRECISION = 3;

/** Days in a year used for annualisation */
const DAYS_PER_YEAR = 365;

/** Minimum tracked period in days to avoid division by zero */
const MIN_PERIOD_DAYS = 1;

/**
 * Calculate CO2e emissions for a transport activity
 * @param {string} mode - Transport mode key (e.g. 'car_petrol')
 * @param {number} distanceKm - Distance travelled in kilometres
 * @returns {number} Emission in kg CO2e
 * @throws {Error} If mode is unknown or distanceKm is negative
 */
export function calcTransportEmission(mode, distanceKm) {
  const factor = EMISSION_FACTORS.transport[mode];
  if (factor === undefined) throw new Error(`Unknown transport mode: ${mode}`);
  if (distanceKm < 0) throw new Error('Distance must be non-negative');
  return parseFloat((factor * distanceKm).toFixed(EMISSION_PRECISION));
}

/**
 * Calculate CO2e emissions for food consumption
 * @param {string} foodType - Food type key (e.g. 'beef')
 * @param {number} amountKg - Amount consumed in kilograms
 * @returns {number} Emission in kg CO2e
 * @throws {Error} If foodType is unknown or amountKg is negative
 */
export function calcFoodEmission(foodType, amountKg) {
  const factor = EMISSION_FACTORS.food[foodType];
  if (factor === undefined) throw new Error(`Unknown food type: ${foodType}`);
  if (amountKg < 0) throw new Error('Amount must be non-negative');
  return parseFloat((factor * amountKg).toFixed(EMISSION_PRECISION));
}

/**
 * Calculate CO2e emissions for energy use
 * @param {string} energyType - Energy type key (e.g. 'electricity_grid')
 * @param {number} amount - Usage amount in kWh, m³, or litres depending on type
 * @returns {number} Emission in kg CO2e
 * @throws {Error} If energyType is unknown or amount is negative
 */
export function calcEnergyEmission(energyType, amount) {
  const factor = EMISSION_FACTORS.energy[energyType];
  if (factor === undefined) throw new Error(`Unknown energy type: ${energyType}`);
  if (amount < 0) throw new Error('Amount must be non-negative');
  return parseFloat((factor * amount).toFixed(EMISSION_PRECISION));
}

/**
 * Calculate CO2e emissions for shopping items
 * @param {string} itemType - Shopping item type key (e.g. 'clothing')
 * @param {number} quantity - Number of items purchased
 * @returns {number} Emission in kg CO2e
 * @throws {Error} If itemType is unknown or quantity is negative
 */
export function calcShoppingEmission(itemType, quantity) {
  const factor = EMISSION_FACTORS.shopping[itemType];
  if (factor === undefined) throw new Error(`Unknown item type: ${itemType}`);
  if (quantity < 0) throw new Error('Quantity must be non-negative');
  return parseFloat((factor * quantity).toFixed(EMISSION_PRECISION));
}

/**
 * Aggregate entries by category, summing emission values
 * @param {Array<{category: string, emissionKg: number}>} entries - Log entries
 * @returns {Object.<string, number>} Total kg CO2e per category
 */
export function aggregateByCategory(entries) {
  return entries.reduce((acc, entry) => {
    const cat = entry.category;
    acc[cat] = (acc[cat] || 0) + entry.emissionKg;
    return acc;
  }, {});
}

/**
 * Calculate total emissions across all entries
 * @param {Array<{emissionKg: number}>} entries - Log entries
 * @returns {number} Total kg CO2e
 */
export function calcTotalEmissions(entries) {
  return parseFloat(
    entries.reduce((sum, e) => sum + e.emissionKg, 0).toFixed(EMISSION_PRECISION)
  );
}

/**
 * Project annual emissions by extrapolating from a tracked period
 * @param {Array<{date: string, emissionKg: number}>} entries - Log entries
 * @param {Date} startDate - Start of the tracked period
 * @param {Date} endDate - End of the tracked period
 * @returns {number} Projected annual kg CO2e (0 if no entries)
 */
export function projectAnnualEmissions(entries, startDate, endDate) {
  if (!entries.length) return 0;
  const daysDiff = Math.max(
    MIN_PERIOD_DAYS,
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const total = calcTotalEmissions(entries);
  return parseFloat(((total / daysDiff) * DAYS_PER_YEAR).toFixed(1));
}

/**
 * Compare user annual emissions to global benchmarks
 * @param {number} userAnnualKg - User's projected annual kg CO2e
 * @returns {{ vsGlobalAverage: number, vsTarget: number, globalAverageKg: number, targetKg: number }}
 */
export function compareToBenchmarks(userAnnualKg) {
  return {
    vsGlobalAverage: parseFloat(
      (((userAnnualKg - GLOBAL_AVERAGE_KG_PER_YEAR) / GLOBAL_AVERAGE_KG_PER_YEAR) * 100).toFixed(1)
    ),
    vsTarget: parseFloat(
      (((userAnnualKg - TARGET_KG_PER_YEAR) / TARGET_KG_PER_YEAR) * 100).toFixed(1)
    ),
    globalAverageKg: GLOBAL_AVERAGE_KG_PER_YEAR,
    targetKg: TARGET_KG_PER_YEAR,
  };
}

/**
 * Format a kg CO2e value for human-readable display
 * @param {number} kg - kg CO2e value
 * @returns {string} Formatted string (e.g. "2.50 tonnes" or "500.0 kg")
 */
export function formatEmission(kg) {
  if (kg >= 1000) return `${(kg / 1000).toFixed(2)} tonnes`;
  return `${kg.toFixed(1)} kg`;
}

/**
 * Get a traffic-light hex colour for a given annual emission level
 * @param {number} userKg - User's annual kg CO2e
 * @returns {string} Hex colour string
 */
export function getEmissionColor(userKg) {
  if (userKg <= TARGET_KG_PER_YEAR) return '#4ade80';         // green  — at/below target
  if (userKg <= GLOBAL_AVERAGE_KG_PER_YEAR) return '#facc15'; // yellow — below global avg
  if (userKg <= 10000) return '#f97316';                       // orange — high
  return '#ef4444';                                            // red    — very high
}

/**
 * Group log entries by calendar day (YYYY-MM-DD)
 * @param {Array<{date: string}>} entries - Log entries with ISO date strings
 * @returns {Object.<string, Array>} Entries grouped by date key
 */
export function groupByDay(entries) {
  return entries.reduce((acc, entry) => {
    const day = entry.date.slice(0, 10);
    if (!acc[day]) acc[day] = [];
    acc[day].push(entry);
    return acc;
  }, {});
}

/**
 * Return the ISO date string for the day before the given date
 * @param {string} dateStr - ISO date string (YYYY-MM-DD)
 * @returns {string} Previous day as YYYY-MM-DD
 */
export function getPreviousDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Calculate the current consecutive logging streak in days
 * @param {Array<{date: string}>} entries - Log entries
 * @returns {number} Current streak length (0 if no recent entries)
 */
export function getCurrentStreak(entries) {
  if (!entries.length) return 0;
  const days = Object.keys(groupByDay(entries)).sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  if (days[0] !== today && days[0] !== getPreviousDay(today)) return 0;

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    if (days[i] === getPreviousDay(days[i - 1])) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

/**
 * Sanitize user-supplied text to prevent XSS injection
 * @param {*} input - Raw input value
 * @returns {string} Sanitized string capped at 500 characters
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .slice(0, 500);
}

/**
 * Validate a log entry object before persisting
 * @param {{ category: string, activityType: string, emissionKg: number, date: string }} entry
 * @returns {{ valid: boolean, errors: string[] }}
 */
export function validateEntry(entry) {
  const errors = [];
  if (!entry.category) errors.push('Category is required');
  if (!entry.activityType) errors.push('Activity type is required');
  if (typeof entry.emissionKg !== 'number' || isNaN(entry.emissionKg) || entry.emissionKg < 0) {
    errors.push('Emission must be a non-negative number');
  }
  if (!entry.date) errors.push('Date is required');
  return { valid: errors.length === 0, errors };
}
