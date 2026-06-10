# 🌿 EcoTrace — Carbon Footprint Awareness Platform

**Challenge 3: Carbon Footprint Awareness Platform**

EcoTrace is a smart, AI-powered web application that helps individuals understand, track, and meaningfully reduce their personal carbon footprint through simple activity logging, personalised insights, and an interactive AI advisor.

---

## 🎯 Chosen Vertical

**Individual Carbon Footprint Tracker** — focused on everyday consumers who want to take personal action on climate change without needing technical or scientific expertise.

---

## 🚀 Live Features

| Feature | Description |
|---|---|
| 📊 **Dashboard** | Real-time stats, annual projection, comparison to global average & Paris target |
| ✏️ **Activity Logger** | Log transport, food, energy, and shopping with live emission preview |
| 📜 **History** | Filterable and sortable activity log with delete support |
| 💡 **Tips & Badges** | Personalised reduction tips with potential savings, gamified achievements |
| 🤖 **AI Chat** | Claude-powered advisor with full context of your footprint data |

---

## 🧠 Approach & Logic

### Emission Calculations

Emissions are computed using peer-reviewed factors from the **EPA**, **IPCC**, and **Our World in Data**:

- **Transport**: kg CO₂e per kilometre, per mode (petrol/diesel/electric/cycling/flights/train…)
- **Food**: kg CO₂e per kg of food type (beef ~27 kg CO₂e/kg vs legumes ~0.9)
- **Energy**: kg CO₂e per kWh (grid electricity) or per m³ (natural gas)
- **Shopping**: estimated lifecycle emissions per item type

### Annual Projection

The app projects a user's annual footprint by extrapolating their logged period:

```
annual_projection = (total_logged / days_tracked) × 365
```

This is compared against two benchmarks:
- 🌍 **Global average**: ~4,700 kg CO₂e/year
- 🎯 **Paris Agreement target**: ~2,000 kg CO₂e/year (1.5°C pathway)

### AI Personalisation

The AI chat (powered by Claude Sonnet) receives a structured context object on every message containing:
- The user's annual projection
- Top emission category
- Number of entries and badges
- Profile information

This enables the assistant to give specific, contextual advice rather than generic tips.

---

## 🏗️ How the Solution Works

```
src/
├── components/
│   ├── Dashboard.jsx       # Charts, benchmarks, stat cards
│   ├── ActivityLogger.jsx  # Form to log emissions
│   ├── ActivityHistory.jsx # Filterable entry log
│   ├── AiChat.jsx          # Claude-powered chat interface
│   ├── TipsAndBadges.jsx   # Reduction tips + gamification
│   └── BadgeToast.jsx      # Achievement notification
├── hooks/
│   └── useCarbon.js        # State management via custom hooks
├── utils/
│   ├── carbonCalc.js       # Pure calculation functions
│   ├── storage.js          # localStorage with quota handling
│   └── aiAssistant.js      # Anthropic API integration
├── types/
│   └── constants.js        # Emission factors, categories, tips
└── styles/
    └── global.css          # Full CSS design system

tests/
├── carbonCalc.test.js      # 46 unit tests for calculations
├── storage.test.js         # 14 tests for data persistence
└── components.test.jsx     # 17 component tests
```

---

## ✅ Evaluation Focus Areas

### 1. Code Quality
- Pure calculation functions with clear separation of concerns
- Custom React hooks abstract all state/side-effect logic
- Consistent naming, JSDoc comments, no dead code
- ESLint configured with `react`, `react-hooks`, and `jsx-a11y` plugins

### 2. Security
- **XSS prevention**: All user text input sanitised via `sanitizeText()` which escapes `< > " ' &`
- **Input validation**: `validateEntry()` validates all fields before persistence; negative/NaN values rejected
- **Storage safety**: `safeGet`/`safeSet` wrappers handle `QuotaExceededError` and parse errors gracefully
- **No API key exposure**: The Anthropic API key is never included in frontend code
- **Content length limits**: Notes capped at 200 chars, chat messages at 500 chars

### 3. Efficiency
- All calculation functions are pure (O(n) at worst)
- Chat history persisted with a 50-message rolling window to prevent storage bloat
- Entries auto-trimmed at 500 if storage quota is exceeded
- `useMemo` used for expensive chart data derivations
- `useCallback` on all mutation functions to avoid unnecessary re-renders

### 4. Testing
- **77 tests across 3 test files** — all passing ✅
- Unit tests cover every calculation function, including edge cases (zero, negative, NaN, unknown types)
- Storage tests verify CRUD operations, deduplication, and `clearAllData`
- Component tests verify accessibility attributes, user interactions, and state changes
- Tests revealed a real bug (NaN passing `typeof === 'number'`) which was fixed before submission

### 5. Accessibility
- **WCAG 2.1 AA** compliance throughout:
  - Skip-to-content link for keyboard users
  - All interactive elements have descriptive `aria-label` attributes
  - `aria-live` regions for dynamic content (chat, badge toasts, emission preview)
  - `aria-pressed` on toggle buttons, `aria-current` on nav tabs
  - `aria-expanded` on collapsible tip cards
  - `role="alert"` on error messages and badge awards
  - `role="log"` on chat message history
  - `role="progressbar"` on benchmark bars
  - `prefers-reduced-motion` respected in CSS
  - `:focus-visible` styles for keyboard navigation
  - Semantic HTML throughout (`<header>`, `<nav>`, `<main>`, `<section>`, `<ul>`, `<li>`)

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Environment Setup
```bash
# Copy the example env file and add your Gemini API key
cp .env.example .env
# Edit .env and set: VITE_GEMINI_API_KEY=your_key_here
# Get a free key at: https://aistudio.google.com/app/apikey
```

### Development
```bash
npm install
npm run dev
```

### Tests
```bash
npm test
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 🔧 Assumptions Made

1. **Emission factors** are global averages. Regional grid mix, vehicle efficiencies, and local food systems vary; users should interpret projections as estimates.
2. **Food amounts** are entered in kilograms of raw food, not servings. A typical week of beef consumption is roughly 0.3–0.5 kg.
3. **Energy usage** for electricity uses the global average grid factor (0.233 kg/kWh). Users on renewable tariffs can select `solar` or `wind` instead.
4. **Annual projection** accuracy improves with more days of data. Short-period projections (< 7 days) may not represent typical behaviour.
5. The app stores all data locally in the browser; no account or backend is required, and no personal data leaves the device.

---

## 🌍 Impact Potential

If 1,000 users each reduce their footprint by 500 kg CO₂e/year through EcoTrace insights, that's **500 tonnes of CO₂e avoided** — equivalent to taking ~108 cars off the road for a year.

---

## 📄 License

MIT
