import { useState, useEffect, useRef } from 'react';
import styles from './StageContainer.module.css';

/**
 * StageContainer Component
 * Manages multi-stage form transitions with slide and fade animations
 * Uses CSS Grid to stack stages naturally without absolute positioning
 *
 * @param {Object} props
 * @param {React.ReactNode[]} props.stages - Array of stage components/content
 * @param {number} props.currentStage - Current stage index (0-based)
 * @param {boolean} props.isGoingBack - Whether transitioning backwards
 * @param {boolean} props.animateHeight - Whether to animate height transitions (default: true)
 */
function StageContainer({
  stages,
  currentStage = 0,
  isGoingBack = false,
  animateHeight = true,
}) {
  const [prevStage, setPrevStage] = useState(currentStage);
  const [wrapperHeight, setWrapperHeight] = useState('auto');
  const wrapperRef = useRef(null);
  const currentStageRef = useRef(null);
  const prevStageRef = useRef(null);

  // Measure and update wrapper height
  useEffect(() => {
    if (!animateHeight) return;

    const measureAndUpdateHeight = () => {
      if (currentStageRef.current) {
        const height = currentStageRef.current.offsetHeight + 32;
        setWrapperHeight(`${height}px`);
      }
    };

    // Measure immediately and also after layout shift
    measureAndUpdateHeight();

    // Use ResizeObserver to track content size changes
    const observer = new ResizeObserver(measureAndUpdateHeight);
    if (currentStageRef.current) {
      observer.observe(currentStageRef.current);
    }

    return () => observer.disconnect();
  }, [currentStage, animateHeight]);

  useEffect(() => {
    if (prevStage !== currentStage) {
      const timer = setTimeout(() => {
        setPrevStage(currentStage);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStage, prevStage]);

  if (!stages || stages.length === 0) {
    return null;
  }

  // Only animate after the first stage change
  const isAnimating = prevStage !== currentStage;
  const hasBeenAnimating = prevStage !== currentStage || currentStage !== 0;

  return (
    <div
      ref={wrapperRef}
      className={`${styles.stageWrapper} ${isAnimating ? styles.clipping : ''} ${
        !animateHeight ? styles.noHeightAnimation : ''
      }`}
      style={animateHeight ? { height: wrapperHeight } : {}}
    >
      {/* Previous stage - animating out */}
      {isAnimating && (
        <div
          ref={prevStageRef}
          className={`${styles.stage} ${
            isGoingBack ? styles.backExit : styles.exit
          } ${!animateHeight ? styles.fixedHeight : ''}`}
        >
          {stages[prevStage]}
        </div>
      )}

      {/* Current stage - always in DOM, stacked on grid */}
      <div
        ref={currentStageRef}
        className={`${styles.stage} ${
          hasBeenAnimating && isAnimating
            ? isGoingBack
              ? styles.back
              : styles.entering
            : styles.noAnimation
        } ${!animateHeight ? styles.fixedHeight : ''}`}
      >
        {stages[currentStage]}
      </div>
    </div>
  );
}

export default StageContainer;
