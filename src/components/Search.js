import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, Search as SearchIcon, FileText, X } from 'lucide-react';
import './Search.css';

const Search = () => {
  const [medicalText, setMedicalText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef(null);
  const { userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const exampleQueries = [
    'How do I put in my insulin pump?',
    'What are the side effects of my medication?',
    'How do I use my blood pressure monitor?',
    'What does this medical procedure involve?'
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf', 'text/csv'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.md')) {
      alert('Please upload a text file (.txt, .md) or PDF (.pdf)');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process file');
      }

      if (data.success) {
        setUploadedFile(file);
        setMedicalText(data.text || '');
        // Auto-submit if text was extracted
        if (data.text) {
          await simplifyText(data.text);
        }
      } else {
        throw new Error(data.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to upload file: ${error.message}\n\nMake sure the backend API is running on http://localhost:5000`);
    } finally {
      setIsLoading(false);
    }
  };

  const simplifyText = async (text) => {
    setIsLoading(true);
    setShowResults(false);

    try {
      const response = await fetch('http://localhost:5000/api/simplify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text }),
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!medicalText.trim()) {
      alert('Please enter some medical instructions to simplify or upload a file');
      return;
    }

    await simplifyText(medicalText);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setMedicalText(searchQuery);
      await simplifyText(searchQuery);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setFileName('');
    setMedicalText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    setMedicalText('');
    setResult('');
    setShowResults(false);
    setSearchQuery('');
    handleRemoveFile();
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
          <div className="nav-search-bar">
            <form onSubmit={handleSearch} className="search-bar-form">
              <div className="search-input-wrapper">
                <SearchIcon className="search-icon" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Quick search medical instructions..."
                  className="search-bar-input"
                />
              </div>
              <button type="submit" className="btn btn-primary search-btn">
                Search
              </button>
            </form>
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
            {/* File Upload Section */}
            <div className="file-upload-section">
              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  id="file-upload"
                  onChange={handleFileUpload}
                  accept=".txt,.md,.pdf,.csv,text/plain,text/markdown,application/pdf,text/csv"
                  className="file-input"
                  disabled={isLoading}
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <Upload className="upload-icon" size={24} />
                  <span>Upload Medical Document</span>
                  <span className="file-types">(.txt, .md, .pdf)</span>
                </label>
              </div>
              {uploadedFile && (
                <div className="uploaded-file-info">
                  <FileText className="file-icon" size={20} />
                  <span className="file-name">{fileName}</span>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="remove-file-btn"
                    disabled={isLoading}
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            <div className="divider">
              <span>OR</span>
            </div>

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

