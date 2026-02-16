import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/features/auth';
import { pollPredictionResult } from '@/services';
import { Button } from '@/components';
import Advice from '../components/Advice';
import ScoreDisplay from '../components/ScoreDisplay';
import StatusBadge from '../components/StatusBadge';
import styles from './Result.module.css';

const ResultPage = () => {
  const navigate = useNavigate();
  const { predictionId } = useParams();
  const { user } = useAuth();
  const [resultData, setResultData] = useState(null);
  const [adviceData, setAdviceData] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [pollingError, setPollingError] = useState(null);
  const [loadingStage, setLoadingStage] = useState(1);
  const [, setHasPartialResult] = useState(false);

  useEffect(() => {
    const loadResult = async () => {
      if (!predictionId) {
        alert('Data not found. Please take the screening again.');
        navigate('/screening');
        return;
      }

      // Check localStorage first for cached result
      const cachedResult = localStorage.getItem(`result_${predictionId}`);
      if (cachedResult) {
        try {
          const cached = JSON.parse(cachedResult);
          console.log('✅ Using cached result from localStorage:', cached);
          setResultData(cached.resultData);
          if (cached.adviceData) {
            setAdviceData(cached.adviceData);
          }
          setIsPolling(false);
          setIsLoadingAdvice(false);
          setLoadingStage(3);
          return; // Skip polling, use cached data
        } catch {
          console.warn(
            '⚠️ Failed to parse cached result, will fetch fresh data'
          );
        }
      }

      setIsPolling(true);
      setPollingError(null);
      setLoadingStage(1);

      try {
        // Callback for partial results (Stage 1: Numeric model ready)
        (partialData) => {
          console.log('📊 Partial result received:', partialData);
          setLoadingStage(2);
          setHasPartialResult(true);

          // Display numeric results immediately
          setResultData({
            mentalWellnessScore: Math.max(
              0,
              parseFloat(partialData.data.prediction_score)
            ),
            category: partialData.data.health_level,
            wellnessAnalysis: null, // Advisory model still processing
            isPartial: true,
          });
        };

        // Start polling with partial result callback
        const pollResult = await pollPredictionResult(
          predictionId,
          120, // maxAttempts
          1000 // intervalMs
        );

        if (pollResult.success) {
          console.log('✅ Complete result received:', pollResult);
          setLoadingStage(3);

          const prediction = pollResult.data;

          // Set prediction data (always available)
          const resultDataToSave = {
            mentalWellnessScore: Math.max(
              0,
              parseFloat(prediction.prediction_score)
            ),
            category: prediction.health_level,
            wellnessAnalysis: prediction.wellness_analysis,
            isPartial: false,
          };

          setResultData(resultDataToSave);

          // If partial, show results but continue polling for advice
          if (pollResult.status === 'partial') {
            console.log(
              '📊 Showing partial results, continuing to poll for advice...'
            );
            setIsPolling(false);
            setIsLoadingAdvice(true);

            // Save partial result to localStorage
            localStorage.setItem(
              `result_${predictionId}`,
              JSON.stringify({
                resultData: resultDataToSave,
                adviceData: null,
                timestamp: new Date().toISOString(),
              })
            );

            // Continue polling for full result with advice
            pollForAdvice(predictionId);
          }
          // If ready, set advice data
          else if (pollResult.status === 'ready') {
            console.log('✅ Full results with advice ready');
            let adviceToSave = null;
            if (prediction.advice) {
              setAdviceData(prediction.advice);
              adviceToSave = prediction.advice;
            }

            // Save complete result to localStorage
            localStorage.setItem(
              `result_${predictionId}`,
              JSON.stringify({
                resultData: resultDataToSave,
                adviceData: adviceToSave,
                timestamp: new Date().toISOString(),
              })
            );

            setIsPolling(false);
            setIsLoadingAdvice(false);
          }
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
        setPollingError(error.message);
        setIsPolling(false);
        setIsLoadingAdvice(false);
      }
    };

    // Function to continue polling for advice
    const pollForAdvice = async (predictionId) => {
      let adviceAttempts = 0;
      const maxAdviceAttempts = 120;
      const pollInterval = 1000;

      const pollUntilReady = async () => {
        adviceAttempts++;
        console.log(
          `🔄 Polling for advice attempt ${adviceAttempts}/${maxAdviceAttempts}`
        );

        try {
          const pollResult = await pollPredictionResult(
            predictionId,
            1, // Only 1 attempt per call, we handle retries here
            pollInterval
          );

          if (pollResult.success && pollResult.status === 'ready') {
            const prediction = pollResult.data;
            if (prediction.advice) {
              console.log('✅ Advice data received:', prediction.advice);
              setAdviceData(prediction.advice);

              // Update localStorage with complete advice
              const cachedData = localStorage.getItem(`result_${predictionId}`);
              if (cachedData) {
                const parsed = JSON.parse(cachedData);
                parsed.adviceData = prediction.advice;
                localStorage.setItem(
                  `result_${predictionId}`,
                  JSON.stringify(parsed)
                );
              }
            }
            setIsLoadingAdvice(false);
            return;
          }

          // Still partial or processing, continue polling
          if (
            pollResult.status === 'partial' ||
            pollResult.status === 'processing'
          ) {
            if (adviceAttempts >= maxAdviceAttempts) {
              console.warn('⚠️ Timeout waiting for advice');
              setIsLoadingAdvice(false);
              return;
            }

            // Wait and poll again
            await new Promise((resolve) => setTimeout(resolve, pollInterval));
            return pollUntilReady();
          }
        } catch (error) {
          console.error('⚠️ Failed to load advice:', error);
          setIsLoadingAdvice(false);
        }
      };

      pollUntilReady();
    };

    loadResult();
  }, [predictionId, navigate]);

  // Show loading if data is not ready or still polling
  if (isPolling && loadingStage === 1) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <h2>Analyzing Your Data...</h2>
            <p>
              Please wait a moment, we are processing your screening results
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if polling failed
  if (pollingError) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>⚠️ An Error Occurred</h2>
            <p>{pollingError}</p>
            <div className={styles.buttonGroup}>
              <Button variant="filled" onClick={() => navigate('/screening')}>
                Try Again
              </Button>
              <Button variant="outlined" onClick={() => navigate('/')}>
                Back to Home
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading if data is not ready yet
  if (!resultData) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.container}>
          <div className={styles.loading}>
            <p>Loading analysis results...</p>
          </div>
        </div>
      </div>
    );
  }

  const score = resultData.mentalWellnessScore;

  return (
    <div className={styles.resultPage}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <h1>Your Mental Health Score</h1>
          <p>Based on your screening answers</p>
        </header>

        {/* Score Display */}
        <div className={styles.scoreSection}>
          <ScoreDisplay score={score} category={resultData.category} />
          <StatusBadge category={resultData.category} />
        </div>

        {/* Content Section */}
        <section className={styles.contentSection}>
          {user ? (
            <Advice adviceData={adviceData} isLoading={isLoadingAdvice} />
          ) : (
            <div className={styles.authLocked}>
              <h3>🔒 Personal Advice Locked</h3>
              <p>
                Sign in or register to view personalized mental health advice
                based on your results.
              </p>
              <div className={styles.buttonGroup}>
                <Button variant="filled" onClick={() => navigate('/signin')}>
                  Sign In
                </Button>
                <Button variant="outlined" onClick={() => navigate('/signup')}>
                  Register
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Footer Actions */}
        <div className={styles.footer}>
          <Button variant="outlined" onClick={() => navigate('/screening')}>
            Retake Test
          </Button>
          <Button variant="filled" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
