import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllDictionaryTerms } from '../services/dictionaryService';
import { Search as SearchIcon, Book, X, Info } from 'lucide-react';
import './Dictionary.css';

const Dictionary = () => {
  const [allTerms, setAllTerms] = useState([]);
  const [filteredTerms, setFilteredTerms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { user, userEmail, logout } = useAuth();
  const navigate = useNavigate();

  // Load all terms on component mount
  useEffect(() => {
    loadAllTerms();
  }, []);

  // Filter terms based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTerms(allTerms);
    } else {
      const filtered = allTerms.filter(term => {
        const query = searchQuery.toLowerCase();
        return (
          term.medical_term.toLowerCase().includes(query) ||
          term.definition.toLowerCase().includes(query)
        );
      });
      setFilteredTerms(filtered);
    }
  }, [searchQuery, allTerms]);

  const loadAllTerms = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await getAllDictionaryTerms();
      if (error) {
        throw new Error(error.message || 'Failed to load dictionary terms');
      }
      setAllTerms(data || []);
      setFilteredTerms(data || []);
    } catch (error) {
      console.error('Error loading dictionary terms:', error);
      alert(`Failed to load dictionary: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Search is handled by real-time filtering in useEffect
    // This just prevents form submission
  };

  const handleTermClick = (term) => {
    setSelectedTerm(term);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTerm(null);
  };

  const getShortBlurb = (definition) => {
    if (!definition) return 'No definition available';
    const maxLength = 100;
    if (definition.length <= maxLength) return definition;
    return definition.substring(0, maxLength).trim() + '...';
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dictionary-page">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <h2>🏥 Medi-Chat</h2>
          </div>
          <div className="nav-actions">
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate('/search')}
            >
              AI Simplifier
            </button>
            <span className="nav-user-email">{userEmail}</span>
            <button className="btn btn-secondary" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container">
        <div className="dictionary-section">
          <div className="dictionary-header">
            <h1>
              <Book size={32} className="header-icon" />
              Medical Dictionary
            </h1>
            <p className="subtitle">
              Browse and search medical terms. Click on any term to see the full definition and why it matters.
            </p>
          </div>

          <div className="search-container">
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-input-wrapper">
                <SearchIcon className="search-icon" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search medical terms..."
                  className="search-input"
                />
              </div>
              <button type="submit" className="btn btn-primary search-btn">
                Search
              </button>
            </form>
          </div>

          {isLoading ? (
            <div className="loading-container">
              <div className="spinner">⏳ Loading terms...</div>
            </div>
          ) : (
            <>
              <div className="terms-count">
                Showing {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'}
                {searchQuery && ` for "${searchQuery}"`}
              </div>

              {filteredTerms.length === 0 ? (
                <div className="no-results">
                  <Book size={48} className="no-results-icon" />
                  <p>No terms found. Try a different search query.</p>
                </div>
              ) : (
                <div className="terms-grid">
                  {filteredTerms.map((term) => (
                    <div
                      key={term.id}
                      className="term-card"
                      onClick={() => handleTermClick(term)}
                    >
                      <div className="term-card-header">
                        <h3 className="term-title">{term.medical_term}</h3>
                        <Info size={18} className="info-icon" />
                      </div>
                      <p className="term-blurb">{getShortBlurb(term.definition)}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal for term details */}
      {showModal && selectedTerm && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>
              <X size={24} />
            </button>
            <div className="modal-header">
              <h2 className="modal-title">{selectedTerm.medical_term}</h2>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3 className="modal-section-title">Definition</h3>
                <p className="modal-definition">{selectedTerm.definition}</p>
              </div>
              {selectedTerm.why_matters && (
                <div className="modal-section">
                  <h3 className="modal-section-title">Why It Matters</h3>
                  <p className="modal-why-matters">{selectedTerm.why_matters}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dictionary;

