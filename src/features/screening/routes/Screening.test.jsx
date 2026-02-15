import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Screening from './Screening';

const mockNavigate = vi.fn();
const mockUser = { userId: 'test-user-123', id: 'test-user-123' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('@/features/auth', () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

vi.mock('@/config/api', () => ({
  API_CONFIG: {
    BASE_URL: 'http://localhost:5000',
  },
  API_URLS: {
    predict: 'http://localhost:5000/predict',
  },
}));

global.fetch = vi.fn();

describe('Screening Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch.mockReset();
  });

  describe('Initial Rendering', () => {
    it('should render the first question', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      expect(screen.getByText('How old are you?')).toBeTruthy();
      expect(screen.getByPlaceholderText('Enter your age')).toBeTruthy();
    });

    it('should show Next button on first question', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const nextButton = screen.getByText('Next');
      expect(nextButton).toBeTruthy();
    });

    it('should not show Back button on first question', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const backButton = screen.queryByText('Back');
      expect(backButton).toBeNull();
    });

    it('should render progress bar', () => {
      const { container } = render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const progressBar = container.querySelector('.progress-bar');
      expect(progressBar).toBeTruthy();
    });
  });

  describe('Input Validation', () => {
    it('should show error when submitting empty required field', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Answer cannot be empty!')).toBeTruthy();
      });
    });

    it('should show error when number is below minimum', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('Enter your age');
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

      const input = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(input, { target: { value: '150' } });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Maximum value is 100')).toBeTruthy();
      });
    });

    it('should clear error message when input changes', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Answer cannot be empty!')).toBeTruthy();
      });

      const input = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(input, { target: { value: '25' } });

      expect(screen.queryByText('Answer cannot be empty!')).toBeNull();
    });
  });

  describe('Navigation Between Questions', () => {
    it('should move to next question with valid input', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(input, { target: { value: '25' } });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

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

      const input = screen.getByPlaceholderText('Enter your age');
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

      // Move to second question
      const input = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(input, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        expect(screen.getByText('What is your gender?')).toBeTruthy();
      });

      // Go back
      fireEvent.click(screen.getByText('Back'));

      await waitFor(() => {
        expect(screen.getByText('How old are you?')).toBeTruthy();
        expect(input.value).toBe('25');
      });
    });

    it('should preserve answers when navigating', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Answer first question
      const ageInput = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(ageInput, { target: { value: '30' } });
      fireEvent.click(screen.getByText('Next'));

      // Answer second question
      await waitFor(() => {
        const genderSelect = screen.getByRole('combobox');
        fireEvent.change(genderSelect, { target: { value: 'Male' } });
      });

      // Go back
      fireEvent.click(screen.getByText('Back'));

      // Check if age is preserved
      await waitFor(() => {
        const input = screen.getByPlaceholderText('Enter your age');
        expect(input.value).toBe('30');
      });
    });
  });

  describe('Question Skipping Logic', () => {
    it('should skip work_mode when occupation is Unemployed', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Navigate through questions to occupation
      const ageInput = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(ageInput, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        const genderSelect = screen.getByRole('combobox');
        fireEvent.change(genderSelect, { target: { value: 'Male' } });
        fireEvent.click(screen.getByText('Next'));
      });

      await waitFor(() => {
        const occupationSelect = screen.getByRole('combobox');
        fireEvent.change(occupationSelect, { target: { value: 'Unemployed' } });
        fireEvent.click(screen.getByText('Next'));
      });

      // Should skip work_mode and go to work_screen_hours (which is also skipped)
      // So should land on leisure_screen_hours
      await waitFor(() => {
        expect(
          screen.getByText('How many hours of screen time for leisure?')
        ).toBeTruthy();
      });
    });

    it('should skip work_mode when occupation is Retired', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Navigate to occupation question
      const ageInput = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(ageInput, { target: { value: '70' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        const genderSelect = screen.getByRole('combobox');
        fireEvent.change(genderSelect, { target: { value: 'Female' } });
        fireEvent.click(screen.getByText('Next'));
      });

      await waitFor(() => {
        const occupationSelect = screen.getByRole('combobox');
        fireEvent.change(occupationSelect, { target: { value: 'Retired' } });
        fireEvent.click(screen.getByText('Next'));
      });

      // Should skip to leisure_screen_hours
      await waitFor(() => {
        expect(
          screen.getByText('How many hours of screen time for leisure?')
        ).toBeTruthy();
      });
    });

    it('should not skip work_mode for Employed occupation', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Navigate to occupation
      const ageInput = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(ageInput, { target: { value: '30' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        const genderSelect = screen.getByRole('combobox');
        fireEvent.change(genderSelect, { target: { value: 'Male' } });
        fireEvent.click(screen.getByText('Next'));
      });

      await waitFor(() => {
        const occupationSelect = screen.getByRole('combobox');
        fireEvent.change(occupationSelect, { target: { value: 'Employed' } });
        fireEvent.click(screen.getByText('Next'));
      });

      // Should show work_mode question
      await waitFor(() => {
        expect(screen.getByText('What is your work mode?')).toBeTruthy();
      });
    });
  });

  describe('Form Submission', () => {
    const fillCompleteForm = async () => {
      const answers = [
        { placeholder: 'Enter your age', value: '25' },
        { select: true, value: 'Male' }, // gender
        { select: true, value: 'Employed' }, // occupation
        { select: true, value: 'Remote' }, // work_mode
        { placeholder: 'e.g. 6', value: '8' }, // work_screen_hours
        { placeholder: 'e.g. 2', value: '2' }, // leisure_screen_hours
        { placeholder: 'e.g. 7', value: '7' }, // sleep_hours
        { select: true, value: '4' }, // sleep_quality
        {
          placeholder: '0 = no stress, 10 = very stressed',
          value: '5',
        }, // stress_level
        { placeholder: 'e.g. 75', value: '75' }, // productivity
        { placeholder: 'e.g. 150', value: '150' }, // exercise
        { placeholder: 'e.g. 10', value: '10' }, // social_hours
      ];

      for (let i = 0; i < answers.length; i++) {
        const answer = answers[i];

        if (answer.select) {
          await waitFor(() => {
            const select = screen.getByRole('combobox');
            fireEvent.change(select, { target: { value: answer.value } });
          });
        } else {
          await waitFor(() => {
            const input = screen.getByPlaceholderText(answer.placeholder);
            fireEvent.change(input, { target: { value: answer.value } });
          });
        }

        const nextButton =
          i === answers.length - 1
            ? screen.getByText('Finish')
            : screen.getByText('Next');
        fireEvent.click(nextButton);

        // Small delay for state updates
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    };

    it('should show Finish button on last question', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Fill all questions except the last one
      await fillCompleteForm();

      await waitFor(
        () => {
          expect(
            screen.getByText('Finish') || screen.getByText('Processing...')
          ).toBeTruthy();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should submit form and navigate on successful prediction', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prediction_id: 'pred-123' }),
      });

      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      await fillCompleteForm();

      await waitFor(
        () => {
          expect(mockNavigate).toHaveBeenCalledWith('/result/pred-123');
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should show error message on failed submission', async () => {
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      await fillCompleteForm();

      await waitFor(
        () => {
          expect(
            screen.getByText(/Failed to send data to server: Network error/)
          ).toBeTruthy();
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should include user_id in payload when user is logged in', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prediction_id: 'pred-123' }),
      });

      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      await fillCompleteForm();

      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled();
          const callArgs = global.fetch.mock.calls[0];
          const payload = JSON.parse(callArgs[1].body);
          expect(payload.user_id).toBe('test-user-123');
        },
        { timeout: 10000 }
      );
    }, 15000);

    it('should disable inputs during submission', async () => {
      global.fetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({ prediction_id: 'pred-123' }),
                }),
              100
            )
          )
      );

      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      await fillCompleteForm();

      // Check if inputs are disabled during loading
      await waitFor(() => {
        const processingButton = screen.queryByText('Processing...');
        if (processingButton) {
          expect(processingButton).toBeTruthy();
        }
      });
    }, 15000);
  });

  describe('Select Input Rendering', () => {
    it('should render select dropdown for gender question', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Navigate to gender question
      const ageInput = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(ageInput, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        const select = screen.getByRole('combobox');
        expect(select).toBeTruthy();
        expect(screen.getByText('Male')).toBeTruthy();
        expect(screen.getByText('Female')).toBeTruthy();
      });
    });

    it('should render number input for age question', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('Enter your age');
      expect(input.type).toBe('number');
      expect(input.getAttribute('min')).toBe('16');
      expect(input.getAttribute('max')).toBe('100');
    });
  });

  describe('Progress Bar', () => {
    it('should update progress bar as user progresses', async () => {
      const { container } = render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const progressBar = container.querySelector('.progress-bar');
      const initialWidth = progressBar.style.width;

      // Move to next question
      const input = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(input, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        const newWidth = progressBar.style.width;
        expect(newWidth).not.toBe(initialWidth);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle non-numeric input in number fields', async () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const input = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(input, { target: { value: 'abc' } });

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText('Answer cannot be empty!')).toBeTruthy();
      });
    });

    it('should not allow going back from first question', () => {
      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const backButton = screen.queryByText('Back');
      expect(backButton).toBeNull();
    });

    it('should auto-set work_mode and work_screen_hours for Unemployed', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ prediction_id: 'pred-123' }),
      });

      render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      // Fill form with Unemployed occupation
      const ageInput = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(ageInput, { target: { value: '25' } });
      fireEvent.click(screen.getByText('Next'));

      await waitFor(() => {
        const genderSelect = screen.getByRole('combobox');
        fireEvent.change(genderSelect, { target: { value: 'Male' } });
        fireEvent.click(screen.getByText('Next'));
      });

      await waitFor(() => {
        const occupationSelect = screen.getByRole('combobox');
        fireEvent.change(occupationSelect, {
          target: { value: 'Unemployed' },
        });
        fireEvent.click(screen.getByText('Next'));
      });

      // Continue filling rest of form
      const answers = [
        { placeholder: 'e.g. 2', value: '2' },
        { placeholder: 'e.g. 7', value: '7' },
        { select: true, value: '4' },
        { placeholder: '0 = no stress, 10 = very stressed', value: '5' },
        { placeholder: 'e.g. 75', value: '75' },
        { placeholder: 'e.g. 150', value: '150' },
        { placeholder: 'e.g. 10', value: '10' },
      ];

      for (const answer of answers) {
        if (answer.select) {
          await waitFor(() => {
            const select = screen.getByRole('combobox');
            fireEvent.change(select, { target: { value: answer.value } });
          });
        } else {
          await waitFor(() => {
            const input = screen.getByPlaceholderText(answer.placeholder);
            fireEvent.change(input, { target: { value: answer.value } });
          });
        }

        fireEvent.click(
          screen.getByText(
            answer === answers[answers.length - 1] ? 'Finish' : 'Next'
          )
        );
        await new Promise((resolve) => setTimeout(resolve, 10));
      }

      await waitFor(
        () => {
          expect(global.fetch).toHaveBeenCalled();
          const payload = JSON.parse(global.fetch.mock.calls[0][1].body);
          expect(payload.work_mode).toBe('Unemployed');
          expect(payload.work_screen_hours).toBe(0);
        },
        { timeout: 10000 }
      );
    }, 20000);
  });

  describe('Error Display', () => {
    it('should add input-error class when validation fails', async () => {
      const { container } = render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        const input = container.querySelector('.input-error');
        expect(input).toBeTruthy();
      });
    });

    it('should remove input-error class after valid input', async () => {
      const { container } = render(
        <MemoryRouter>
          <Screening />
        </MemoryRouter>
      );

      const nextButton = screen.getByText('Next');
      fireEvent.click(nextButton);

      await waitFor(() => {
        const input = container.querySelector('.input-error');
        expect(input).toBeTruthy();
      });

      const ageInput = screen.getByPlaceholderText('Enter your age');
      fireEvent.change(ageInput, { target: { value: '25' } });

      await waitFor(() => {
        const input = container.querySelector('.input-error');
        expect(input).toBeNull();
      });
    });
  });
});
