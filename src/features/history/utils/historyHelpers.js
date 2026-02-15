/**
 * Helper utilities for History feature
 */

/**
 * Generate month options from history data
 */
export const generateMonthOptions = (historyData) => {
  if (!historyData.length) return [];

  const months = new Set();
  historyData.forEach((item) => {
    const date = new Date(item.date);
    const monthYear = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    months.add(monthYear);
  });

  const sortedMonths = Array.from(months).sort((a, b) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA; // Most recent first
  });

  return sortedMonths.map((month) => ({
    label: month,
    value: month,
  }));
};

/**
 * Filter history data by selected month
 */
export const filterHistoryByMonth = (historyData, selectedMonth) => {
  if (!selectedMonth) return historyData;

  return historyData.filter((item) => {
    const date = new Date(item.date);
    const monthYear = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;
    return monthYear === selectedMonth.value;
  });
};

/**
 * Transform API response data to frontend format
 */
export const transformHistoryData = (apiData) => {
  return apiData.map((item) => {
    // Normalize score to 0-100 range
    let normalizedScore = item.prediction_score;

    // Clamp score to 0-100
    if (normalizedScore < 0) {
      normalizedScore = 0;
    } else if (normalizedScore > 100) {
      normalizedScore = 100;
    }

    return {
      id: item.prediction_id,
      predictionId: item.prediction_id,
      date: item.created_at,
      score: Math.round(normalizedScore),
      category: item.health_level,
      advice: item.advice,
      wellness_analysis: item.wellness_analysis,
    };
  });
};

/**
 * Get user ID from user object
 */
export const getUserId = (user) => {
  return user?.userId || user?.id || user?.user_id || null;
};
