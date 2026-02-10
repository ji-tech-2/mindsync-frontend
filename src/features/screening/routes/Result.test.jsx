import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import Result from './Result';
import { AuthProvider } from '../../auth';
import * as pollingHelper from '../api/pollingHelper';

// Mock the API config
vi.mock('../../../config/api.js', () => ({
  API_CONFIG: {
    BASE_URL: 'http://test-api.com',
    RESULT_ENDPOINT: '/v0-1/result',
    POLLING: {
      MAX_ATTEMPTS: 60,
      INTERVAL_MS: 2000,
    },
  },
}));

// Mock the pollingHelper module
vi.mock('../api/pollingHelper', () => ({
  pollPredictionResult: vi.fn(),
}));

// Mock the useAuth hook with configurable auth state
let mockIsAuthenticated = true;
vi.mock('../../auth', () => {
  const mockUseAuth = () => ({
    user: mockIsAuthenticated ? { email: 'test@example.com' } : null,
    isLoading: false,
  });
  return {
    useAuth: mockUseAuth,
    AuthProvider: ({ children }) => children,
  };
});

// Mock the Advice component
vi.mock('../../../components', () => ({
  Advice: ({ adviceData, isLoading }) => (
    <div data-testid="advice-component">
      <div data-testid="advice-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="advice-data">
        {adviceData ? 'has-advice' : 'no-advice'}
      </div>
    </div>
  ),
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Helper to render Result with predictionId
const renderResult = (predictionId = 'test-123') => {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[`/result/${predictionId}`]}>
        <Routes>
          <Route path="/result/:predictionId" element={<Result />} />
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
};

describe('Result Component - Partial Polling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('Partial Status Handling', () => {
    it('should show results immediately when partial status received', async () => {
      const mockPartialResult = {
        success: true,
        status: 'partial',
        data: {
          prediction_score: 75.5,
          health_level: 'average',
          wellness_analysis: 'Your mental wellness is average',
        },
        metadata: {
          created_at: '2026-01-21T10:00:00Z',
        },
      };

      // Mock for first call (partial result)
      pollingHelper.pollPredictionResult.mockResolvedValueOnce(
        mockPartialResult
      );

      // Mock for second call in pollForAdvice (continue polling in background)
      pollingHelper.pollPredictionResult.mockResolvedValueOnce({
        success: true,
        status: 'processing',
        data: null,
      });

      renderResult('test-123');

      // Should show loading initially
      expect(screen.getByText(/Analyzing Your Data/i)).toBeInTheDocument();

      // Wait for partial result to load
      await waitFor(() => {
        expect(screen.getByText('75.5')).toBeInTheDocument();
      });

      // Should show score and category
      expect(screen.getByText('Average')).toBeInTheDocument();

      // Advice should be in loading state
      await waitFor(() => {
        expect(screen.getByTestId('advice-loading')).toHaveTextContent('true');
        expect(screen.getByTestId('advice-data')).toHaveTextContent(
          'no-advice'
        );
      });
    });

    it('should continue polling for advice after partial result', async () => {
      const mockPartialResult = {
        success: true,
        status: 'partial',
        data: {
          prediction_score: 80.0,
          health_level: 'healthy',
          wellness_analysis: 'Good mental health',
        },
        metadata: {
          created_at: '2026-01-21T10:00:00Z',
        },
      };

      const mockReadyResult = {
        success: true,
        status: 'ready',
        data: {
          prediction_score: 80.0,
          health_level: 'healthy',
          wellness_analysis: 'Good mental health',
          advice: {
            description: 'Keep up the good work',
            factors: {
              sleep: { recommendation: 'Maintain sleep schedule' },
            },
          },
        },
        metadata: {
          created_at: '2026-01-21T10:00:00Z',
          completed_at: '2026-01-21T10:01:00Z',
        },
      };

      // First call returns partial
      pollingHelper.pollPredictionResult
        .mockResolvedValueOnce(mockPartialResult)
        .mockResolvedValueOnce(mockReadyResult);

      renderResult('test-123');

      // Wait for score to be displayed
      await waitFor(() => {
        expect(screen.getByText('80.0')).toBeInTheDocument();
      });

      // Eventually advice should load and be displayed
      await waitFor(
        () => {
          expect(screen.getByTestId('advice-data')).toHaveTextContent(
            'has-advice'
          );
        },
        { timeout: 5000 }
      );

      // Should have called pollPredictionResult twice (initial + continue polling)
      expect(pollingHelper.pollPredictionResult).toHaveBeenCalledTimes(2);
    });
  });

  describe('Ready Status Handling', () => {
    it('should show full results with advice when ready status received', async () => {
      const mockReadyResult = {
        success: true,
        status: 'ready',
        data: {
          prediction_score: 85.0,
          health_level: 'healthy',
          wellness_analysis: 'Excellent mental health',
          advice: {
            description: 'You are doing great',
            factors: {
              exercise: { recommendation: 'Keep exercising regularly' },
            },
          },
        },
        metadata: {
          created_at: '2026-01-21T10:00:00Z',
          completed_at: '2026-01-21T10:01:00Z',
        },
      };

      pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockReadyResult);

      renderResult('test-123');

      // Wait for results to load
      await waitFor(() => {
        expect(screen.getByText('85.0')).toBeInTheDocument();
      });

      // Should show full results with advice
      expect(screen.getByText('Healthy')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByTestId('advice-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('advice-data')).toHaveTextContent(
          'has-advice'
        );
      });

      // Should only call pollPredictionResult once
      expect(pollingHelper.pollPredictionResult).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while polling', async () => {
      pollingHelper.pollPredictionResult.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 5000))
      );

      const { container } = renderResult('test-123');

      // Should show loading UI
      expect(screen.getByText(/Analyzing Your Data/i)).toBeInTheDocument();
      expect(screen.getByText(/Please wait a moment/i)).toBeInTheDocument();

      // Check for loading spinner using container query
      const loadingSpinner = container.querySelector('.loading-spinner');
      expect(loadingSpinner).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when polling fails', async () => {
      pollingHelper.pollPredictionResult.mockRejectedValueOnce(
        new Error('Network error occurred')
      );

      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByText(/An Error Occurred/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument();
      });

      // Should show retry buttons
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('should redirect to screening when no predictionId', async () => {
      // Mock window.alert
      const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

      render(
        <MemoryRouter initialEntries={['/result/']}>
          <Routes>
            <Route path="/result/:predictionId?" element={<Result />} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(alertMock).toHaveBeenCalledWith(
          'Data not found. Please take the screening again.'
        );
        expect(mockNavigate).toHaveBeenCalledWith('/screening');
      });

      alertMock.mockRestore();
    });
  });

  describe('Category Display', () => {
    it('should display correct category labels and colors', async () => {
      const testCases = [
        { category: 'dangerous', label: 'Dangerous', color: '#FF4757' },
        { category: 'not healthy', label: 'Not Healthy', color: '#FFA502' },
        { category: 'average', label: 'Average', color: '#FFD93D' },
        { category: 'healthy', label: 'Healthy', color: '#6BCB77' },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();
        // Clear cached results from previous iterations to prevent stale localStorage reads
        localStorage.clear();

        const mockResult = {
          success: true,
          status: 'ready',
          data: {
            prediction_score: 70.0,
            health_level: testCase.category,
            wellness_analysis: 'Test analysis',
            advice: { description: 'Test advice', factors: {} },
          },
          metadata: {
            created_at: '2026-01-21T10:00:00Z',
            completed_at: '2026-01-21T10:01:00Z',
          },
        };

        pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

        const { unmount } = renderResult('test-123');

        await waitFor(() => {
          expect(screen.getByText(testCase.label)).toBeInTheDocument();
        });

        // Check if the category badge has the correct background color
        const categoryBadge = screen.getByText(testCase.label);
        expect(categoryBadge).toHaveStyle({ backgroundColor: testCase.color });

        unmount();
      }
    });
  });

  describe('Navigation', () => {
    it('should navigate to screening when "Retake Test" clicked', async () => {
      const mockResult = {
        success: true,
        status: 'ready',
        data: {
          prediction_score: 75.0,
          health_level: 'average',
          wellness_analysis: 'Test',
          advice: { description: 'Advice', factors: {} },
        },
        metadata: {
          created_at: '2026-01-21T10:00:00Z',
          completed_at: '2026-01-21T10:01:00Z',
        },
      };

      pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByText('75.0')).toBeInTheDocument();
      });

      const retakeButton = screen.getByText('Retake Test');
      retakeButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('/screening');
    });

    it('should navigate to home when "Back to Home" clicked', async () => {
      const mockResult = {
        success: true,
        status: 'ready',
        data: {
          prediction_score: 75.0,
          health_level: 'average',
          wellness_analysis: 'Test',
          advice: { description: 'Advice', factors: {} },
        },
        metadata: {
          created_at: '2026-01-21T10:00:00Z',
          completed_at: '2026-01-21T10:01:00Z',
        },
      };

      pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByText('75.0')).toBeInTheDocument();
      });

      const homeButton = screen.getByText('Back to Home');
      homeButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Score Display', () => {
    it('should format score to 1 decimal place', async () => {
      const mockResult = {
        success: true,
        status: 'ready',
        data: {
          prediction_score: 82.456789,
          health_level: 'healthy',
          wellness_analysis: 'Test',
          advice: { description: 'Advice', factors: {} },
        },
        metadata: {
          created_at: '2026-01-21T10:00:00Z',
          completed_at: '2026-01-21T10:01:00Z',
        },
      };

      pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByText('82.5')).toBeInTheDocument();
      });
    });

    it('should handle negative scores by setting to 0', async () => {
      const mockResult = {
        success: true,
        status: 'ready',
        data: {
          prediction_score: -10.5,
          health_level: 'dangerous',
          wellness_analysis: 'Test',
          advice: { description: 'Advice', factors: {} },
        },
        metadata: {
          created_at: '2026-01-21T10:00:00Z',
          completed_at: '2026-01-21T10:01:00Z',
        },
      };

      pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByText('0.0')).toBeInTheDocument();
      });
    });
  });
});

// ============================================
// GUEST VS AUTHENTICATED USER TESTS
// ============================================

describe('Result Component - Guest User (Not Authenticated)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Set as guest (not authenticated)
    mockIsAuthenticated = false;
  });

  afterEach(() => {
    // Reset to authenticated for other tests
    mockIsAuthenticated = true;
  });

  it('should show score for guest users', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 65.0,
        health_level: 'average',
        wellness_analysis: 'Your mental wellness is average',
        advice: { description: 'Some advice', factors: {} },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

    renderResult('guest-test-123');

    // Should show score
    await waitFor(() => {
      expect(screen.getByText('65.0')).toBeInTheDocument();
    });

    // Should show category
    expect(screen.getByText('Average')).toBeInTheDocument();
  });

  it('should show locked advice section for guest users', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 70.0,
        health_level: 'average',
        wellness_analysis: 'Test analysis',
        advice: {
          description: 'Advice that guest should not see',
          factors: {},
        },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

    renderResult('guest-test-456');

    await waitFor(() => {
      expect(screen.getByText('70.0')).toBeInTheDocument();
    });

    // Should NOT show the Advice component
    expect(screen.queryByTestId('advice-component')).not.toBeInTheDocument();

    // Should show locked advice message
    expect(screen.getByText(/Personal Advice Locked/i)).toBeInTheDocument();
  });

  it('should show login and register buttons for guest users', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 55.0,
        health_level: 'not healthy',
        wellness_analysis: 'Test',
        advice: { description: 'Advice', factors: {} },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

    renderResult('guest-test-789');

    await waitFor(() => {
      expect(screen.getByText('55.0')).toBeInTheDocument();
    });

    // Should show login and register buttons
    expect(
      screen.getByRole('button', { name: /Sign In/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Register/i })
    ).toBeInTheDocument();
  });

  it('should navigate to signIn when login button clicked', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 60.0,
        health_level: 'average',
        wellness_analysis: 'Test',
        advice: { description: 'Advice', factors: {} },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

    renderResult('guest-test-nav');

    await waitFor(() => {
      expect(screen.getByText('60.0')).toBeInTheDocument();
    });

    const loginButton = screen.getByRole('button', { name: /Sign In/i });
    loginButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/signIn');
  });

  it('should navigate to register when register button clicked', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 60.0,
        health_level: 'average',
        wellness_analysis: 'Test',
        advice: { description: 'Advice', factors: {} },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

    renderResult('guest-test-register');

    await waitFor(() => {
      expect(screen.getByText('60.0')).toBeInTheDocument();
    });

    const registerButton = screen.getByRole('button', { name: /Register/i });
    registerButton.click();

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});

describe('Result Component - Authenticated User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    // Set as authenticated
    mockIsAuthenticated = true;
  });

  it('should show score for authenticated users', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 85.0,
        health_level: 'healthy',
        wellness_analysis: 'Excellent mental health',
        advice: { description: 'Keep it up', factors: {} },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

    renderResult('auth-test-123');

    await waitFor(() => {
      expect(screen.getByText('85.0')).toBeInTheDocument();
    });

    expect(screen.getByText('Healthy')).toBeInTheDocument();
  });

  it('should show full advice component for authenticated users', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 75.0,
        health_level: 'average',
        wellness_analysis: 'Good mental health',
        advice: {
          description: 'Personalized advice here',
          factors: {
            sleep: { recommendation: 'Improve sleep' },
            exercise: { recommendation: 'Exercise more' },
          },
        },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

    renderResult('auth-test-456');

    await waitFor(() => {
      expect(screen.getByText('75.0')).toBeInTheDocument();
    });

    // Should show the Advice component
    expect(screen.getByTestId('advice-component')).toBeInTheDocument();

    // Should have advice data
    await waitFor(() => {
      expect(screen.getByTestId('advice-data')).toHaveTextContent('has-advice');
    });
  });

  it('should NOT show locked advice section for authenticated users', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 80.0,
        health_level: 'healthy',
        wellness_analysis: 'Test',
        advice: { description: 'Advice', factors: {} },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockResult);

    renderResult('auth-test-789');

    await waitFor(() => {
      expect(screen.getByText('80.0')).toBeInTheDocument();
    });

    // Should NOT show locked message
    expect(
      screen.queryByText(/Personal Advice Locked/i)
    ).not.toBeInTheDocument();

    // Should NOT show login/register buttons in advice section
    const adviceLocked = screen.queryByText(/Sign in or register/i);
    expect(adviceLocked).not.toBeInTheDocument();
  });

  it('should show advice loading state for authenticated users', async () => {
    const mockPartialResult = {
      success: true,
      status: 'partial',
      data: {
        prediction_score: 72.0,
        health_level: 'average',
        wellness_analysis: 'Analysis in progress',
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
      },
    };

    pollingHelper.pollPredictionResult
      .mockResolvedValueOnce(mockPartialResult)
      .mockResolvedValueOnce({
        success: true,
        status: 'processing',
        data: null,
      });

    renderResult('auth-partial-test');

    await waitFor(() => {
      expect(screen.getByText('72.0')).toBeInTheDocument();
    });

    // Should show advice component in loading state
    expect(screen.getByTestId('advice-component')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('advice-loading')).toHaveTextContent('true');
    });
  });
});
