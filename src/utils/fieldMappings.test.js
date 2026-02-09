import { describe, it, expect } from 'vitest';
import {
  toApiGender,
  toApiOccupation,
  toApiWorkMode,
  fromApiGender,
  fromApiOccupation,
  fromApiWorkMode,
  genderOptions,
  occupationOptions,
  workModeOptions,
} from './fieldMappings';

describe('Field Mappings', () => {
  describe('toApiGender', () => {
    it('should map Male to Male', () => {
      expect(toApiGender('Male')).toBe('Male');
    });

    it('should map Female to Female', () => {
      expect(toApiGender('Female')).toBe('Female');
    });

    it('should return original value for unknown input', () => {
      expect(toApiGender('Unknown')).toBe('Unknown');
    });
  });

  describe('toApiOccupation', () => {
    it('should map Employed to Employed', () => {
      expect(toApiOccupation('Employed')).toBe('Employed');
    });

    it('should map Freelancer to Self-employed', () => {
      expect(toApiOccupation('Freelancer')).toBe('Self-employed');
    });

    it('should map Retired to Unemployed', () => {
      expect(toApiOccupation('Retired')).toBe('Unemployed');
    });

    it('should map Student to Student', () => {
      expect(toApiOccupation('Student')).toBe('Student');
    });

    it('should return original value for unknown input', () => {
      expect(toApiOccupation('Unknown')).toBe('Unknown');
    });
  });

  describe('toApiWorkMode', () => {
    it('should map Remote to Remote', () => {
      expect(toApiWorkMode('Remote')).toBe('Remote');
    });

    it('should map Hybrid to Hybrid', () => {
      expect(toApiWorkMode('Hybrid')).toBe('Hybrid');
    });

    it('should map On-site to In-person', () => {
      expect(toApiWorkMode('On-site')).toBe('In-person');
    });

    it('should map Unemployed to Unemployed', () => {
      expect(toApiWorkMode('Unemployed')).toBe('Unemployed');
    });

    it('should return original value for unknown input', () => {
      expect(toApiWorkMode('Unknown')).toBe('Unknown');
    });
  });

  describe('fromApiGender', () => {
    it('should map Male to Male', () => {
      expect(fromApiGender('Male')).toBe('Male');
    });

    it('should map Female to Female', () => {
      expect(fromApiGender('Female')).toBe('Female');
    });

    it('should return original value for unknown input', () => {
      expect(fromApiGender('Unknown')).toBe('Unknown');
    });
  });

  describe('fromApiOccupation', () => {
    it('should map Employed to Employed', () => {
      expect(fromApiOccupation('Employed')).toBe('Employed');
    });

    it('should map Self-employed to Freelancer', () => {
      expect(fromApiOccupation('Self-employed')).toBe('Freelancer');
    });

    it('should map Unemployed to Unemployed (first match)', () => {
      expect(fromApiOccupation('Unemployed')).toBe('Unemployed');
    });

    it('should map Student to Student', () => {
      expect(fromApiOccupation('Student')).toBe('Student');
    });

    it('should return original value for unknown input', () => {
      expect(fromApiOccupation('Unknown')).toBe('Unknown');
    });
  });

  describe('fromApiWorkMode', () => {
    it('should map Remote to Remote', () => {
      expect(fromApiWorkMode('Remote')).toBe('Remote');
    });

    it('should map Hybrid to Hybrid', () => {
      expect(fromApiWorkMode('Hybrid')).toBe('Hybrid');
    });

    it('should map In-person to On-site', () => {
      expect(fromApiWorkMode('In-person')).toBe('On-site');
    });

    it('should map Unemployed to Unemployed', () => {
      expect(fromApiWorkMode('Unemployed')).toBe('Unemployed');
    });

    it('should return original value for unknown input', () => {
      expect(fromApiWorkMode('Unknown')).toBe('Unknown');
    });
  });

  describe('Options Arrays', () => {
    describe('genderOptions', () => {
      it('should have correct structure', () => {
        expect(genderOptions).toEqual([
          { value: 'Male', label: 'Male' },
          { value: 'Female', label: 'Female' },
        ]);
      });

      it('should only include Male and Female', () => {
        expect(genderOptions).toHaveLength(2);
      });
    });

    describe('occupationOptions', () => {
      it('should include all occupation types', () => {
        const values = occupationOptions.map((opt) => opt.value);
        expect(values).toContain('Employed');
        expect(values).toContain('Unemployed');
        expect(values).toContain('Student');
        expect(values).toContain('Freelancer');
        expect(values).toContain('Retired');
        expect(values).toContain('Other');
      });

      it('should have correct structure', () => {
        occupationOptions.forEach((option) => {
          expect(option).toHaveProperty('value');
          expect(option).toHaveProperty('label');
          expect(option.value).toBe(option.label);
        });
      });
    });

    describe('workModeOptions', () => {
      it('should include all work mode types', () => {
        const values = workModeOptions.map((opt) => opt.value);
        expect(values).toContain('Remote');
        expect(values).toContain('Hybrid');
        expect(values).toContain('On-site');
        expect(values).toContain('Unemployed');
      });

      it('should have correct structure', () => {
        workModeOptions.forEach((option) => {
          expect(option).toHaveProperty('value');
          expect(option).toHaveProperty('label');
          expect(option.value).toBe(option.label);
        });
      });
    });
  });

  describe('Bidirectional Mapping', () => {
    it('should correctly map Freelancer to API and back', () => {
      const apiValue = toApiOccupation('Freelancer');
      expect(apiValue).toBe('Self-employed');
      const displayValue = fromApiOccupation(apiValue);
      expect(displayValue).toBe('Freelancer');
    });

    it('should correctly map On-site to API and back', () => {
      const apiValue = toApiWorkMode('On-site');
      expect(apiValue).toBe('In-person');
      const displayValue = fromApiWorkMode(apiValue);
      expect(displayValue).toBe('On-site');
    });

    it('should handle many-to-one mapping (Retired -> Unemployed)', () => {
      const apiValue = toApiOccupation('Retired');
      expect(apiValue).toBe('Unemployed');
      // When mapping back, should get the first occurrence (Unemployed, not Retired)
      const displayValue = fromApiOccupation(apiValue);
      expect(displayValue).toBe('Unemployed');
    });
  });
});
