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
// Font Awesome Icon Imports
// ============================================

import {
  faBed,
  faMoon,
  faUserClock,
  faDisplay,
  faBrain,
  faPersonRunning,
  faBriefcase,
  faScaleBalanced,
  faChartLine,
  faLightbulb,
} from '@fortawesome/free-solid-svg-icons';

// ============================================
// Image Imports (Optimized with vite-imagetools)
// ============================================

import sleepImage from '@/assets/feature-images/tania-mousinho-sleep.jpg?w=800&format=webp&quality=85';
import stressImage from '@/assets/feature-images/vitaly-gariev-stress.jpg?w=800&format=webp&quality=85';
import exerciseImage from '@/assets/feature-images/vitaly-gariev-exercise.jpg?w=800&format=webp&quality=85';
import workImage from '@/assets/feature-images/christin-hume-work.jpg?w=800&format=webp&quality=85';
import wakeImage from '@/assets/feature-images/vitaly-gariev-wake.jpg?w=800&format=webp&quality=85';

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
// Icon Mapping for UI Display (Font Awesome icon objects)
// ============================================

export const FEATURE_ICONS = {
  'Sleep Quality': faBed,
  'Sleep Duration': faMoon,
  'Age-Related Sleep Needs': faUserClock,
  'Total Screen Time': faDisplay,
  'Stress Level': faBrain,
  'Physical Activity': faPersonRunning,
  Productivity: faBriefcase,
  'Sleep & Productivity Balance': faScaleBalanced,
  'Stress & Productivity Impact': faChartLine,
};

// ============================================
// Image Mapping for Feature Cards
// ============================================

export const FEATURE_IMAGES = {
  'Sleep Quality': wakeImage,
  'Sleep Duration': sleepImage,
  'Age-Related Sleep Needs': wakeImage,
  'Total Screen Time': workImage,
  'Stress Level': stressImage,
  'Physical Activity': exerciseImage,
  Productivity: workImage,
  'Sleep & Productivity Balance': sleepImage,
  'Stress & Productivity Impact': stressImage,
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
 * Get Font Awesome icon object for a feature based on its display name
 * @param {string} displayName - Customer-friendly feature name
 * @returns {object} Font Awesome icon object
 */
export const getFeatureIcon = (displayName) => {
  // Check explicit mapping first
  if (FEATURE_ICONS[displayName]) {
    return FEATURE_ICONS[displayName];
  }

  // Fallback: determine icon based on keywords
  const lowerName = displayName.toLowerCase();
  if (lowerName.includes('sleep')) return faBed;
  if (lowerName.includes('exercise') || lowerName.includes('activity'))
    return faPersonRunning;
  if (lowerName.includes('screen')) return faDisplay;
  if (lowerName.includes('social')) return faBriefcase;
  if (lowerName.includes('stress')) return faBrain;
  if (lowerName.includes('productivity')) return faBriefcase;
  if (lowerName.includes('age')) return faUserClock;

  return faLightbulb; // Default icon
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

/**
 * Get image path for a feature based on its display name
 * @param {string} displayName - Customer-friendly feature name
 * @returns {string} Image path for the feature
 */
export const getFeatureImage = (displayName) => {
  // Check explicit mapping first
  if (FEATURE_IMAGES[displayName]) {
    return FEATURE_IMAGES[displayName];
  }

  // Determine image based on keywords
  const lowerName = displayName.toLowerCase();
  if (lowerName.includes('sleep')) return FEATURE_IMAGES['Sleep Quality'];
  if (lowerName.includes('exercise') || lowerName.includes('activity'))
    return FEATURE_IMAGES['Physical Activity'];
  if (lowerName.includes('screen')) return FEATURE_IMAGES['Total Screen Time'];
  if (lowerName.includes('stress')) return FEATURE_IMAGES['Stress Level'];
  if (lowerName.includes('productivity')) return FEATURE_IMAGES['Productivity'];

  // Fallback to a generic image
  return workImage;
};
