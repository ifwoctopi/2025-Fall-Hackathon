import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Search.css';

const Search = () => {
  const [medicalText, setMedicalText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const exampleQueries = [
    'How do I put in my insulin pump?',
    'What are the side effects of my medication?',
    'How do I use my blood pressure monitor?',
    'What does this medical procedure involve?'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!medicalText.trim()) {
      alert('Please enter some medical instructions to simplify');
      return;
    }
    
    setIsLoading(true);
    setShowResults(false);
    
    try {
      const response = await fetch('http://localhost:5000/api/simplify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: medicalText }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to simplify instructions');
      }
      
      if (data.success) {
        setResult(data.result);
        setShowResults(true);
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to simplify instructions: ${error.message}\n\nMake sure the backend API is running on http://localhost:5000`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setMedicalText('');
    setResult('');
    setShowResults(false);
  };

  const handleExampleClick = (example) => {
    setMedicalText(example);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="search-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>🏥 Medical Simplifier</h2>
          </div>
          <div className="nav-user">
            <span>{userEmail}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
      
      <div className="container">
        <div className="search-section">
          <h1>Simplify Medical Instructions</h1>
          <p className="subtitle">
            Enter medical or device instructions below to get a simplified, easy-to-understand version
          </p>
          
          <div className="search-container">
            <form onSubmit={handleSubmit} className="search-form">
              <div className="input-group">
                <textarea
                  value={medicalText}
                  onChange={(e) => setMedicalText(e.target.value)}
                  className="search-input"
                  placeholder="Enter medical instructions, device manuals, or medical terminology here..."
                  rows="6"
                  required
                />
              </div>
              
              <button type="submit" className="btn btn-primary btn-large" disabled={isLoading}>
                {isLoading ? (
                  <span className="spinner">⏳ Processing...</span>
                ) : (
                  'Simplify Instructions'
                )}
              </button>
            </form>
          </div>
          
          {showResults && (
            <div className="results-container">
              <h2>Simplified Instructions</h2>
              <div className="result-content">{result}</div>
              <button className="btn btn-secondary" onClick={handleClear}>
                Clear Results
              </button>
            </div>
          )}
          
          <div className="examples-section">
            <h3>Example Queries</h3>
            <div className="examples-grid">
              {exampleQueries.map((example, index) => (
                <button
                  key={index}
                  className="example-btn"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;

