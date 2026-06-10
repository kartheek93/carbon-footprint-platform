/**
 * Carbon footprint calculation utilities
 * Pure functions for testability and maintainability
 */

import { EMISSION_FACTORS, GLOBAL_AVERAGE_KG_PER_YEAR, TARGET_KG_PER_YEAR } from '../types/constants.js';

/**
 * Calculate CO2e emissions for a transport activity
 * @param {string} mode - Transport mode key
 * @param {number} distanceKm - Distance in kilometres
 * @returns {number} kg CO2e
 */
export function calcTransportEmission(mode, distanceKm) {
  const factor = EMISSION_FACTORS.transport[mode];
  if (factor === undefined) throw new Error(`Unknown transport mode: ${mode}`);
  if (distanceKm < 0) throw new Error('Distance must be non-negative');
  return parseFloat((factor * distanceKm).toFixed(3));
}

/**
 * Calculate CO2e emissions for food consumption
 * @param {string} foodType - Food type key
 * @param {number} amountKg - Amount in kg
 * @returns {number} kg CO2e
 */
export function calcFoodEmission(foodType, amountKg) {
  const factor = EMISSION_FACTORS.food[foodType];
  if (factor === undefined) throw new Error(`Unknown food type: ${foodType}`);
  if (amountKg < 0) throw new Error('Amount must be non-negative');
  return parseFloat((factor * amountKg).toFixed(3));
}

/**
 * Calculate CO2e emissions for energy use
 * @param {string} energyType - Energy type key
 * @param {number} amount - Amount in kWh or m³ or litres
 * @returns {number} kg CO2e
 */
export function calcEnergyEmission(energyType, amount) {
  const factor = EMISSION_FACTORS.energy[energyType];
  if (factor === undefined) throw new Error(`Unknown energy type: ${energyType}`);
  if (amount < 0) throw new Error('Amount must be non-negative');
  return parseFloat((factor * amount).toFixed(3));
}

/**
 * Calculate CO2e emissions for shopping
 * @param {string} itemType - Shopping item type key
 * @param {number} quantity - Number of items
 * @returns {number} kg CO2e
 */
export function calcShoppingEmission(itemType, quantity) {
  const factor = EMISSION_FACTORS.shopping[itemType];
  if (factor === undefined) throw new Error(`Unknown item type: ${itemType}`);
  if (quantity < 0) throw new Error('Quantity must be non-negative');
  return parseFloat((factor * quantity).toFixed(3));
}

/**
 * Aggregate entries by category
 * @param {Array} entries - Array of log entries
 * @returns {Object} totals per category
 */
export function aggregateByCategory(entries) {
  return entries.reduce((acc, entry) => {
    const cat = entry.category;
    acc[cat] = (acc[cat] || 0) + entry.emissionKg;
    return acc;
  }, {});
}

/**
 * Calculate total emissions from entries
 * @param {Array} entries - Array of log entries
 * @returns {number} total kg CO2e
 */
export function calcTotalEmissions(entries) {
  return parseFloat(
    entries.reduce((sum, e) => sum + e.emissionKg, 0).toFixed(3)
  );
}

/**
 * Project annual emissions based on a date range of entries
 * @param {Array} entries - Array of log entries with date field
 * @param {Date} startDate - Start of period
 * @param {Date} endDate - End of period
 * @returns {number} projected annual kg CO2e
 */
export function projectAnnualEmissions(entries, startDate, endDate) {
  if (!entries.length) return 0;
  const daysDiff = Math.max(
    1,
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const total = calcTotalEmissions(entries);
  return parseFloat(((total / daysDiff) * 365).toFixed(1));
}

/**
 * Compare user's emissions to benchmarks
 * @param {number} userAnnualKg - User's projected annual emissions
 * @returns {Object} comparison data
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
 * Format kg CO2e for display
 * @param {number} kg - kg CO2e value
 * @returns {string} formatted string
 */
export function formatEmission(kg) {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(2)} tonnes`;
  }
  return `${kg.toFixed(1)} kg`;
}

/**
 * Get a color scale value for a given emission level
 * @param {number} userKg - User's annual kg CO2e
 * @returns {string} hex color
 */
export function getEmissionColor(userKg) {
  if (userKg <= TARGET_KG_PER_YEAR) return '#4ade80';        // green
  if (userKg <= GLOBAL_AVERAGE_KG_PER_YEAR) return '#facc15'; // yellow
  if (userKg <= 10000) return '#f97316';                       // orange
  return '#ef4444';                                            // red
}

/**
 * Group entries by day (YYYY-MM-DD)
 * @param {Array} entries
 * @returns {Object} entries grouped by date string
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
 * Get streaks (consecutive days with at least one log)
 * @param {Array} entries
 * @returns {number} current streak in days
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

function getPreviousDay(dateStr) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Sanitize user input text (prevent XSS in notes)
 * @param {string} input
 * @returns {string} sanitized string
 */
export function sanitizeText(input) {
  if (typeof input !== 'string') return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .slice(0, 500); // max length
}

/**
 * Validate a log entry before saving
 * @param {Object} entry
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
