import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { saveSearch, getSearchHistory } from '../services/searchService';
import { Upload, FileText, X, History, Book } from 'lucide-react';
import API_URL from '../config/api';
import * as pdfjsLib from 'pdfjs-dist';
import './Search.css';

// Configure pdf.js worker - use unpkg CDN for better reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

const Search = () => {
  const [medicalText, setMedicalText] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fileInputRef = useRef(null);
  const { user, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  const exampleQueries = [
    'How do I put in my insulin pump?',
    'What are the side effects of my medication?',
    'How do I use my blood pressure monitor?',
    'What does this medical procedure involve?'
  ];

  const loadSearchHistory = useCallback(async () => {
    if (!user || !user.id) return;
    try {
      const { data, error } = await getSearchHistory(user.id, 10);
      if (!error && data) {
        setSearchHistory(data);
      } else if (error) {
        // Silently fail - Supabase might not be configured
        console.warn('Could not load search history:', error.message);
      }
    } catch (error) {
      // Silently fail - don't crash the app if Supabase isn't configured
      console.warn('Error loading search history (this is OK if Supabase is not configured):', error.message);
    }
  }, [user]);

  // Load search history on component mount
  useEffect(() => {
    if (user && user.id) {
      loadSearchHistory();
    }
  }, [user, loadSearchHistory]);

  /**
   * Extract text from PDF file using pdf.js
   */
  const extractTextFromPDF = async (file) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n';
      }

      return fullText.trim();
    } catch (error) {
      console.error('Error extracting PDF text:', error);
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const allowedTypes = ['text/plain', 'text/markdown', 'application/pdf', 'text/csv'];
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isTextFile = allowedTypes.includes(file.type) || 
                      file.name.endsWith('.txt') || 
                      file.name.endsWith('.md') || 
                      file.name.endsWith('.csv');

    if (!isTextFile && !isPDF) {
      alert('Please upload a text file (.txt, .md, .csv) or PDF (.pdf)');
      return;
    }

    setFileName(file.name);
    setIsLoading(true);

    try {
      let textContent = '';

      if (isPDF) {
        // Extract text from PDF client-side
        textContent = await extractTextFromPDF(file);
        
        if (!textContent || !textContent.trim()) {
          throw new Error('PDF appears to be empty or contains only images. Unable to extract text.');
        }

        // Set the extracted text and auto-submit
        setUploadedFile(file);
        setMedicalText(textContent);
        await simplifyText(textContent, true);
      } else {
        // For text files, use the upload API
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/upload`, {
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
      }
    } catch (error) {
      console.error('Error:', error);
      alert(`Failed to process file: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const simplifyText = async (text, fileUploaded = false) => {
    setIsLoading(true);
    setShowResults(false);

    try {
      const response = await fetch(`${API_URL}/api/simplify`, {
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
        
        // Save search to Supabase if user is logged in (but not for file uploads)
        if (user && user.id && !fileUploaded) {
          try {
            await saveSearch(user.id, text, data.result, false);
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
            <h2>🏥 Medi-Chat</h2>
          </div>
          <div className="nav-user">
            <button 
              className="dictionary-btn" 
              onClick={() => navigate('/dictionary')}
            >
              <Book size={16} />
              Dictionary
            </button>
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

