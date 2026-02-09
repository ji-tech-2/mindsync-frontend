/**
 * Field Mappings - Single Source of Truth
 * Define UI display values -> API values mapping once
 * Everything else is auto-generated
 */

// ============================================
// SINGLE SOURCE OF TRUTH - Display -> API
// ============================================
const MAPPINGS = {
  gender: {
    Male: 'Male',
    Female: 'Female',
  },
  occupation: {
    Employed: 'Employed',
    Unemployed: 'Unemployed',
    Student: 'Student',
    Freelancer: 'Self-employed',
    Retired: 'Unemployed',
    Other: 'Self-employed',
  },
  workMode: {
    Remote: 'Remote',
    Hybrid: 'Hybrid',
    'On-site': 'In-person',
    Unemployed: 'Unemployed',
  },
};

// ============================================
// AUTO-GENERATED: Reverse Mappings
// ============================================
function createReverseMap(forwardMap) {
  const reverse = {};
  for (const [displayVal, apiVal] of Object.entries(forwardMap)) {
    // Handle many-to-one mappings (use first occurrence)
    if (!reverse[apiVal]) {
      reverse[apiVal] = displayVal;
    }
  }
  return reverse;
}

const REVERSE_MAPPINGS = {
  gender: createReverseMap(MAPPINGS.gender),
  occupation: createReverseMap(MAPPINGS.occupation),
  workMode: createReverseMap(MAPPINGS.workMode),
};

// ============================================
// AUTO-GENERATED: Dropdown Options
// ============================================
function createOptions(fieldName) {
  const mapping = MAPPINGS[fieldName];
  return Object.keys(mapping).map((key) => ({ value: key, label: key }));
}

export const genderOptions = createOptions('gender');
export const occupationOptions = createOptions('occupation');
export const workModeOptions = createOptions('workMode');

// ============================================
// PUBLIC API: Transformation Functions
// ============================================
export function toApiGender(displayValue) {
  return MAPPINGS.gender[displayValue] || displayValue;
}

export function toApiOccupation(displayValue) {
  return MAPPINGS.occupation[displayValue] || displayValue;
}

export function toApiWorkMode(displayValue) {
  return MAPPINGS.workMode[displayValue] || displayValue;
}

export function fromApiGender(apiValue) {
  return REVERSE_MAPPINGS.gender[apiValue] || apiValue;
}

export function fromApiOccupation(apiValue) {
  return REVERSE_MAPPINGS.occupation[apiValue] || apiValue;
}

export function fromApiWorkMode(apiValue) {
  return REVERSE_MAPPINGS.workMode[apiValue] || apiValue;
}
