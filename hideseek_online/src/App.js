import React, { useState } from 'react';
import './App.css';
import HideSeekGameContainer from './HideSeekGameContainer';

function App() {
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const toggleHowToPlay = () => {
    setShowHowToPlay(!showHowToPlay);
  };

  return (
    <div className="app">
      <nav className="navbar">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div className="logo">
              <span className="logo-symbol">*</span> HideSeek Online
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <button
                className="btn accent navbar-btn"
                onClick={toggleHowToPlay}
                aria-label="Open How to Play instructions"
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  borderRadius: '6px',
                  background: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#1976d2';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'var(--accent)';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                ❓ How to Play
              </button>
              
              <span style={{color: "#4CAF50", fontWeight: 700}}>v1</span>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <HideSeekGameContainer 
          showHowToPlay={showHowToPlay}
          setShowHowToPlay={setShowHowToPlay}
          toggleHowToPlay={toggleHowToPlay}
        />
      </main>
    </div>
  );
}

export default App;