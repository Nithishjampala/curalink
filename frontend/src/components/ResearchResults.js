import React from 'react';
import './ResearchResults.css';

const ResearchResults = ({ publications }) => {
  if (!publications || publications.length === 0) return null;

  // Helper function to format authors (handles both string and array)
  const formatAuthors = (authors) => {
    if (!authors) return 'Authors not listed';
    if (typeof authors === 'string') return authors;
    if (Array.isArray(authors)) return authors.slice(0, 3).join(', ');
    return 'Authors not listed';
  };

  return (
    <div className="research-results">
      <div className="results-header">
        <span>📄</span>
        <h3>Research Publications</h3>
        <span className="count-badge">{publications.length} papers</span>
      </div>
      
      <div className="publications-grid">
        {publications.map((pub, idx) => (
          <div key={idx} className="publication-card">
            <div className="publication-year">{pub.year || 'N/A'}</div>
            <h4 className="publication-title">{pub.title || 'No Title'}</h4>
            <div className="publication-authors">
              {formatAuthors(pub.authors)}
            </div>
            <div className="publication-source">
              <span className={`source-badge ${(pub.source || '').toLowerCase()}`}>
                {pub.source || 'Unknown'}
              </span>
            </div>
            <p className="publication-abstract">
              {pub.keyFindings || pub.abstract?.substring(0, 200) || 'Abstract not available'}...
            </p>
            {pub.url && (
              <a href={pub.url} target="_blank" rel="noopener noreferrer" className="pub-link">
                🔗 View Publication →
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResearchResults;