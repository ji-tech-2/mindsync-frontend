import { useState, useEffect, useRef } from 'react';
import styles from './StageContainer.module.css';

/**
 * Build wrapper CSS class names
 */
const buildWrapperClasses = (isAnimating, animateHeight) => {
  const classes = [styles.stageWrapper];
  if (isAnimating) classes.push(styles.clipping);
  if (!animateHeight) classes.push(styles.noHeightAnimation);
  return classes.join(' ');
};

/**
 * Build stage CSS class names
 */
const buildStageClasses = (isExiting, isGoingBack, animateHeight) => {
  const classes = [styles.stage];
  if (isExiting) {
    classes.push(isGoingBack ? styles.backExit : styles.exit);
  }
  if (!animateHeight) classes.push(styles.fixedHeight);
  return classes.join(' ');
};

/**
 * Get animation class for current stage
 */
const getCurrentStageAnimation = (
  hasBeenAnimating,
  isAnimating,
  isGoingBack
) => {
  if (!hasBeenAnimating || !isAnimating) return styles.noAnimation;
  return isGoingBack ? styles.back : styles.entering;
};

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
    if (!animateHeight || !currentStageRef.current) return;

    const measureAndUpdateHeight = () => {
      if (currentStageRef.current) {
        const height = currentStageRef.current.offsetHeight + 32;
        setWrapperHeight(`${height}px`);
      }
    };

    measureAndUpdateHeight();
    const observer = new ResizeObserver(measureAndUpdateHeight);
    observer.observe(currentStageRef.current);

    return () => observer.disconnect();
  }, [currentStage, animateHeight]);

  useEffect(() => {
    if (prevStage !== currentStage) {
      const timer = setTimeout(() => setPrevStage(currentStage), 300);
      return () => clearTimeout(timer);
    }
  }, [currentStage, prevStage]);

  if (!stages || stages.length === 0) return null;

  const isAnimating = prevStage !== currentStage;
  const hasBeenAnimating = isAnimating || currentStage !== 0;
  const wrapperStyle = animateHeight ? { height: wrapperHeight } : {};

  return (
    <div
      ref={wrapperRef}
      className={buildWrapperClasses(isAnimating, animateHeight)}
      style={wrapperStyle}
    >
      {isAnimating && (
        <div
          ref={prevStageRef}
          className={buildStageClasses(true, isGoingBack, animateHeight)}
        >
          {stages[prevStage]}
        </div>
      )}

      <div
        ref={currentStageRef}
        className={`${styles.stage} ${getCurrentStageAnimation(
          hasBeenAnimating,
          isAnimating,
          isGoingBack
        )} ${!animateHeight ? styles.fixedHeight : ''}`}
      >
        {stages[currentStage]}
      </div>
    </div>
  );
}

export default StageContainer;
