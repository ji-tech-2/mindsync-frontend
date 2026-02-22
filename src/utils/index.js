// Utils
export { buildWeeklyChartFromHistory } from './chartHelpers';
export {
  genderOptions,
  occupationOptions,
  workModeOptions,
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
  fromApiGender,
  fromApiOccupation,
  fromApiWorkMode,
} from './fieldMappings';
export { validatePassword } from './passwordValidation';
export { TokenManager } from './tokenManager';
export {
  saveToSession,
  getFromSession,
  removeFromSession,
} from './sessionHelper';

// Category helpers - Single Source of Truth for health category mappings
export {
  CATEGORY_HEX_COLORS,
  CATEGORY_CSS_COLORS,
  CATEGORY_LABELS,
  getCategoryHexColor,
  getCategoryColor,
  getCategoryLabel,
} from './categoryHelpers';

// Feature Names - Single Source of Truth
export {
  FEATURE_DISPLAY_NAMES,
  FEATURE_ICONS,
  getFeatureDisplayName,
  getFeatureIcon,
  getFeatureDisplay,
} from './featureNames';
