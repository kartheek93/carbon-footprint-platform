/**
 * Carbon emission factors (kg CO2e per unit)
 * Sources: EPA, IPCC, Our World in Data
 */

export const EMISSION_FACTORS = {
  transport: {
    car_petrol: 0.192,        // kg CO2e per km
    car_diesel: 0.171,        // kg CO2e per km
    car_electric: 0.053,      // kg CO2e per km
    motorcycle: 0.114,        // kg CO2e per km
    bus: 0.089,               // kg CO2e per km per passenger
    train: 0.041,             // kg CO2e per km
    domestic_flight: 0.255,   // kg CO2e per km
    long_haul_flight: 0.195,  // kg CO2e per km
    cycling: 0.0,             // kg CO2e per km
    walking: 0.0,             // kg CO2e per km
  },
  food: {
    beef: 27.0,               // kg CO2e per kg
    lamb: 39.2,               // kg CO2e per kg
    pork: 12.1,               // kg CO2e per kg
    chicken: 6.9,             // kg CO2e per kg
    fish: 6.1,                // kg CO2e per kg
    dairy: 3.2,               // kg CO2e per kg
    eggs: 4.5,                // kg CO2e per kg
    rice: 2.7,                // kg CO2e per kg
    vegetables: 2.0,          // kg CO2e per kg
    fruits: 1.1,              // kg CO2e per kg
    legumes: 0.9,             // kg CO2e per kg
  },
  energy: {
    electricity_grid: 0.233,  // kg CO2e per kWh (world avg)
    natural_gas: 2.204,       // kg CO2e per m³
    heating_oil: 2.68,        // kg CO2e per litre
    solar: 0.041,             // kg CO2e per kWh
    wind: 0.011,              // kg CO2e per kWh
  },
  shopping: {
    clothing: 10.0,           // kg CO2e per item (avg)
    electronics_phone: 70.0,  // kg CO2e per device
    electronics_laptop: 300.0, // kg CO2e per device
    online_purchase: 0.5,     // kg CO2e per small package
  },
};

export const CATEGORIES = {
  transport: { label: 'Transport', icon: '🚗', color: '#3b82f6' },
  food: { label: 'Food & Diet', icon: '🥗', color: '#f59e0b' },
  energy: { label: 'Home Energy', icon: '⚡', color: '#8b5cf6' },
  shopping: { label: 'Shopping', icon: '🛍️', color: '#ec4899' },
};

export const GLOBAL_AVERAGE_KG_PER_YEAR = 4700; // kg CO2e (world avg ~4.7 tonnes)
export const UK_AVERAGE_KG_PER_YEAR = 5500;
export const US_AVERAGE_KG_PER_YEAR = 14000;
export const TARGET_KG_PER_YEAR = 2000; // Paris Agreement ~2 tonnes per person

export const REDUCTION_TIPS = [
  {
    id: 'tip_1',
    category: 'transport',
    title: 'Switch to public transport',
    description: 'Using buses or trains instead of a personal car can cut transport emissions by up to 75%.',
    savingKgPerYear: 2400,
    difficulty: 'medium',
  },
  {
    id: 'tip_2',
    category: 'food',
    title: 'Eat less beef',
    description: 'Replacing beef with chicken or plant-based proteins once a week saves significant emissions.',
    savingKgPerYear: 300,
    difficulty: 'easy',
  },
  {
    id: 'tip_3',
    category: 'energy',
    title: 'Switch to renewable energy',
    description: 'Switching to a green energy tariff or installing solar panels dramatically cuts home emissions.',
    savingKgPerYear: 1500,
    difficulty: 'medium',
  },
  {
    id: 'tip_4',
    category: 'transport',
    title: 'Work from home 2 days/week',
    description: 'Reducing commuting days lowers your transport footprint proportionally.',
    savingKgPerYear: 960,
    difficulty: 'easy',
  },
  {
    id: 'tip_5',
    category: 'food',
    title: 'Reduce food waste',
    description: 'Planning meals and using leftovers reduces the emissions from food production going to waste.',
    savingKgPerYear: 200,
    difficulty: 'easy',
  },
  {
    id: 'tip_6',
    category: 'shopping',
    title: 'Buy second-hand clothing',
    description: 'Choosing pre-owned clothing saves 80% of the carbon cost of new items.',
    savingKgPerYear: 120,
    difficulty: 'easy',
  },
  {
    id: 'tip_7',
    category: 'transport',
    title: 'Avoid short-haul flights',
    description: 'Taking the train instead of flying for distances under 500km saves substantial emissions.',
    savingKgPerYear: 800,
    difficulty: 'hard',
  },
  {
    id: 'tip_8',
    category: 'energy',
    title: 'Improve home insulation',
    description: 'Proper insulation can reduce heating energy use by 30-45%.',
    savingKgPerYear: 600,
    difficulty: 'hard',
  },
];

export const BADGES = [
  { id: 'first_log', label: 'First Step', description: 'Logged your first activity', icon: '🌱' },
  { id: 'week_streak', label: 'Consistent', description: '7-day logging streak', icon: '🔥' },
  { id: 'under_average', label: 'Below Average', description: 'Footprint below global average', icon: '🌍' },
  { id: 'tip_adopted', label: 'Action Taker', description: 'Adopted your first tip', icon: '✅' },
  { id: 'kg_saved_100', label: 'Century Saver', description: 'Saved 100 kg CO2e', icon: '💯' },
  { id: 'plant_based', label: 'Plant Power', description: 'Had a plant-based week', icon: '🥦' },
  { id: 'zero_flight', label: 'Ground Bound', description: 'No flights for 3 months', icon: '🚂' },
];
