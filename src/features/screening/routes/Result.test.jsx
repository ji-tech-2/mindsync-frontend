import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Result from './Result';

// Mock the services module (where ResultPage imports pollPredictionResult)
vi.mock('@/services', () => ({
  pollPredictionResult: vi.fn(),
}));
import { pollPredictionResult } from '@/services';

// Mock the useAuth hook with configurable auth state
let mockIsAuthenticated = true;
vi.mock('@/features/auth', () => {
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
vi.mock('../components/Advice', () => ({
  default: ({ adviceData, isLoading }) => (
    <div data-testid="advice-component">
      <div data-testid="advice-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="advice-data">
        {adviceData ? 'has-advice' : 'no-advice'}
      </div>
    </div>
  ),
}));

// Mock ScoreDisplay component
vi.mock('../components/ScoreDisplay', () => ({
  default: ({ score }) => (
    <div data-testid="score-display">
      <span data-testid="score-value">{score?.toFixed(1)}</span>
    </div>
  ),
}));

// Mock StatusBadge component
vi.mock('../components/StatusBadge', () => ({
  default: ({ category }) => {
    const labels = {
      dangerous: 'Dangerous',
      'not healthy': 'Not Healthy',
      average: 'Average',
      healthy: 'Healthy',
    };
    return (
      <span data-testid="status-badge">{labels[category] || category}</span>
    );
  },
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
    <MemoryRouter initialEntries={[`/result/${predictionId}`]}>
      <Routes>
        <Route path="/result/:predictionId" element={<Result />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Result Component - Partial Polling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockIsAuthenticated = true;
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
        metadata: { created_at: '2026-01-21T10:00:00Z' },
      };

      pollPredictionResult.mockResolvedValueOnce(mockPartialResult);
      // Second call for advice polling
      pollPredictionResult.mockResolvedValueOnce({
        success: true,
        status: 'processing',
        data: null,
      });

      renderResult('test-123');

      // Should show loading initially
      expect(screen.getByText(/Analyzing Your Data/i)).toBeInTheDocument();

      // Wait for partial result to load
      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('75.5');
      });

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
        metadata: { created_at: '2026-01-21T10:00:00Z' },
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

      pollPredictionResult
        .mockResolvedValueOnce(mockPartialResult)
        .mockResolvedValueOnce(mockReadyResult);

      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('80.0');
      });

      await waitFor(
        () => {
          expect(screen.getByTestId('advice-data')).toHaveTextContent(
            'has-advice'
          );
        },
        { timeout: 5000 }
      );

      expect(pollPredictionResult).toHaveBeenCalledTimes(2);
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

      pollPredictionResult.mockResolvedValueOnce(mockReadyResult);
      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('85.0');
      });

      expect(screen.getByTestId('status-badge')).toHaveTextContent('Healthy');

      await waitFor(() => {
        expect(screen.getByTestId('advice-loading')).toHaveTextContent('false');
        expect(screen.getByTestId('advice-data')).toHaveTextContent(
          'has-advice'
        );
      });

      expect(pollPredictionResult).toHaveBeenCalledTimes(1);
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner while polling', () => {
      pollPredictionResult.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderResult('test-123');

      expect(screen.getByText(/Analyzing Your Data/i)).toBeInTheDocument();
      expect(screen.getByText(/Please wait a moment/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should always make a fresh request on page load (no caching)', async () => {
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

      // First render
      pollPredictionResult.mockResolvedValueOnce(mockResult);
      const { unmount } = renderResult('test-123');
      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('75.0');
      });
      unmount();

      // Second render of the same predictionId should still call the API
      pollPredictionResult.mockResolvedValueOnce(mockResult);
      renderResult('test-123');
      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('75.0');
      });

      expect(pollPredictionResult).toHaveBeenCalledTimes(2);
    });

    it('should show error message when polling fails', async () => {
      pollPredictionResult.mockRejectedValueOnce(
        new Error('Network error occurred')
      );

      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByText(/An Error Occurred/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument();
      });

      // Should show action buttons
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Back to Home')).toBeInTheDocument();
    });

    it('should redirect to screening when no predictionId', async () => {
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
    it('should display correct category labels', async () => {
      const testCases = [
        { category: 'dangerous', label: 'Dangerous' },
        { category: 'not healthy', label: 'Not Healthy' },
        { category: 'average', label: 'Average' },
        { category: 'healthy', label: 'Healthy' },
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();

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

        pollPredictionResult.mockResolvedValueOnce(mockResult);

        const { unmount } = renderResult('test-123');

        await waitFor(() => {
          expect(screen.getByTestId('status-badge')).toHaveTextContent(
            testCase.label
          );
        });

        unmount();
      }
    });
  });

  describe('Navigation', () => {
    it('should render link to screening page for retake', async () => {
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

      pollPredictionResult.mockResolvedValueOnce(mockResult);
      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('75.0');
      });

      const retakeLink = screen.getByRole('link', { name: /Retake Test/i });
      expect(retakeLink).toHaveAttribute('href', '/screening');
    });

    it('should render link to home page', async () => {
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

      pollPredictionResult.mockResolvedValueOnce(mockResult);
      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('75.0');
      });

      const homeLink = screen.getByRole('link', { name: /Back to Home/i });
      expect(homeLink).toHaveAttribute('href', '/dashboard');
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

      pollPredictionResult.mockResolvedValueOnce(mockResult);
      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('82.5');
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

      pollPredictionResult.mockResolvedValueOnce(mockResult);
      renderResult('test-123');

      await waitFor(() => {
        expect(screen.getByTestId('score-value')).toHaveTextContent('0.0');
      });
    });
  });
});

// ============================================
// GUEST VS AUTHENTICATED USER TESTS
// ============================================

describe('Result Component - Guest User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockIsAuthenticated = false;
  });

  afterEach(() => {
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

    pollPredictionResult.mockResolvedValueOnce(mockResult);
    renderResult('guest-test-123');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('65.0');
    });

    expect(screen.getByTestId('status-badge')).toHaveTextContent('Average');
  });

  it('should show locked advice section for guest users', async () => {
    const mockResult = {
      success: true,
      status: 'ready',
      data: {
        prediction_score: 70.0,
        health_level: 'average',
        wellness_analysis: 'Test analysis',
        advice: { description: 'Advice', factors: {} },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollPredictionResult.mockResolvedValueOnce(mockResult);
    renderResult('guest-test-456');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('70.0');
    });

    expect(screen.queryByTestId('advice-component')).not.toBeInTheDocument();
    expect(screen.getByText(/Personal Advice Locked/i)).toBeInTheDocument();
  });

  it('should show login and register links for guest users', async () => {
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

    pollPredictionResult.mockResolvedValueOnce(mockResult);
    renderResult('guest-test-789');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('55.0');
    });

    expect(screen.getByRole('link', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Register/i })).toBeInTheDocument();
  });

  it('should link to signIn page', async () => {
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

    pollPredictionResult.mockResolvedValueOnce(mockResult);
    renderResult('guest-test-nav');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('60.0');
    });

    const loginLink = screen.getByRole('link', { name: /Sign In/i });
    expect(loginLink).toHaveAttribute('href', '/signin');
  });

  it('should link to register page', async () => {
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

    pollPredictionResult.mockResolvedValueOnce(mockResult);
    renderResult('guest-test-register');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('60.0');
    });

    const registerLink = screen.getByRole('link', { name: /Register/i });
    expect(registerLink).toHaveAttribute('href', '/signup');
  });
});

describe('Result Component - Authenticated User', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
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

    pollPredictionResult.mockResolvedValueOnce(mockResult);
    renderResult('auth-test-123');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('85.0');
    });

    expect(screen.getByTestId('status-badge')).toHaveTextContent('Healthy');
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
          },
        },
      },
      metadata: {
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      },
    };

    pollPredictionResult.mockResolvedValueOnce(mockResult);
    renderResult('auth-test-456');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('75.0');
    });

    expect(screen.getByTestId('advice-component')).toBeInTheDocument();

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

    pollPredictionResult.mockResolvedValueOnce(mockResult);
    renderResult('auth-test-789');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('80.0');
    });

    expect(
      screen.queryByText(/Personal Advice Locked/i)
    ).not.toBeInTheDocument();
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
      metadata: { created_at: '2026-01-21T10:00:00Z' },
    };

    pollPredictionResult
      .mockResolvedValueOnce(mockPartialResult)
      .mockResolvedValueOnce({
        success: true,
        status: 'processing',
        data: null,
      });

    renderResult('auth-partial-test');

    await waitFor(() => {
      expect(screen.getByTestId('score-value')).toHaveTextContent('72.0');
    });

    expect(screen.getByTestId('advice-component')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByTestId('advice-loading')).toHaveTextContent('true');
    });
  });
});
