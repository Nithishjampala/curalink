import React from 'react';
import './StructuredOutput.css';

const StructuredOutput = ({ response }) => {
  if (!response) return null;

  return (
    <div className="structured-output">
      <div className="section-header">
        <span className="section-icon">📋</span>
        <h2>Research Summary</h2>
      </div>
      
      <div className="info-card condition">
        <div className="card-header">
          <span>🏥</span>
          <h3>Condition Overview</h3>
        </div>
        <p>{response.conditionOverview || 'No overview available'}</p>
      </div>

      <div className="info-card insights">
        <div className="card-header">
          <span>📚</span>
          <h3>Research Insights</h3>
        </div>
        <p>{response.researchInsights?.summary || 'Key findings from recent studies:'}</p>
      </div>

      {response.personalizedNote && (
        <div className="info-card personalized">
          <div className="card-header">
            <span>💡</span>
            <h3>Personalized Insight</h3>
          </div>
          <p>{response.personalizedNote}</p>
        </div>
      )}

      {response.metadata && (
        <div className="metadata-bar">
          <span>🔍 Retrieved: {response.metadata.publicationsRetrieved || 0} papers</span>
          <span>🧪 Found: {response.metadata.trialsRetrieved || 0} trials</span>
        </div>
      )}
    </div>
  );
};

export default StructuredOutput;