import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Screening from './Screening';
import * as servicesModule from '@/services';

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

// Mock auth with mutable user
let mockUser = null;
vi.mock('@/features/auth', () => ({
  useAuth: () => ({ user: mockUser }),
}));

// Mock services
vi.mock('@/services', () => ({
  submitScreening: vi.fn(),
}));

// Mock @/components
vi.mock('@/components', () => ({
  Card: ({ children }) => <div data-testid="card">{children}</div>,
  Button: ({ children, onClick, disabled, href, ...rest }) => (
    <button onClick={onClick} disabled={disabled} data-href={href} {...rest}>
      {children}
    </button>
  ),
  TextField: ({ value, onChange, placeholder, disabled, type, error }) => (
    <input
      type={type || 'text'}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      data-error={error ? 'true' : undefined}
    />
  ),
  StageContainer: ({ stages, currentStage }) => (
    <div data-testid="stage-container">{stages[currentStage]}</div>
  ),
  FormSection: ({ children }) => <div>{children}</div>,
  Message: ({ type, children }) => (
    <div data-testid="message" data-type={type}>
      {children}
    </div>
  ),
}));

// Mock screening-local components
vi.mock('../components/MultipleChoice', () => ({
  default: ({ options, value, onChange, disabled }) => (
    <div data-testid="multiple-choice">
      {options?.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange?.(opt)}
          disabled={disabled}
          data-selected={value === opt ? 'true' : undefined}
        >
          {opt}
        </button>
      ))}
    </div>
  ),
}));

vi.mock('../components/Slider', () => ({
  default: ({
    min,
    max,
    step,
    value,
    onChange,
    minLabel,
    maxLabel,
    disabled,
  }) => (
    <div data-testid="slider">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange?.(parseFloat(e.target.value))}
        disabled={disabled}
        aria-label="slider"
      />
      {minLabel && <span>{minLabel}</span>}
      {maxLabel && <span>{maxLabel}</span>}
    </div>
  ),
}));

vi.mock('../components/QuestionLayout', () => ({
  default: ({ question, children }) => (
    <div data-testid="question-layout">
      <h2>{question}</h2>
      {children}
    </div>
  ),
}));

vi.mock('../components/ProgressBar', () => ({
  default: ({ progress }) => (
    <div
      data-testid="progress-bar"
      data-progress={progress}
      style={{ width: `${progress}%` }}
    />
  ),
}));

// Mock FontAwesome
vi.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: () => <span data-testid="icon" />,
}));

vi.mock('@fortawesome/free-solid-svg-icons', () => ({
  faChevronLeft: 'left',
  faChevronRight: 'right',
}));

// Mock logo
vi.mock('@/assets/logo-primary.svg', () => ({
  default: 'logo.svg',
}));

describe('Screening Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null; // Reset to unauthenticated
  });

  describe('Initial Rendering (Unauthenticated)', () => {
    it('should render the first question for unauthenticated user', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      expect(screen.getByText('How old are you?')).toBeTruthy();
      expect(screen.getByPlaceholderText('e.g. 25')).toBeTruthy();
    });

    it('should show Next button', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      expect(screen.getByText('Next')).toBeTruthy();
    });

    it('should not show Back button on first question', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      expect(screen.queryByText('Back')).toBeNull();
    });

    it('should render progress bar', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      expect(screen.getByTestId('progress-bar')).toBeTruthy();
    });

    it('should render Back to Home button', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      expect(screen.getByText('Back to Home')).toBeTruthy();
    });
  });

  describe('Initial Rendering (Authenticated)', () => {
    it('should skip demographic questions for authenticated user', async () => {
      mockUser = {
        userId: 'test-123',
        gender: 'Male',
        occupation: 'Employed',
        workRmt: 'Remote',
        dob: '1990-01-01',
      };

      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Should skip age, gender, occupation, work_mode — first question is work_screen_hours
      await waitFor(() => {
        expect(
          screen.getByText('How many hours of screen time for work today?')
        ).toBeTruthy();
      });

      expect(screen.queryByText('How old are you?')).toBeNull();
    });
  });

  describe('Input Validation', () => {
    it('should disable Next when no answer and enable after input', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const nextButton = screen.getByText('Next');
      expect(nextButton.disabled).toBe(true);

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '25' } });

      await waitFor(() => {
        expect(screen.getByText('Next').disabled).toBe(false);
      });
    });

    it('should show error when number is below minimum', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '10' } });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Minimum value is 16')).toBeTruthy();
      });
    });

    it('should show error when number is above maximum', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '150' } });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Maximum value is 100')).toBeTruthy();
      });
    });

    it('should clear error when input changes to valid value', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Enter invalid value (below minimum)
      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '10' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Minimum value is 16')).toBeTruthy();
      });

      // Change to valid value - error should clear
      fireEvent.change(input, { target: { value: '25' } });

      await waitFor(() => {
        expect(screen.queryByText('Minimum value is 16')).toBeNull();
      });
    });
  });

  describe('Navigation Between Questions', () => {
    it('should move to next question with valid input', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('What is your gender?')).toBeTruthy();
      });
    });

    it('should show Back button after first question', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Back')).toBeTruthy();
      });
    });

    it('should go back to previous question', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('What is your gender?')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Back'));

      await waitFor(() => {
        expect(screen.getByText('How old are you?')).toBeTruthy();
      });
    });

    it('should preserve answers when navigating back', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '30' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('What is your gender?')).toBeTruthy();
      });

      fireEvent.click(screen.getByText('Back'));

      await waitFor(() => {
        const ageInput = screen.getByPlaceholderText('e.g. 25');
        expect(ageInput.value).toBe('30');
      });
    });

    it('should render multiple choice for gender question', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByTestId('multiple-choice')).toBeTruthy();
        expect(screen.getByText('Male')).toBeTruthy();
        expect(screen.getByText('Female')).toBeTruthy();
      });
    });

    it('should handle multiple choice selection', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Go to gender question
      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Male')).toBeTruthy();
      });

      // Select Male
      fireEvent.click(screen.getByText('Male'));
      fireEvent.click(screen.getByText('Next'));

      // Should move to occupation
      await waitFor(() => {
        expect(
          screen.getByText('What is your current employment status?')
        ).toBeTruthy();
      });
    });
  });

  describe('Question Skipping Logic', () => {
    it('should skip work_mode and work_screen_hours when Unemployed', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Age
      fireEvent.change(screen.getByPlaceholderText('e.g. 25'), {
        target: { value: '25' },
      });
      fireEvent.click(screen.getByText('Next'));

      // Gender
      await waitFor(() => {
        fireEvent.click(screen.getByText('Male'));
      });
      fireEvent.click(screen.getByText('Next'));

      // Occupation - select Unemployed
      await waitFor(() => {
        fireEvent.click(screen.getByText('Unemployed'));
      });
      fireEvent.click(screen.getByText('Next'));

      // Should skip work_mode and work_screen_hours, land on leisure_screen_hours
      await waitFor(() => {
        expect(
          screen.getByText('How many hours of screen time for leisure today?')
        ).toBeTruthy();
      });
    });

    it('should not skip work_mode for Employed', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Age
      fireEvent.change(screen.getByPlaceholderText('e.g. 25'), {
        target: { value: '30' },
      });
      fireEvent.click(screen.getByText('Next'));

      // Gender
      await waitFor(() => {
        fireEvent.click(screen.getByText('Male'));
      });
      fireEvent.click(screen.getByText('Next'));

      // Occupation - select Employed
      await waitFor(() => {
        fireEvent.click(screen.getByText('Employed'));
      });
      fireEvent.click(screen.getByText('Next'));

      // Should show work_mode question
      await waitFor(() => {
        expect(screen.getByText('What is your work mode?')).toBeTruthy();
      });
    });
  });

  describe('Form Submission', () => {
    const fillAuthenticatedForm = async () => {
      mockUser = {
        userId: 'test-123',
        gender: 'Male',
        occupation: 'Employed',
        workRmt: 'Remote',
        dob: '1990-01-01',
      };

      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Wait for authenticated user's first question
      await waitFor(() => {
        expect(
          screen.getByText('How many hours of screen time for work today?')
        ).toBeTruthy();
      });

      // work_screen_hours
      fireEvent.change(screen.getByPlaceholderText('e.g. 6'), {
        target: { value: '8' },
      });
      fireEvent.click(screen.getByText('Next'));

      // leisure_screen_hours
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('e.g. 2'), {
          target: { value: '2' },
        });
      });
      fireEvent.click(screen.getByText('Next'));

      // sleep_hours
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('e.g. 7'), {
          target: { value: '7' },
        });
      });
      fireEvent.click(screen.getByText('Next'));

      // sleep_quality (slider) - need to interact
      await waitFor(() => {
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '4' } });
      });
      fireEvent.click(screen.getByText('Next'));

      // stress_level (slider)
      await waitFor(() => {
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '5' } });
      });
      fireEvent.click(screen.getByText('Next'));

      // productivity (slider)
      await waitFor(() => {
        const slider = screen.getByRole('slider');
        fireEvent.change(slider, { target: { value: '75' } });
      });
      fireEvent.click(screen.getByText('Next'));

      // exercise_minutes
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('e.g. 150'), {
          target: { value: '150' },
        });
      });
      fireEvent.click(screen.getByText('Next'));

      // social_hours — last question should show Finish
      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText('e.g. 10'), {
          target: { value: '10' },
        });
      });
    };

    it('should show Finish button on last question', async () => {
      await fillAuthenticatedForm();

      expect(screen.getByText('Finish')).toBeTruthy();
    }, 15000);

    it('should submit and navigate on success', async () => {
      servicesModule.submitScreening.mockResolvedValue({
        prediction_id: 'pred-123',
      });

      await fillAuthenticatedForm();

      fireEvent.click(screen.getByText('Finish'));

      await waitFor(
        () => {
          expect(servicesModule.submitScreening).toHaveBeenCalled();
          expect(mockNavigate).toHaveBeenCalledWith('/result/pred-123');
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should show Submitting... during submission', async () => {
      servicesModule.submitScreening.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ prediction_id: 'pred-123' }), 200)
          )
      );

      await fillAuthenticatedForm();

      fireEvent.click(screen.getByText('Finish'));

      await waitFor(() => {
        expect(screen.getByText('Submitting...')).toBeTruthy();
      });
    }, 15000);

    it('should show error on submission failure', async () => {
      servicesModule.submitScreening.mockRejectedValue(
        new Error('Network error')
      );

      await fillAuthenticatedForm();

      fireEvent.click(screen.getByText('Finish'));

      await waitFor(
        () => {
          expect(
            screen.getByText('An error occurred: Network error')
          ).toBeTruthy();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should include user_id in payload for authenticated user', async () => {
      servicesModule.submitScreening.mockResolvedValue({
        prediction_id: 'pred-123',
      });

      await fillAuthenticatedForm();

      fireEvent.click(screen.getByText('Finish'));

      await waitFor(
        () => {
          expect(servicesModule.submitScreening).toHaveBeenCalled();
          const payload = servicesModule.submitScreening.mock.calls[0][0];
          expect(payload.user_id).toBe('test-123');
        },
        { timeout: 10000 }
      );
    }, 15000);
  });

  describe('Slider Questions', () => {
    it('should render slider for sleep quality question', async () => {
      mockUser = {
        userId: 'test-123',
        gender: 'Male',
        occupation: 'Employed',
        workRmt: 'Remote',
        dob: '1990-01-01',
      };

      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // work_screen_hours
      await waitFor(() => {
        expect(screen.getByPlaceholderText('e.g. 6')).toBeTruthy();
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. 6'), {
        target: { value: '8' },
      });
      fireEvent.click(screen.getByText('Next'));

      // leisure_screen_hours
      await waitFor(() => {
        expect(screen.getByPlaceholderText('e.g. 2')).toBeTruthy();
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. 2'), {
        target: { value: '2' },
      });
      fireEvent.click(screen.getByText('Next'));

      // sleep_hours
      await waitFor(() => {
        expect(screen.getByPlaceholderText('e.g. 7')).toBeTruthy();
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. 7'), {
        target: { value: '7' },
      });
      fireEvent.click(screen.getByText('Next'));

      // Should be on sleep quality slider
      await waitFor(() => {
        expect(screen.getByText('How was your sleep quality?')).toBeTruthy();
        expect(screen.getByTestId('slider')).toBeTruthy();
        expect(screen.getByText('Poor')).toBeTruthy();
        expect(screen.getByText('Excellent')).toBeTruthy();
      });
    });
  });

  describe('Progress Bar', () => {
    it('should update progress as user advances', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const progressBar = screen.getByTestId('progress-bar');
      const initialProgress = progressBar.getAttribute('data-progress');

      // Move to next question
      fireEvent.change(screen.getByPlaceholderText('e.g. 25'), {
        target: { value: '25' },
      });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        const newProgress = progressBar.getAttribute('data-progress');
        expect(parseFloat(newProgress)).toBeGreaterThan(
          parseFloat(initialProgress)
        );
      });
    });
  });

  describe('Edge Cases', () => {
    it('should not allow going back from first question', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      expect(screen.queryByText('Back')).toBeNull();
    });

    it('should show boundary validation for extreme values', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('e.g. 25');
      fireEvent.change(input, { target: { value: '999' } });

      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('Maximum value is 100')).toBeTruthy();
      });
    });

    it('should disable Next button when no answer provided', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const nextButton = screen.getByText('Next');
      expect(nextButton.disabled).toBe(true);
    });
  });
});
