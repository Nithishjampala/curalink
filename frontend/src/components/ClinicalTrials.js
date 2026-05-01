import React from 'react';
import './ClinicalTrials.css';

const ClinicalTrials = ({ trials }) => {
  if (!trials || trials.length === 0) return null;

  const getStatusColor = (status) => {
    if (status === 'RECRUITING') return '#4caf50';
    if (status === 'ACTIVE_NOT_RECRUITING') return '#ff9800';
    return '#888';
  };

  const formatLocations = (locations) => {
    if (!locations) return 'Location not specified';
    if (typeof locations === 'string') return locations;
    if (Array.isArray(locations)) {
      return locations.slice(0, 2).map(loc => loc.city || loc.facility || loc).join(', ');
    }
    return 'Location not specified';
  };

  return (
    <div className="clinical-trials">
      <div className="trials-header">
        <span>🧪</span>
        <h3>Clinical Trials</h3>
        <span className="count-badge">{trials.length} active trials</span>
      </div>
      
      <div className="trials-list">
        {trials.map((trial, idx) => (
          <div key={idx} className="trial-card">
            <div className="trial-status" style={{ backgroundColor: getStatusColor(trial.status) }}>
              {trial.status || 'Unknown'}
            </div>
            <h4 className="trial-title">{trial.title || 'No Title'}</h4>
            <div className="trial-phase">{trial.phase || 'Phase not specified'}</div>
            <div className="trial-locations">
              <span>📍</span>
              <span>{formatLocations(trial.locations)}</span>
            </div>
            <div className="trial-eligibility">
              <details>
                <summary>📋 Eligibility Criteria</summary>
                <p>{trial.eligibility?.substring(0, 300) || 'Contact site for eligibility details'}...</p>
              </details>
            </div>
            {(trial.contactName || trial.contactEmail) && (
              <div className="trial-contact">
                <span>📞</span>
                <span>{trial.contactName || 'Contact site'}</span>
                {trial.contactEmail && <a href={`mailto:${trial.contactEmail}`}>{trial.contactEmail}</a>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClinicalTrials;