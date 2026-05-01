import React, { useState } from 'react';
import axios from 'axios';
import './ChatInterface.css';

const ChatInterface = ({ sessionId, patientContext, onResponse, setLoading, conversationHistory }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/chat/message', {
        sessionId,
        message: userMessage,
        patientContext,
        history: messages
      });

      if (response.data.success) {
        const assistantMessage = response.data.response;
        setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage, timestamp: new Date() }]);
        onResponse(assistantMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: { error: 'Failed to get response. Please try again.' },
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="welcome-message">
            <div className="welcome-icon">🧬</div>
            <h3>Ask me anything about medical research</h3>
            <p>Try: "Latest treatment for {patientContext.disease || 'your condition'}"</p>
            <div className="suggestions">
              <button onClick={() => setInput(`Latest treatment for ${patientContext.disease || 'lung cancer'}`)}>
                🔬 Latest treatments
              </button>
              <button onClick={() => setInput(`Clinical trials for ${patientContext.disease || 'diabetes'}`)}>
                📋 Clinical trials
              </button>
              <button onClick={() => setInput(`Top researchers in ${patientContext.disease || 'Alzheimer\'s'}`)}>
                👨‍🔬 Top researchers
              </button>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🧬'}
            </div>
            <div className="message-content">
              {msg.role === 'user' ? (
                <p>{msg.content}</p>
              ) : (
                <div className="assistant-response-preview">
                  <p className="overview-preview">
                    {msg.content.conditionOverview?.substring(0, 150)}...
                  </p>
                  <span className="insight-badge">
                    📄 {msg.content.researchInsights?.publications?.length || 0} papers
                  </span>
                  <span className="insight-badge">
                    🧪 {msg.content.clinicalTrials?.length || 0} trials
                  </span>
                </div>
              )}
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="chat-input-container">
        <textarea
          className="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about treatments, clinical trials, research papers..."
          rows="2"
        />
        <button className="send-button" onClick={sendMessage}>
          <span>✈️</span> Send
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;