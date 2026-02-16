import { describe, it, expect, beforeEach, vi } from 'vitest';
import { pollPredictionResult } from './pollingHelper';

describe('pollPredictionResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  describe('Partial Status Handling', () => {
    it('should return partial status when prediction ready but advice processing', async () => {
      const mockPartialResponse = {
        status: 'partial',
        result: {
          prediction_score: 75.5,
          health_level: 'average',
          wellness_analysis: 'Your mental wellness is average',
        },
        message: 'Prediction ready. AI advice still processing.',
        created_at: '2026-01-21T10:00:00Z',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPartialResponse,
      });

      const result = await pollPredictionResult('test-prediction-id', {
        baseURL: 'http://test-api.com',
        resultPath: '/v1/predictions',
        maxAttempts: 3,
        interval: 100,
      });

      expect(result).toEqual({
        success: true,
        status: 'partial',
        data: mockPartialResponse.result,
        metadata: {
          created_at: mockPartialResponse.created_at,
        },
      });
    });

    it('should continue polling after partial until ready', async () => {
      const mockPartialResponse = {
        status: 'partial',
        result: {
          prediction_score: 75.5,
          health_level: 'average',
          wellness_analysis: 'Your mental wellness is average',
        },
        created_at: '2026-01-21T10:00:00Z',
      };

      const mockReadyResponse = {
        status: 'ready',
        result: {
          prediction_score: 75.5,
          health_level: 'average',
          wellness_analysis: 'Your mental wellness is average',
          advice: {
            description: 'Focus on sleep and exercise',
            factors: {
              sleep: { recommendation: 'Get 7-8 hours' },
            },
          },
        },
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      };

      // First call returns partial
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPartialResponse,
      });

      const partialResult = await pollPredictionResult('test-prediction-id', {
        baseURL: 'http://test-api.com',
        resultPath: '/v1/predictions',
        maxAttempts: 3,
        interval: 100,
      });

      expect(partialResult.status).toBe('partial');

      // Second call returns ready
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadyResponse,
      });

      const readyResult = await pollPredictionResult('test-prediction-id', {
        baseURL: 'http://test-api.com',
        resultPath: '/v1/predictions',
        maxAttempts: 3,
        interval: 100,
      });

      expect(readyResult.status).toBe('ready');
      expect(readyResult.data.advice).toBeDefined();
    });
  });

  describe('Ready Status Handling', () => {
    it('should return ready status with full data including advice', async () => {
      const mockReadyResponse = {
        status: 'ready',
        result: {
          prediction_score: 85.2,
          health_level: 'healthy',
          wellness_analysis: 'Your mental wellness is good',
          advice: {
            description: 'Keep up the good work',
            factors: {
              sleep: { recommendation: 'Maintain current sleep schedule' },
              exercise: { recommendation: 'Continue regular exercise' },
            },
          },
        },
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadyResponse,
      });

      const result = await pollPredictionResult('test-prediction-id', {
        baseURL: 'http://test-api.com',
        resultPath: '/v0-1/result',
        maxAttempts: 3,
        interval: 100,
      });

      expect(result).toEqual({
        success: true,
        status: 'ready',
        data: mockReadyResponse.result,
        metadata: {
          created_at: mockReadyResponse.created_at,
          numeric_completed_at: undefined,
          advisory_completed_at: mockReadyResponse.completed_at,
        },
      });
    });
  });

  describe('Processing Status Handling', () => {
    it('should continue polling when status is processing', async () => {
      const mockProcessingResponse = {
        status: 'processing',
        message: 'Prediction is still being processed',
      };

      const mockReadyResponse = {
        status: 'ready',
        result: {
          prediction_score: 70.0,
          health_level: 'average',
          wellness_analysis: 'Analysis complete',
          advice: {
            description: 'Advice here',
            factors: {},
          },
        },
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      };

      // First call: processing
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockProcessingResponse,
      });

      // Second call: ready
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockReadyResponse,
      });

      const result = await pollPredictionResult('test-prediction-id', {
        baseURL: 'http://test-api.com',
        resultPath: '/v1/predictions',
        maxAttempts: 5,
        interval: 10, // short interval for test
      });

      expect(result.status).toBe('ready');
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should timeout after max attempts when still processing', async () => {
      const mockProcessingResponse = {
        status: 'processing',
        message: 'Still processing',
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockProcessingResponse,
      });

      await expect(
        pollPredictionResult('test-prediction-id', {
          baseURL: 'http://test-api.com',
          resultPath: '/v1/predictions',
          maxAttempts: 3, // only 3 attempts
          interval: 10,
        })
      ).rejects.toThrow('Timeout: Prediction took too long to process');

      expect(fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Handling', () => {
    it('should handle error status from API', async () => {
      const mockErrorResponse = {
        status: 'error',
        error: 'Model prediction failed',
        created_at: '2026-01-21T10:00:00Z',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockErrorResponse,
      });

      await expect(
        pollPredictionResult('test-prediction-id', {
          baseURL: 'http://test-api.com',
          resultPath: '/v1/predictions',
          maxAttempts: 3,
          interval: 100,
        })
      ).rejects.toThrow('Model prediction failed');
    });

    it('should handle not_found status', async () => {
      const mockNotFoundResponse = {
        status: 'not_found',
        message: 'Prediction ID not found',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockNotFoundResponse,
      });

      await expect(
        pollPredictionResult('test-prediction-id', {
          baseURL: 'http://test-api.com',
          resultPath: '/v1/predictions',
          maxAttempts: 3,
          interval: 100,
        })
      ).rejects.toThrow('Prediction ID not found');
    });

    it('should handle network errors with retry', async () => {
      // First call: network error
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      // Second call: success
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'ready',
          result: {
            prediction_score: 80,
            health_level: 'healthy',
            wellness_analysis: 'Good',
            advice: { description: 'Advice', factors: {} },
          },
          created_at: '2026-01-21T10:00:00Z',
          completed_at: '2026-01-21T10:01:00Z',
        }),
      });

      const result = await pollPredictionResult('test-prediction-id', {
        baseURL: 'http://test-api.com',
        resultPath: '/v1/predictions',
        maxAttempts: 5,
        interval: 10,
      });

      expect(result.status).toBe('ready');
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should fail after max network error retries', async () => {
      global.fetch.mockRejectedValue(new Error('Network error'));

      await expect(
        pollPredictionResult('test-prediction-id', {
          baseURL: 'http://test-api.com',
          resultPath: '/v1/predictions',
          maxAttempts: 3,
          interval: 10,
        })
      ).rejects.toThrow('Network error: Failed to fetch prediction result');

      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle Kong gateway routing errors', async () => {
      const mockKongError = {
        message: 'no Route matched with those values',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockKongError,
      });

      await expect(
        pollPredictionResult('test-prediction-id', {
          baseURL: 'http://test-api.com',
          resultPath: '/v1/predictions',
          maxAttempts: 3,
          interval: 100,
        })
      ).rejects.toThrow('Backend configuration error');
    });
  });

  describe('API Call Structure', () => {
    it('should construct correct polling URL', async () => {
      const mockResponse = {
        status: 'ready',
        result: {
          prediction_score: 75,
          health_level: 'average',
          wellness_analysis: 'Analysis',
          advice: { description: 'Advice', factors: {} },
        },
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:01:00Z',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      await pollPredictionResult('abc123', {
        baseURL: 'http://api.example.com',
        resultPath: '/v1/predictions',
        maxAttempts: 3,
        interval: 100,
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://api.example.com/v1/predictions/abc123/result',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });
  });

  describe('Metadata Handling', () => {
    it('should include created_at in partial response metadata', async () => {
      const mockResponse = {
        status: 'partial',
        result: {
          prediction_score: 75,
          health_level: 'average',
          wellness_analysis: 'Test',
        },
        created_at: '2026-01-21T10:00:00Z',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await pollPredictionResult('test-id', {
        baseURL: 'http://test.com',
        resultPath: '/result',
        maxAttempts: 3,
        interval: 100,
      });

      expect(result.metadata).toEqual({
        created_at: '2026-01-21T10:00:00Z',
      });
    });

    it('should include created_at and completed_at in ready response metadata', async () => {
      const mockResponse = {
        status: 'ready',
        result: {
          prediction_score: 75,
          health_level: 'average',
          wellness_analysis: 'Test',
          advice: { description: 'Advice', factors: {} },
        },
        created_at: '2026-01-21T10:00:00Z',
        completed_at: '2026-01-21T10:05:00Z',
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await pollPredictionResult('test-id', {
        baseURL: 'http://test.com',
        resultPath: '/result',
        maxAttempts: 3,
        interval: 100,
      });

      expect(result.metadata).toEqual({
        created_at: '2026-01-21T10:00:00Z',
        numeric_completed_at: undefined,
        advisory_completed_at: '2026-01-21T10:05:00Z',
      });
    });
  });
});
