import React, { useState } from 'react';
import FeedbackForm from '../components/FeedbackForm';
import UserFeedback from '../components/UserFeedback';
import { Layout } from '../components/Layout';
import './Feedback.css';

const Feedback = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFeedbackSubmitted = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <Layout>
      <div className="feedback-page">
        <div className="feedback-page-header">
          <h1>Share Your Feedback</h1>
          <p>Your feedback helps us improve our event management system</p>
        </div>

        <div className="feedback-page-content">
          <div className="feedback-form-section">
            <FeedbackForm onFeedbackSubmitted={handleFeedbackSubmitted} />
          </div>

          <div className="feedback-history-section">
            <UserFeedback key={refreshKey} feedbackSubmitted={refreshKey} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Feedback;
