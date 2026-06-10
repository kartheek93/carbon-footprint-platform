/**
 * EcoTrace — Carbon Footprint Awareness Platform
 * Main application component
 */

import { useState, useMemo } from 'react';
import { Leaf, LayoutDashboard, PlusCircle, History, Lightbulb, MessageCircle } from 'lucide-react';
import Dashboard from './components/Dashboard.jsx';
import ActivityLogger from './components/ActivityLogger.jsx';
import ActivityHistory from './components/ActivityHistory.jsx';
import AiChat from './components/AiChat.jsx';
import TipsAndBadges from './components/TipsAndBadges.jsx';
import BadgeToast from './components/BadgeToast.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useEntries, useProfile, useBadges, useChatHistory } from './hooks/useCarbon.js';

/** Tab definitions — id must match render conditions below */
const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'log',       label: 'Log',       icon: PlusCircle },
  { id: 'history',   label: 'History',   icon: History },
  { id: 'tips',      label: 'Tips',      icon: Lightbulb },
  { id: 'chat',      label: 'AI Chat',   icon: MessageCircle },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const { entries, addEntry, removeEntry, totalKg, byCategory, annualProjection, streak, error } = useEntries();
  const { profile } = useProfile();
  const { earnedBadges, newBadge } = useBadges(entries, annualProjection);
  const { messages, addMessage, clearHistory } = useChatHistory();

  /**
   * Context passed to AI assistant for personalised responses.
   * Memoised so it only recalculates when the underlying data changes.
   */
  const userContext = useMemo(() => ({
    annualProjectionKg: annualProjection,
    totalLoggedKg: totalKg,
    topCategory: Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    streak,
    badgesEarned: earnedBadges.length,
    entryCount: entries.length,
    profile,
  }), [annualProjection, totalKg, byCategory, streak, earnedBadges.length, entries.length, profile]);

  return (
    <div className="app">
      {/* Skip link for keyboard navigation */}
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header className="app-header" role="banner">
        <div className="header-brand">
          <Leaf size={24} color="#4ade80" aria-hidden="true" />
          <span className="brand-name">EcoTrace</span>
        </div>
        <div className="header-tagline" aria-label="Tagline">
          Understand · Track · Reduce
        </div>
      </header>

      <nav className="tab-nav" aria-label="Main navigation">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`tab-btn ${activeTab === id ? 'tab-btn--active' : ''}`}
            onClick={() => setActiveTab(id)}
            aria-current={activeTab === id ? 'page' : undefined}
            aria-label={label}
          >
            <Icon size={18} aria-hidden="true" />
            <span className="tab-label">{label}</span>
          </button>
        ))}
      </nav>

      <main id="main-content" className="app-content">
        <ErrorBoundary>
          {activeTab === 'dashboard' && (
            <Dashboard
              entries={entries}
              totalKg={totalKg}
              byCategory={byCategory}
              annualProjection={annualProjection}
              streak={streak}
              earnedBadges={earnedBadges}
            />
          )}
          {activeTab === 'log' && (
            <ActivityLogger onAdd={addEntry} error={error} />
          )}
          {activeTab === 'history' && (
            <ActivityHistory entries={entries} onDelete={removeEntry} />
          )}
          {activeTab === 'tips' && (
            <TipsAndBadges earnedBadges={earnedBadges} />
          )}
          {activeTab === 'chat' && (
            <AiChat
              messages={messages}
              onAddMessage={addMessage}
              onClearHistory={clearHistory}
              userContext={userContext}
            />
          )}
        </ErrorBoundary>
      </main>

      <BadgeToast badge={newBadge} />
    </div>
  );
}
