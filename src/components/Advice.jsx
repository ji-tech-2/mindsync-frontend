import React from 'react';
import AdviceFactor from './AdviceFactor';

const dummyResponse = {
  "description": "It sounds like you're navigating a particularly challenging period, and it takes immense strength to acknowledge these struggles. Dealing with concerns around your sleep quality, the amount of physical activity you're able to incorporate, and how your sleep impacts your overall productivity can feel incredibly overwhelming. Please know that it's okay to feel this way, and reaching out for support is a courageous first step towards finding balance and well-being.",
  "factors": {
    "num__exercise_minutes_per_week": {
      "advices": [
        "Start with small, manageable increments of physical activity, such as 10-15 minute walks, and gradually increase duration or intensity as your stamina improves.",
        "Find activities you genuinely enjoy, whether it's dancing, gardening, or a sport, to make exercise feel less like a chore and more like a rewarding part of your day.",
        "Integrate movement into your daily routine by taking stairs instead of elevators, parking further away, or doing short 'activity snacks' throughout the day."
      ],
      "references": [
        "https://www.who.int/news-room/fact-sheets/detail/physical-activity",
        "https://newsnetwork.mayoclinic.org/discussion/mayo-clinic-minute-boost-your-health-and-productivity-with-activity-snacks/",
        "https://www.nimh.nih.gov/health/topics/caring-for-your-mental-health"
      ]
    },
    "num__sleep_hours productivity_0_100": {
      "advices": [
        "Prioritize adequate sleep by aiming for 7-9 hours per night, recognizing that sufficient rest is foundational for optimal cognitive function and productivity.",
        "Implement a 'power-down' hour before bed, avoiding screens and mentally stimulating tasks, to allow your brain to switch from 'work mode' to 'rest mode'.",
        "Structure your workday or tasks by breaking them into smaller, manageable chunks with short breaks in between, which can enhance focus and prevent burnout, even with good sleep."
      ],
      "references": [
        "https://www.sleepfoundation.org/sleep-hygiene",
        "https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/5-ways-to-get-better-sleep",
        "https://newsnetwork.mayoclinic.org/discussion/mayo-clinic-minute-boost-your-health-and-productivity-with-activity-snacks/"
      ]
    },
    "num__sleep_quality_1_5^2": {
      "advices": [
        "Establish a consistent sleep schedule, going to bed and waking up at the same time daily, even on weekends, to regulate your body's natural sleep-wake cycle.",
        "Create a relaxing bedtime routine, such as reading a book, taking a warm bath, or listening to calming music, to signal to your body that it's time to wind down.",
        "Optimize your sleep environment by ensuring your bedroom is dark, quiet, cool, and free from electronic devices that emit blue light."
      ],
      "references": [
        "https://www.mayoclinichealthsystem.org/hometown-health/speaking-of-health/5-ways-to-get-better-sleep",
        "https://www.sleepfoundation.org/sleep-hygiene",
        "https://www.cdc.gov/sleep/about/index.html"
      ]
    }
  }
}


const Advice = () => {
  return (
    <div className="advice-section">
      <h2>Advice</h2>
      <p>
        {dummyResponse.description}
      </p>
      <div className="advice-factors">
        {Object.entries(dummyResponse.factors).map(([key, value]) => (
          <AdviceFactor key={key} factorKey={key} factorData={value} />
        ))}
      </div>
    </div>
  );
};

export default Advice;
