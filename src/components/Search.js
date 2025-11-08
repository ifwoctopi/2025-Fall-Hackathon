import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveSearch, getSearchHistory } from '../services/searchService';
import { searchDictionary } from '../services/dictionaryService';
import { Upload, Search as SearchIcon, FileText, X, History, Trash2, Book } from 'lucide-react';
import './Search.css';

const Search = () => {
  const [medicalText, setMedicalText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [dictionaryResults, setDictionaryResults] = useState([]);
  const [showDictionaryResults, setShowDictionaryResults] = useState(false);
  const [searchMode, setSearchMode] = useState('ai'); // 'ai' or 'dictionary'
  const fileInputRef = useRef(null);
  const { user, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const exampleQueries = [
    'How do I put in my insulin pump?',
    'What are the side effects of my medication?',
    'How do I use my blood pressure monitor?',
    'What does this medical procedure involve?'
  ];

  // Load search history on component mount
  useEffect(() => {
    if (user) {
      loadSearchHistory();
    }
  }, [user]);

  const loadSearchHistory = async () => {
    if (!user) return;
    try {
      const { data, error } = await getSearchHistory(user.id, 10);
      if (!error && data) {
        setSearchHistory(data);
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

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
          await simplifyText(data.text, true);
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

  const simplifyText = async (text, fileUploaded = false) => {
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
        
        // Save search to Supabase if user is logged in
        if (user && user.id) {
          try {
            await saveSearch(user.id, text, data.result, fileUploaded);
            // Reload search history
            loadSearchHistory();
          } catch (saveError) {
            console.error('Error saving search:', saveError);
            // Don't show error to user - search worked, just history save failed
          }
        }
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
      if (searchMode === 'dictionary') {
        await searchDictionaryTerms(searchQuery);
      } else {
        await simplifyText(searchQuery);
      }
    }
  };

  const searchDictionaryTerms = async (term) => {
    setIsLoading(true);
    setShowDictionaryResults(false);
    setShowResults(false);

    try {
      const { data, error } = await searchDictionary(term, false);
      
      if (error) {
        throw new Error(error.message || 'Failed to search dictionary');
      }

      if (data && data.length > 0) {
        setDictionaryResults(data);
        setShowDictionaryResults(true);
      } else {
        alert('No medical terms found. Try searching with AI simplification instead.');
        setSearchMode('ai');
        await simplifyText(term);
      }
    } catch (error) {
      console.error('Error searching dictionary:', error);
      alert(`Failed to search dictionary: ${error.message}`);
    } finally {
      setIsLoading(false);
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
    setShowDictionaryResults(false);
    setDictionaryResults([]);
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
                  placeholder="Quick search medical instructions or terms..."
                  className="search-bar-input"
                />
              </div>
              <div className="search-mode-toggle">
                <button
                  type="button"
                  onClick={() => setSearchMode('dictionary')}
                  className={`mode-btn ${searchMode === 'dictionary' ? 'active' : ''}`}
                  title="Search Medical Dictionary"
                >
                  <Book size={16} />
                  Dictionary
                </button>
                <button
                  type="button"
                  onClick={() => setSearchMode('ai')}
                  className={`mode-btn ${searchMode === 'ai' ? 'active' : ''}`}
                  title="AI Simplification"
                >
                  AI
                </button>
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

          {showDictionaryResults && dictionaryResults.length > 0 && (
            <div className="results-container dictionary-results">
              <h2>
                <Book size={24} className="inline-icon" />
                Medical Dictionary Results
              </h2>
              <div className="dictionary-list">
                {dictionaryResults.map((item) => (
                  <div key={item.id} className="dictionary-item">
                    <h3 className="dictionary-term">{item.medical_term}</h3>
                    <p className="dictionary-definition">{item.definition}</p>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setMedicalText(item.medical_term);
                        setSearchMode('ai');
                        simplifyText(item.medical_term);
                      }}
                    >
                      Simplify with AI
                    </button>
                  </div>
                ))}
              </div>
              <button className="btn btn-secondary" onClick={() => {
                setShowDictionaryResults(false);
                setDictionaryResults([]);
              }}>
                Close
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

          {/* Search History */}
          {user && searchHistory.length > 0 && (
            <div className="search-history-section">
              <div className="history-header">
                <h3>Recent Searches</h3>
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="history-toggle-btn"
                >
                  <History size={20} />
                  {showHistory ? 'Hide' : 'Show'} History
                </button>
              </div>
              {showHistory && (
                <div className="history-list">
                  {searchHistory.map((search) => (
                    <div key={search.id} className="history-item">
                      <div className="history-item-content">
                        <div className="history-query">
                          {search.file_uploaded && <FileText size={16} className="file-indicator" />}
                          <span className="history-text">
                            {search.query.substring(0, 100)}
                            {search.query.length > 100 ? '...' : ''}
                          </span>
                        </div>
                        <div className="history-date">
                          {new Date(search.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setMedicalText(search.query);
                          simplifyText(search.query, search.file_uploaded);
                        }}
                        className="history-use-btn"
                      >
                        Use
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;

