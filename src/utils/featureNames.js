/**
 * Feature Names - Single Source of Truth
 * Maps technical feature names (from polynomial feature engineering)
 * to customer-friendly display names
 *
 * Features come from sklearn's PolynomialFeatures transformation:
 * - Base features: num__feature_name
 * - Squared features: num__feature_name^2
 * - Interaction features: num__feature1 feature2 (space-separated = multiplied)
 */

// ============================================
// SINGLE SOURCE OF TRUTH - Feature Display Names
// ============================================

export const FEATURE_DISPLAY_NAMES = {
  // Sleep-related features
  'num__sleep_quality_1_5^2': 'Sleep Quality',
  num__sleep_hours: 'Sleep Duration',
  'num__age sleep_hours': 'Age-Related Sleep Needs',

  // Screen time features
  'num__work_screen_hours leisure_screen_hours': 'Total Screen Time',

  // Stress features
  num__stress_level_0_10: 'Stress Level',
  'num__stress_level_0_10^2': 'Stress Level',

  // Physical activity
  num__exercise_minutes_per_week: 'Physical Activity',

  // Productivity features
  num__productivity_0_100: 'Productivity',

  // Interaction features (combined factors)
  'num__sleep_hours productivity_0_100': 'Sleep & Productivity Balance',
  'num__stress_level_0_10 productivity_0_100': 'Stress & Productivity Impact',
};

// ============================================
// Icon Mapping for UI Display
// ============================================

export const FEATURE_ICONS = {
  'Sleep Quality': '🛏️',
  'Sleep Duration': '😴',
  'Age-Related Sleep Needs': '🛏️',
  'Total Screen Time': '📱',
  'Stress Level': '😰',
  'Physical Activity': '🏃',
  Productivity: '💼',
  'Sleep & Productivity Balance': '⚖️',
  'Stress & Productivity Impact': '📊',
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get customer-friendly display name for a feature
 * @param {string} featureName - Technical feature name from model
 * @returns {string} Customer-friendly display name
 */
export const getFeatureDisplayName = (featureName) => {
  // Check if we have an explicit mapping
  if (FEATURE_DISPLAY_NAMES[featureName]) {
    return FEATURE_DISPLAY_NAMES[featureName];
  }

  // Fallback: auto-format the feature name
  // Remove 'num__' prefix, remove ranges/scores, clean up underscores
  return featureName
    .replace(/^num__/, '') // Remove 'num__' prefix
    .replace(/_\d+_\d+/g, '') // Remove ranges like '_0_10', '_1_5'
    .replace(/\^\d+$/, '') // Remove exponents like '^2'
    .split(/[\s_]+/) // Split on spaces or underscores
    .filter((word) => word.length > 0)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Get icon for a feature based on its display name
 * @param {string} displayName - Customer-friendly feature name
 * @returns {string} Emoji icon
 */
export const getFeatureIcon = (displayName) => {
  // Check explicit mapping first
  if (FEATURE_ICONS[displayName]) {
    return FEATURE_ICONS[displayName];
  }

  // Fallback: determine icon based on keywords
  const lowerName = displayName.toLowerCase();
  if (lowerName.includes('sleep')) return '🛏️';
  if (lowerName.includes('exercise') || lowerName.includes('activity'))
    return '🏃';
  if (lowerName.includes('screen')) return '📱';
  if (lowerName.includes('social')) return '👥';
  if (lowerName.includes('stress')) return '😰';
  if (lowerName.includes('productivity')) return '💼';
  if (lowerName.includes('age')) return '👤';

  return '💡'; // Default icon
};

/**
 * Get both display name and icon for a feature
 * @param {string} featureName - Technical feature name
 * @returns {{displayName: string, icon: string}}
 */
export const getFeatureDisplay = (featureName) => {
  const displayName = getFeatureDisplayName(featureName);
  const icon = getFeatureIcon(displayName);
  return { displayName, icon };
};
