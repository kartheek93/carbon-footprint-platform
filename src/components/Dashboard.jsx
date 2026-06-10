/**
 * Dashboard — overview of footprint stats and charts
 */

import { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Leaf, TrendingDown, TrendingUp, Target, Award } from 'lucide-react';
import { formatEmission, getEmissionColor, compareToBenchmarks } from '../utils/carbonCalc.js';
import { CATEGORIES, TARGET_KG_PER_YEAR, GLOBAL_AVERAGE_KG_PER_YEAR } from '../types/constants.js';

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="stat-card" role="region" aria-label={label}>
      <div className="stat-icon" style={{ color }} aria-hidden="true">
        <Icon size={22} />
      </div>
      <div className="stat-body">
        <div className="stat-value" style={{ color }}>
          {value}
        </div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  sub: PropTypes.string,
  color: PropTypes.string,
};
StatCard.defaultProps = { sub: null, color: '#4ade80' };

function BenchmarkBar({ label, value, max, color }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="benchmark-row">
      <span className="benchmark-label">{label}</span>
      <div
        className="benchmark-track"
        role="progressbar"
        aria-valuenow={Math.round(value)}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${label}: ${Math.round(value)} kg CO2e`}
      >
        <div className="benchmark-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="benchmark-val">{formatEmission(value)}</span>
    </div>
  );
}

BenchmarkBar.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired,
};

export default function Dashboard({
  entries,
  totalKg,
  byCategory,
  annualProjection,
  streak,
  earnedBadges,
}) {
  const benchmarks = useMemo(() => compareToBenchmarks(annualProjection || 0), [annualProjection]);
  const emissionColor = getEmissionColor(annualProjection || 0);

  const categoryData = useMemo(
    () =>
      Object.entries(byCategory).map(([key, val]) => ({
        name: CATEGORIES[key]?.label || key,
        kg: parseFloat(val.toFixed(2)),
        color: CATEGORIES[key]?.color || '#94a3b8',
      })),
    [byCategory]
  );

  const trendData = useMemo(() => {
    const days = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = 0;
    }
    entries.forEach((e) => {
      const day = e.date.slice(0, 10);
      if (days[day] !== undefined) {days[day] += e.emissionKg;}
    });
    return Object.entries(days).map(([date, kg]) => ({
      date: date.slice(5),
      kg: parseFloat(kg.toFixed(2)),
    }));
  }, [entries]);

  const maxBar = Math.max(TARGET_KG_PER_YEAR, GLOBAL_AVERAGE_KG_PER_YEAR, annualProjection || 1);

  return (
    <div className="dashboard">
      <div className="stats-grid" role="region" aria-label="Carbon footprint summary">
        <StatCard
          icon={Leaf}
          label="Total logged"
          value={formatEmission(totalKg)}
          sub={`${entries.length} activit${entries.length === 1 ? 'y' : 'ies'}`}
          color={emissionColor}
        />
        <StatCard
          icon={Target}
          label="Annual projection"
          value={formatEmission(annualProjection)}
          sub="estimated / year"
          color={emissionColor}
        />
        <StatCard
          icon={streak > 0 ? TrendingDown : TrendingUp}
          label="Logging streak"
          value={`${streak} day${streak !== 1 ? 's' : ''}`}
          sub="consecutive days"
          color="#f59e0b"
        />
        <StatCard
          icon={Award}
          label="Badges earned"
          value={earnedBadges.length}
          sub="achievements"
          color="#8b5cf6"
        />
      </div>

      <section className="card" aria-label="Emissions benchmarks">
        <h2 className="section-title">How you compare</h2>
        <div className="benchmarks">
          <BenchmarkBar
            label="Your projection"
            value={annualProjection || 0}
            max={maxBar}
            color={emissionColor}
          />
          <BenchmarkBar
            label="Global average"
            value={GLOBAL_AVERAGE_KG_PER_YEAR}
            max={maxBar}
            color="#f97316"
          />
          <BenchmarkBar
            label="Paris target"
            value={TARGET_KG_PER_YEAR}
            max={maxBar}
            color="#4ade80"
          />
        </div>
        {annualProjection > 0 && (
          <p className="benchmark-note">
            {benchmarks.vsGlobalAverage < 0
              ? `✅ You're ${Math.abs(benchmarks.vsGlobalAverage)}% below the global average.`
              : `⚠️ You're ${benchmarks.vsGlobalAverage}% above the global average.`}{' '}
            {benchmarks.vsTarget < 0
              ? `🎯 Below the Paris target!`
              : `The Paris target is ${formatEmission(TARGET_KG_PER_YEAR)}/yr.`}
          </p>
        )}
      </section>

      <div className="charts-grid">
        <section className="card" aria-label="7-day emissions trend">
          <h2 className="section-title">Last 7 days</h2>
          {trendData.some((d) => d.kg > 0) ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip
                  formatter={(v) => [`${v} kg CO2e`, 'Emissions']}
                  contentStyle={{
                    background: '#1e2d23',
                    border: '1px solid #2d4a36',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#d1fae5' }}
                />
                <Bar dataKey="kg" fill="#4ade80" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-chart">Log some activities to see your trend</p>
          )}
        </section>

        <section className="card" aria-label="Emissions by category">
          <h2 className="section-title">By category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="kg"
                  data={categoryData}
                  aria-label="Category breakdown pie chart"
                >
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [`${v} kg CO2e`, 'Emissions']}
                  contentStyle={{
                    background: '#1e2d23',
                    border: '1px solid #2d4a36',
                    borderRadius: 8,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} iconSize={10} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-chart">No data yet — log an activity to get started</p>
          )}
        </section>
      </div>
    </div>
  );
}

Dashboard.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      date: PropTypes.string,
      emissionKg: PropTypes.number,
      category: PropTypes.string,
    })
  ).isRequired,
  totalKg: PropTypes.number.isRequired,
  byCategory: PropTypes.objectOf(PropTypes.number).isRequired,
  annualProjection: PropTypes.number.isRequired,
  streak: PropTypes.number.isRequired,
  earnedBadges: PropTypes.arrayOf(PropTypes.string).isRequired,
};
