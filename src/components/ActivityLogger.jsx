/**
 * Activity Logger — form to log carbon-emitting activities
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { PlusCircle, ChevronDown } from 'lucide-react';
import {
  calcTransportEmission,
  calcFoodEmission,
  calcEnergyEmission,
  calcShoppingEmission,
  formatEmission,
} from '../utils/carbonCalc.js';
import { EMISSION_FACTORS, CATEGORIES } from '../types/constants.js';

const ACTIVITY_CONFIGS = {
  transport: {
    activities: Object.keys(EMISSION_FACTORS.transport).map((k) => ({
      value: k,
      label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
    unitLabel: 'Distance (km)',
    calc: (type, amount) => calcTransportEmission(type, amount),
  },
  food: {
    activities: Object.keys(EMISSION_FACTORS.food).map((k) => ({
      value: k,
      label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
    unitLabel: 'Amount (kg)',
    calc: (type, amount) => calcFoodEmission(type, amount),
  },
  energy: {
    activities: Object.keys(EMISSION_FACTORS.energy).map((k) => ({
      value: k,
      label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
    unitLabel: 'Usage (kWh or m³)',
    calc: (type, amount) => calcEnergyEmission(type, amount),
  },
  shopping: {
    activities: Object.keys(EMISSION_FACTORS.shopping).map((k) => ({
      value: k,
      label: k.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    })),
    unitLabel: 'Quantity',
    calc: (type, amount) => calcShoppingEmission(type, amount),
  },
};

function LivePreview({ emissionKg }) {
  if (emissionKg === null) {return null;}
  return (
    <div className="emission-preview" aria-live="polite" aria-atomic="true">
      <span className="preview-label">Estimated emission:</span>
      <span className="preview-value">{formatEmission(emissionKg)}</span>
    </div>
  );
}

LivePreview.propTypes = { emissionKg: PropTypes.number };
LivePreview.defaultProps = { emissionKg: null };

export default function ActivityLogger({ onAdd, error }) {
  const [category, setCategory] = useState('transport');
  const [activityType, setActivityType] = useState('car_petrol');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const config = ACTIVITY_CONFIGS[category];
  const amountNum = parseFloat(amount);
  let previewKg = null;
  if (!isNaN(amountNum) && amountNum > 0) {
    try {
      previewKg = config.calc(activityType, amountNum);
    } catch {
      previewKg = null;
    }
  }

  function handleCategoryChange(newCat) {
    setCategory(newCat);
    setActivityType(ACTIVITY_CONFIGS[newCat].activities[0].value);
    setAmount('');
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || isNaN(amountNum) || amountNum <= 0) {return;}
    const emissionKg = config.calc(activityType, amountNum);
    const success = onAdd({
      category,
      activityType,
      amount: amountNum,
      emissionKg,
      notes: notes.slice(0, 200),
    });
    if (success !== false) {
      setAmount('');
      setNotes('');
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2500);
    }
  }

  return (
    <section className="card logger-card" aria-label="Log a new activity">
      <h2 className="section-title">Log an activity</h2>
      <form onSubmit={handleSubmit} noValidate>
        <fieldset className="form-row" style={{ border: 'none', padding: 0, margin: '0 0 16px 0' }}>
          <legend className="sr-only">Select activity category</legend>
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              type="button"
              className={`cat-btn ${category === key ? 'cat-btn--active' : ''}`}
              onClick={() => handleCategoryChange(key)}
              aria-pressed={category === key}
              style={category === key ? { borderColor: cat.color, color: cat.color } : {}}
            >
              <span aria-hidden="true">{cat.icon}</span> {cat.label}
            </button>
          ))}
        </fieldset>

        <div className="field">
          <label htmlFor="activity-type" className="field-label">
            Activity type
          </label>
          <div className="select-wrap">
            <select
              id="activity-type"
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="field-select"
            >
              {config.activities.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="select-icon" aria-hidden="true" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="activity-amount" className="field-label">
            {config.unitLabel}
          </label>
          <input
            id="activity-amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="field-input"
            placeholder="Enter amount"
            required
            aria-describedby="amount-preview"
          />
          <div id="amount-preview">
            <LivePreview emissionKg={previewKg} />
          </div>
        </div>

        <div className="field">
          <label htmlFor="activity-notes" className="field-label">
            Notes <span className="field-optional">(optional)</span>
          </label>
          <input
            id="activity-notes"
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="field-input"
            placeholder="e.g. commute to work"
            maxLength={200}
          />
        </div>

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          className="btn-primary"
          disabled={!amount || isNaN(amountNum) || amountNum <= 0}
        >
          <PlusCircle size={18} aria-hidden="true" />
          {submitted ? 'Logged! ✓' : 'Log Activity'}
        </button>
      </form>
    </section>
  );
}

ActivityLogger.propTypes = {
  onAdd: PropTypes.func.isRequired,
  error: PropTypes.string,
};
ActivityLogger.defaultProps = { error: null };
