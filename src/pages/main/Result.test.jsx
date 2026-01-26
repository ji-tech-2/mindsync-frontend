import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter, Route, Routes } from 'react-router-dom';
import Result from './Result';
import * as pollingHelper from '../helpers/pollingHelper';

// Mock the API config
vi.mock('../../config/api.js', () => ({
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
vi.mock('../helpers/pollingHelper', () => ({
  pollPredictionResult: vi.fn(),
}));

// Mock the Advice component
vi.mock('../../components/Advice', () => ({
  default: ({ adviceData, isLoading }) => (
    <div data-testid="advice-component">
      <div data-testid="advice-loading">{isLoading ? 'true' : 'false'}</div>
      <div data-testid="advice-data">{adviceData ? 'has-advice' : 'no-advice'}</div>
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
      pollingHelper.pollPredictionResult.mockResolvedValueOnce(mockPartialResult);
      
      // Mock for second call in pollForAdvice (continue polling in background)
      pollingHelper.pollPredictionResult.mockResolvedValueOnce({
        success: true,
        status: 'processing',
        data: null,
      });

      renderResult('test-123');

      // Should show loading initially
      expect(screen.getByText(/Menganalisis Data Anda/i)).toBeInTheDocument();

      // Wait for partial result to load
      await waitFor(() => {
        expect(screen.getByText('75.5')).toBeInTheDocument();
      });

      // Should show score and category
      expect(screen.getByText('Average')).toBeInTheDocument();
      
      // Advice should be in loading state
      await waitFor(() => {
        expect(screen.getByTestId('advice-loading')).toHaveTextContent('true');
        expect(screen.getByTestId('advice-data')).toHaveTextContent('no-advice');
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
      await waitFor(() => {
        expect(screen.getByTestId('advice-data')).toHaveTextContent('has-advice');
      }, { timeout: 5000 });

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
        expect(screen.getByTestId('advice-data')).toHaveTextContent('has-advice');
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
      expect(screen.getByText(/Menganalisis Data Anda/i)).toBeInTheDocument();
      expect(screen.getByText(/Mohon tunggu sebentar/i)).toBeInTheDocument();
      
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
        expect(screen.getByText(/Terjadi Kesalahan/i)).toBeInTheDocument();
        expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument();
      });

      // Should show retry buttons
      expect(screen.getByText('Coba Lagi')).toBeInTheDocument();
      expect(screen.getByText('Kembali ke Beranda')).toBeInTheDocument();
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
          'Data tidak ditemukan. Silakan lakukan screening ulang.'
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
    it('should navigate to screening when "Ambil Tes Lagi" clicked', async () => {
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

      const retakeButton = screen.getByText('Ambil Tes Lagi');
      retakeButton.click();

      expect(mockNavigate).toHaveBeenCalledWith('/screening');
    });

    it('should navigate to home when "Kembali ke Beranda" clicked', async () => {
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

      const homeButton = screen.getByText('Kembali ke Beranda');
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
