import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import ResearchResults from './components/ResearchResults';
import ClinicalTrials from './components/ClinicalTrials';
import StructuredOutput from './components/StructuredOutput';

function App() {
  const [patientContext, setPatientContext] = useState({
    name: '',
    disease: '',
    location: ''
  });
  
  const [showContextModal, setShowContextModal] = useState(true);
  const [sessionId] = useState(() => 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9));
  const [currentResponse, setCurrentResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const handleContextSubmit = (e) => {
    e.preventDefault();
    if (patientContext.disease) {
      setShowContextModal(false);
    }
  };

  const handleNewResponse = (response) => {
    setCurrentResponse(response);
    setConversationHistory(prev => [...prev, {
      role: 'assistant',
      content: response,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="app">
      <div className="app-header">
        <div className="logo">
          <span className="logo-icon">🧬</span>
          <span className="logo-text">Curalink</span>
          <span className="logo-tagline">AI Medical Research Assistant</span>
        </div>
        <div className="header-info">
          {patientContext.disease && (
            <div className="patient-badge">
              <span>🎯 {patientContext.disease}</span>
              {patientContext.location && <span>📍 {patientContext.location}</span>}
            </div>
          )}
          <button className="settings-btn" onClick={() => setShowContextModal(true)}>⚙️ Edit Context</button>
        </div>
      </div>

      {showContextModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Patient Information</h2>
            <form onSubmit={handleContextSubmit}>
              <input
                type="text"
                placeholder="Patient Name (Optional)"
                value={patientContext.name}
                onChange={(e) => setPatientContext({...patientContext, name: e.target.value})}
              />
              <input
                type="text"
                placeholder="Disease of Interest *"
                required
                value={patientContext.disease}
                onChange={(e) => setPatientContext({...patientContext, disease: e.target.value})}
              />
              <input
                type="text"
                placeholder="Location (City, Country) - Optional"
                value={patientContext.location}
                onChange={(e) => setPatientContext({...patientContext, location: e.target.value})}
              />
              <button type="submit">Start Research</button>
            </form>
          </div>
        </div>
      )}

      <div className="app-main">
        <div className="chat-section">
          <ChatInterface 
            sessionId={sessionId}
            patientContext={patientContext}
            onResponse={handleNewResponse}
            setLoading={setLoading}
            conversationHistory={conversationHistory}
          />
        </div>
        
        <div className="results-section">
          {loading && (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>🔍 Searching publications & clinical trials...</p>
              <p className="loading-sub">Retrieving from OpenAlex, PubMed & ClinicalTrials.gov</p>
            </div>
          )}
          
          {currentResponse && !loading && (
            <>
              <StructuredOutput response={currentResponse} />
              
              {currentResponse.researchInsights?.publications?.length > 0 && (
                <ResearchResults publications={currentResponse.researchInsights.publications} />
              )}
              
              {currentResponse.clinicalTrials?.length > 0 && (
                <ClinicalTrials trials={currentResponse.clinicalTrials} />
              )}
            </>
          )}
        </div>
      </div>

      <div className="app-footer">
        <p>⚠️ This is an AI research assistant. Always consult healthcare professionals for medical advice.</p>
        <p>Sources: OpenAlex | PubMed | ClinicalTrials.gov</p>
      </div>
    </div>
  );
}

export default App;