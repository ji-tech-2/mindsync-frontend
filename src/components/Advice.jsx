import React from 'react';
import AdviceFactor from './AdviceFactor';

const Advice = () => {
  const adviceFactors = [
    { id: 1 },
    { id: 2 },
    { id: 3 }
  ];

  return (
    <div className="advice-section">
      <h2>Advice</h2>
      <p>
        Based on your mental wellness assessment, here are some personalized recommendations 
        to help improve your well-being and maintain a healthy lifestyle.
      </p>
      <div className="advice-factors">
        {adviceFactors.map((factor) => (
          <AdviceFactor key={factor.id} />
        ))}
      </div>
    </div>
  );
};

export default Advice;
