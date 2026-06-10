/**
 * Activity History — sortable, filterable log of past entries
 */

import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Trash2, Filter } from 'lucide-react';
import { formatEmission } from '../utils/carbonCalc.js';
import { CATEGORIES } from '../types/constants.js';

export default function ActivityHistory({ entries, onDelete }) {
  const [filterCat, setFilterCat] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const filtered = useMemo(() => {
    let list = filterCat === 'all' ? [...entries] : entries.filter((e) => e.category === filterCat);
    switch (sortBy) {
      case 'date_desc':     list.sort((a, b) => new Date(b.date) - new Date(a.date)); break;
      case 'date_asc':      list.sort((a, b) => new Date(a.date) - new Date(b.date)); break;
      case 'emission_desc': list.sort((a, b) => b.emissionKg - a.emissionKg); break;
      case 'emission_asc':  list.sort((a, b) => a.emissionKg - b.emissionKg); break;
      default: break;
    }
    return list;
  }, [entries, filterCat, sortBy]);

  function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function formatActivityLabel(entry) {
    return entry.activityType.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  return (
    <section className="card history-card" aria-label="Activity history">
      <div className="history-header">
        <h2 className="section-title">Activity log</h2>
        <span className="history-count">{entries.length} entries</span>
      </div>

      <div className="history-controls" role="group" aria-label="Filter and sort options">
        <div className="filter-group">
          <Filter size={14} aria-hidden="true" />
          <label htmlFor="filter-category" className="sr-only">Filter by category</label>
          <select id="filter-category" value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)} className="filter-select">
            <option value="all">All categories</option>
            {Object.entries(CATEGORIES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label htmlFor="sort-entries" className="sr-only">Sort entries</label>
          <select id="sort-entries" value={sortBy}
            onChange={(e) => setSortBy(e.target.value)} className="filter-select">
            <option value="date_desc">Newest first</option>
            <option value="date_asc">Oldest first</option>
            <option value="emission_desc">Highest emission</option>
            <option value="emission_asc">Lowest emission</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="history-empty" role="status">
          {entries.length === 0
            ? 'No activities logged yet. Start tracking to see your footprint.'
            : 'No entries match the selected filter.'}
        </p>
      ) : (
        <ul className="history-list" aria-label="Logged activities">
          {filtered.map((entry) => {
            const cat = CATEGORIES[entry.category];
            return (
              <li key={entry.id} className="history-item">
                <div className="history-dot" style={{ background: cat?.color || '#94a3b8' }} aria-hidden="true" />
                <div className="history-info">
                  <div className="history-title">
                    <span aria-hidden="true">{cat?.icon}</span>{' '}
                    {formatActivityLabel(entry)}
                    {entry.notes && <span className="history-notes"> — {entry.notes}</span>}
                  </div>
                  <div className="history-meta">{formatDate(entry.date)} · {cat?.label}</div>
                </div>
                <div className="history-emission" style={{ color: cat?.color || '#94a3b8' }}
                  aria-label={`${formatEmission(entry.emissionKg)} CO2e`}>
                  {formatEmission(entry.emissionKg)}
                </div>
                <button onClick={() => onDelete(entry.id)} className="btn-icon btn-icon--danger"
                  aria-label={`Delete ${formatActivityLabel(entry)} on ${formatDate(entry.date)}`}
                  title="Delete entry">
                  <Trash2 size={15} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

ActivityHistory.propTypes = {
  entries: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    activityType: PropTypes.string.isRequired,
    emissionKg: PropTypes.number.isRequired,
    date: PropTypes.string.isRequired,
    notes: PropTypes.string,
  })).isRequired,
  onDelete: PropTypes.func.isRequired,
};
