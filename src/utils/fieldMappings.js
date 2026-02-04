/**
 * Field mappings for gender, occupation, and work mode
 * Used for both display and API transformation
 */

export const genderMap = {
  Male: "Male",
  Female: "Female",
  Other: "Non-binary/Other",
};

export const occupationMap = {
  Employed: "Employed",
  Unemployed: "Unemployed",
  Student: "Student",
  Freelancer: "Self-employed",
  Retired: "Unemployed",
  Other: "Self-employed",
};

export const workModeMap = {
  Remote: "Remote",
  Hybrid: "Hybrid",
  "On-site": "In-person",
  Unemployed: "Unemployed",
};

// Generate options arrays from map keys
export const genderOptions = Object.keys(genderMap)
  .filter(key => key !== "Other") // Filter out "Other" for profile page (only Male/Female)
  .map(key => ({ value: key, label: key }));

export const occupationOptions = Object.keys(occupationMap).map(key => ({
  value: key,
  label: key,
}));

export const workModeOptions = Object.keys(workModeMap).map(key => ({
  value: key,
  label: key,
}));

// Reverse mapping for display (from API values to display values)
export const reverseGenderMap = Object.entries(genderMap).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {},
);

export const reverseOccupationMap = Object.entries(occupationMap).reduce(
  (acc, [key, value]) => {
    acc[value] = key;
    return acc;
  },
  {},
);
