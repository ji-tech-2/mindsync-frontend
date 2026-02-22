/**
 * Chart Helper Functions
 *
 * Utilities for transforming and processing chart data.
 */

/**
 * Build weekly chart data from screening history.
 * Clamps each score to [0, 100] BEFORE averaging per day.
 * This avoids the issue where Flask averages raw negative scores.
 *
 * @param {Array} historyItems - Array of screening history items
 * @returns {Array} Weekly chart data with 7 days
 */
// Returns YYYY-MM-DD in the browser's local timezone
const toLocalDateKey = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export function buildWeeklyChartFromHistory(historyItems) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Group clamped scores by local date
  const scoresByDate = {};
  historyItems.forEach((item) => {
    const d = new Date(item.created_at || item.date);
    const key = toLocalDateKey(d);
    const raw = item.prediction_score ?? item.score ?? 0;
    const clamped = Math.max(0, Math.min(100, raw));
    if (!scoresByDate[key]) scoresByDate[key] = [];
    scoresByDate[key].push(clamped);
  });

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chart = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = toLocalDateKey(d);
    const scores = scoresByDate[key];
    const hasData = !!scores;
    const avg = scores
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    chart.push({ day: dayLabels[d.getDay()], date: key, value: avg, hasData });
  }
  return chart;
}
