/**
 * Category Helpers — Single Source of Truth for health category mappings.
 *
 * Used by WeeklyChart, HistoryItem, StatusBadge, and ScoreDisplay so that
 * every feature always displays the same colors and labels.
 *
 * Categories (API values):
 *   healthy | above_average | average | not healthy | dangerous
 */

// ---------------------------------------------------------------------------
// Hex colors (for Recharts / SVG elements that don't support CSS variables)
// ---------------------------------------------------------------------------
export const CATEGORY_HEX_COLORS = {
  healthy: '#10b981', // --color-green
  above_average: '#bddd2c', // --color-lime
  average: '#f59e0b', // --color-yellow
  'not healthy': '#f97316', // --color-orange
  dangerous: '#ef4444', // --color-red
};

// ---------------------------------------------------------------------------
// CSS variable colors (for styled HTML elements)
// ---------------------------------------------------------------------------
export const CATEGORY_CSS_COLORS = {
  healthy: 'var(--color-green)',
  above_average: 'var(--color-lime)',
  average: 'var(--color-yellow)',
  'not healthy': 'var(--color-orange)',
  dangerous: 'var(--color-red)',
};

// ---------------------------------------------------------------------------
// Human-readable labels (title case)
// ---------------------------------------------------------------------------
export const CATEGORY_LABELS = {
  healthy: 'Healthy',
  above_average: 'Above Average',
  average: 'Average',
  'not healthy': 'Not Healthy',
  dangerous: 'Dangerous',
};

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Returns the hex color string for a category.
 * Falls back to the healthy color for unknown values.
 *
 * @param {string} category - API health_level value
 * @returns {string} Hex color string
 */
export function getCategoryHexColor(category) {
  if (!category) return CATEGORY_HEX_COLORS.healthy;
  return (
    CATEGORY_HEX_COLORS[category.toLowerCase()] ?? CATEGORY_HEX_COLORS.healthy
  );
}

/**
 * Returns the CSS variable color string for a category.
 * Falls back to the healthy color for unknown values.
 *
 * @param {string} category - API health_level value
 * @returns {string} CSS variable string, e.g. 'var(--color-green)'
 */
export function getCategoryColor(category) {
  if (!category) return CATEGORY_CSS_COLORS.healthy;
  return (
    CATEGORY_CSS_COLORS[category.toLowerCase()] ?? CATEGORY_CSS_COLORS.healthy
  );
}

/**
 * Returns the human-readable label for a category.
 * Falls back to the raw value for unknown categories.
 *
 * @param {string} category - API health_level value
 * @returns {string} Display label, e.g. 'Above Average'
 */
export function getCategoryLabel(category) {
  if (!category) return 'Unknown';
  return CATEGORY_LABELS[category.toLowerCase()] ?? category;
}
