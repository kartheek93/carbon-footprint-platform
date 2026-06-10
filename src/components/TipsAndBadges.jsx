/**
 * Tips & Badges — reduction tips and achievement system
 */

import { useState } from 'react';
import PropTypes from 'prop-types';
import { CheckCircle, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { REDUCTION_TIPS, BADGES, CATEGORIES } from '../types/constants.js';
import { formatEmission } from '../utils/carbonCalc.js';

function TipCard({ tip, adopted, onToggle }) {
  const [expanded, setExpanded] = useState(false);
  const cat = CATEGORIES[tip.category];
  const difficultyColor = { easy: '#4ade80', medium: '#f59e0b', hard: '#ef4444' }[tip.difficulty];

  return (
    <li className={`tip-card ${adopted ? 'tip-card--adopted' : ''}`}>
      <div className="tip-header">
        <button onClick={() => setExpanded((v) => !v)} className="tip-expand"
          aria-expanded={expanded} aria-controls={`tip-body-${tip.id}`}>
          <span aria-hidden="true">{cat?.icon}</span>
          <span className="tip-title">{tip.title}</span>
          {expanded ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
        </button>
        <button onClick={() => onToggle(tip.id)} className="tip-toggle"
          aria-label={adopted ? `Mark "${tip.title}" as not adopted` : `Mark "${tip.title}" as adopted`}
          aria-pressed={adopted}>
          {adopted
            ? <CheckCircle size={22} color="#4ade80" />
            : <Circle size={22} color="#475569" />}
        </button>
      </div>
      {expanded && (
        <div id={`tip-body-${tip.id}`} className="tip-body">
          <p className="tip-description">{tip.description}</p>
          <div className="tip-meta">
            <span className="tip-saving">💚 Saves ~{formatEmission(tip.savingKgPerYear)}/year</span>
            <span className="tip-difficulty" style={{ color: difficultyColor }}>
              {tip.difficulty.charAt(0).toUpperCase() + tip.difficulty.slice(1)} change
            </span>
          </div>
        </div>
      )}
    </li>
  );
}

TipCard.propTypes = {
  tip: PropTypes.shape({
    id: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    savingKgPerYear: PropTypes.number.isRequired,
    difficulty: PropTypes.oneOf(['easy', 'medium', 'hard']).isRequired,
  }).isRequired,
  adopted: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

export default function TipsAndBadges({ earnedBadges }) {
  const [adoptedTips, setAdoptedTips] = useState(new Set());
  const [activeFilter, setActiveFilter] = useState('all');

  function toggleTip(id) {
    setAdoptedTips((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const filters = ['all', ...Object.keys(CATEGORIES)];
  const filteredTips = activeFilter === 'all'
    ? REDUCTION_TIPS : REDUCTION_TIPS.filter((t) => t.category === activeFilter);

  const totalSavings = REDUCTION_TIPS
    .filter((t) => adoptedTips.has(t.id))
    .reduce((sum, t) => sum + t.savingKgPerYear, 0);

  return (
    <div className="tips-section">
      {adoptedTips.size > 0 && (
        <div className="savings-banner" role="status" aria-live="polite">
          <span className="savings-icon" aria-hidden="true">🌍</span>
          <span>
            By adopting {adoptedTips.size} tip{adoptedTips.size !== 1 ? 's' : ''}, you could save{' '}
            <strong>{formatEmission(totalSavings)}/year</strong>
          </span>
        </div>
      )}

      <section className="card" aria-label="Reduction tips">
        <h2 className="section-title">Ways to reduce</h2>
        <div className="tip-filters" role="group" aria-label="Filter tips by category">
          {filters.map((f) => (
            <button key={f} className={`tip-filter-btn ${activeFilter === f ? 'tip-filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(f)} aria-pressed={activeFilter === f}>
              {f === 'all' ? 'All' : `${CATEGORIES[f]?.icon} ${CATEGORIES[f]?.label}`}
            </button>
          ))}
        </div>
        <ul className="tips-list" aria-label="Reduction tips list">
          {filteredTips.map((tip) => (
            <TipCard key={tip.id} tip={tip} adopted={adoptedTips.has(tip.id)} onToggle={toggleTip} />
          ))}
        </ul>
      </section>

      <section className="card" aria-label="Achievements and badges">
        <h2 className="section-title">Achievements</h2>
        <ul className="badges-grid">
          {BADGES.map((badge) => {
            const earned = earnedBadges.includes(badge.id);
            return (
              <li key={badge.id}
                className={`badge-card ${earned ? 'badge-card--earned' : 'badge-card--locked'}`}
                aria-label={`${badge.label}: ${badge.description}${earned ? ' — Earned' : ' — Locked'}`}>
                <div className="badge-icon" aria-hidden="true">{badge.icon}</div>
                <div className="badge-label">{badge.label}</div>
                <div className="badge-desc">{badge.description}</div>
                {!earned && <div className="badge-lock" aria-hidden="true">🔒</div>}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

TipsAndBadges.propTypes = {
  earnedBadges: PropTypes.arrayOf(PropTypes.string).isRequired,
};
