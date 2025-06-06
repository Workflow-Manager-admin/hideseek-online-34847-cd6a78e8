import React, { useState, useEffect, useRef } from 'react';
import './HideSeekGameStyles.css';

// PUBLIC_INTERFACE
/**
 * Enhanced HideSeek Online game container with comprehensive features.
 * Features include: animated transitions, player avatars/nicknames, lobby system,
 * improved location selector, chat panel, mini-leaderboard, accessibility improvements,
 * and responsive design with light theme and specified color palette.
 * Multiplayer sync and AI computations are stubbed but UI designed as if functional.
 * @param {boolean} showHowToPlay - Controls visibility of How to Play modal
 * @param {function} setShowHowToPlay - Function to set How to Play modal visibility
 * @param {function} toggleHowToPlay - Function to toggle How to Play modal
 */
function HideSeekGameContainer({ showHowToPlay, setShowHowToPlay, toggleHowToPlay }) {
  // Game Phases: 'lobby', 'hiding', 'seeking', 'results'
  const [phase, setPhase] = useState('lobby');
  const [location, setLocation] = useState(null);
  
  // Enhanced player management with avatars and nicknames
  const [players, setPlayers] = useState([
    { id: 1, name: 'You', isAI: false, avatar: '😊', ready: false, score: 0 },
    { id: 2, name: 'Alex', isAI: true, avatar: '🤖', ready: true, score: 0 },
    { id: 3, name: 'Sam', isAI: true, avatar: '🎭', ready: true, score: 0 },
  ]);
  
  // User customization
  const [playerNickname, setPlayerNickname] = useState('You');
  const [selectedAvatar, setSelectedAvatar] = useState('😊');
  const [userReady, setUserReady] = useState(false);
  
  // Game state
  const [hidingSpots, setHidingSpots] = useState([]);
  const [chosenHidingSpots, setChosenHidingSpots] = useState({}); // {playerId: spotId}
  const [seekerId, setSeekerId] = useState(1); // Rotates between players
  const [timer, setTimer] = useState(60);
  const [results, setResults] = useState(null); // { found: [ids], missed: [ids] }
  
  // UI enhancements
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, author: 'System', text: 'Welcome to HideSeek Online!', timestamp: Date.now() },
    { id: 2, author: 'Alex', text: 'Ready to play!', timestamp: Date.now() + 1000 },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedHidingSpot, setSelectedHidingSpot] = useState(null);
  
  // Refs for accessibility
  const chatInputRef = useRef(null);
  const gameMapRef = useRef(null);
  
  // Available avatars for selection
  const avatarOptions = ['😊', '😎', '🤓', '😄', '🙂', '😃', '🤔', '😊', '🎭', '🤖', '👽', '🦄'];
  
  // Mini leaderboard data (stubbed)
  const leaderboardData = [
    { rank: 1, name: 'Alex', score: 15 },
    { rank: 2, name: 'You', score: 12 },
    { rank: 3, name: 'Sam', score: 8 },
  ];

  // Enhanced demo locations with descriptions and preview icons
  const locationOptions = [
    {
      id: 'park',
      name: 'Sunny Park',
      description: 'A beautiful park with trees, benches, and playground equipment',
      icon: '🌳',
      spots: [
        { id: 'bush', label: 'Behind the bush', x: 40, y: 60, description: 'Hide behind the flowering bush' },
        { id: 'tree', label: 'Behind the tree', x: 60, y: 25, description: 'Climb behind the oak tree' },
        { id: 'bench', label: 'Under the bench', x: 25, y: 77, description: 'Crouch under the park bench' },
        { id: 'slide', label: 'Inside the slide', x: 72, y: 48, description: 'Hide inside the playground slide' },
      ],
    },
    {
      id: 'house',
      name: 'Cozy House',
      description: 'A warm family home with many hiding spots',
      icon: '🏠',
      spots: [
        { id: 'closet', label: 'In the closet', x: 30, y: 35, description: 'Hide among the clothes' },
        { id: 'sofa', label: 'Behind the sofa', x: 70, y: 60, description: 'Squeeze behind the couch' },
        { id: 'bed', label: 'Under the bed', x: 40, y: 80, description: 'Classic hiding spot under the bed' },
        { id: 'stairs', label: 'Behind the stairs', x: 60, y: 20, description: 'Hide in the space under the stairs' },
      ],
    },
    {
      id: 'school',
      name: 'Old School',
      description: 'An abandoned school with mysterious hiding places',
      icon: '🏫',
      spots: [
        { id: 'locker', label: 'In a locker', x: 30, y: 50, description: 'Squeeze into an empty locker' },
        { id: 'desk', label: 'Beneath the desk', x: 60, y: 22, description: 'Hide under the teacher\'s desk' },
        { id: 'stage', label: 'Behind the stage', x: 48, y: 76, description: 'Hide behind the auditorium stage' },
        { id: 'bookshelf', label: 'Behind bookshelf', x: 77, y: 67, description: 'Hide behind the tall bookshelf' },
      ],
    },
    {
      id: 'castle',
      name: 'Medieval Castle',
      description: 'An ancient castle with secret passages and towers',
      icon: '🏰',
      spots: [
        { id: 'tower', label: 'In the tower', x: 20, y: 20, description: 'Climb to the castle tower' },
        { id: 'dungeon', label: 'In the dungeon', x: 80, y: 80, description: 'Hide in the dark dungeon' },
        { id: 'throne', label: 'Behind the throne', x: 50, y: 40, description: 'Hide behind the royal throne' },
        { id: 'armory', label: 'In the armory', x: 30, y: 70, description: 'Hide among the suits of armor' },
      ],
    },
  ];

  // Enhanced player management functions
  const updatePlayerNickname = (nickname) => {
    setPlayerNickname(nickname);
    setPlayers(prev => prev.map(p => 
      p.id === 1 ? { ...p, name: nickname } : p
    ));
  };

  const updatePlayerAvatar = (avatar) => {
    setSelectedAvatar(avatar);
    setPlayers(prev => prev.map(p => 
      p.id === 1 ? { ...p, avatar } : p
    ));
  };

  const toggleReady = () => {
    const newReadyState = !userReady;
    setUserReady(newReadyState);
    setPlayers(prev => prev.map(p => 
      p.id === 1 ? { ...p, ready: newReadyState } : p
    ));
  };

  // Check if all players are ready
  const allPlayersReady = players.every(p => p.ready);

  // Start the game after location chosen and all players ready
  const startGame = () => {
    if (!location || !allPlayersReady) return;
    
    setHidingSpots(location.spots);
    setChosenHidingSpots({});
    setPhase('hiding');
    setTimer(30);
    setResults(null);
    
    // Add system message to chat
    addChatMessage('System', `Game starting at ${location.name}!`);
  };

  // Chat functionality
  const addChatMessage = (author, text) => {
    const newMessage = {
      id: Date.now(),
      author,
      text,
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newMessage]);
  };

  const sendChatMessage = () => {
    if (chatInput.trim()) {
      addChatMessage(playerNickname, chatInput);
      setChatInput('');
      
      // Simulate AI responses (stubbed)
      if (Math.random() > 0.7) {
        setTimeout(() => {
          const aiResponses = [
            'Good luck everyone!',
            'This location looks tricky!',
            'I found a great hiding spot!',
            'The seeker is getting close!',
            'Nice hiding spot!'
          ];
          const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
          const aiPlayer = players.find(p => p.isAI && Math.random() > 0.5);
          if (aiPlayer) {
            addChatMessage(aiPlayer.name, randomResponse);
          }
        }, 1000 + Math.random() * 2000);
      }
    }
  };

  const handleChatKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  };

  // Handle keyboard events for How to Play modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && showHowToPlay) {
        setShowHowToPlay(false);
      }
    };

    if (showHowToPlay) {
      document.addEventListener('keydown', handleKeyDown);
      // Focus management for accessibility
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [showHowToPlay, setShowHowToPlay]);

  // Handle ticking timer during hiding/seeking phase
  useEffect(() => {
    if (phase !== 'hiding' && phase !== 'seeking') return;
    if (timer === 0) {
      if (phase === 'hiding') autoHideForAll();
      if (phase === 'seeking') finishRound();
      return;
    }
    const t = setTimeout(() => setTimer(timer - 1), 1000);
    return () => clearTimeout(t);
  }, [timer, phase]);

  // When all hiders have picked, move to seeking
  useEffect(() => {
    if (phase === 'hiding') {
      const numHiders = players.length - 1;
      if (Object.keys(chosenHidingSpots).length >= numHiders) {
        // Small delay before proceeding
        setTimeout(() => {
          setPhase('seeking');
          setTimer(45);
        }, 700);
      }
    }
  }, [chosenHidingSpots, phase, players.length]);

  // Lobby: Select location.
  function handleLocationSelect(locId) {
    const loc = locationOptions.find(l => l.id === locId);
    setLocation(loc);
  }

  // Enhanced hiding spot selection with feedback
  function handleHidingSpotPick(playerId, spotId) {
    setChosenHidingSpots(prev => ({
      ...prev,
      [playerId]: spotId,
    }));
    
    setSelectedHidingSpot(spotId);
    
    // Add chat message for hiding
    const spot = hidingSpots.find(s => s.id === spotId);
    if (spot && playerId === 1) {
      addChatMessage('System', `You chose to hide ${spot.label}`);
    }
    
    // Simulate AI hiding choices and chat messages
    setTimeout(() => {
      const aiPlayers = players.filter(p => p.isAI && p.id !== seekerId);
      aiPlayers.forEach(ai => {
        if (!chosenHidingSpots[ai.id] && Math.random() > 0.3) {
          const availableSpots = hidingSpots.filter(s => 
            !Object.values(chosenHidingSpots).includes(s.id)
          );
          if (availableSpots.length > 0) {
            const randomSpot = availableSpots[Math.floor(Math.random() * availableSpots.length)];
            setChosenHidingSpots(prev => ({
              ...prev,
              [ai.id]: randomSpot.id,
            }));
            addChatMessage(ai.name, 'I found my hiding spot! 🤫');
          }
        }
      });
    }, 500 + Math.random() * 2000);
  }

  // Enhanced seeker spot clicking with visual feedback
  function handleSeekSpotClick(spotId) {
    if (!results) {
      const found = Object.entries(chosenHidingSpots).filter(
        ([pid, sId]) => parseInt(pid, 10) !== seekerId && sId === spotId
      );
      
      let res = { found: [], missed: [] };
      found.forEach(([pid]) => (res.found.push(Number(pid))));
      const allHiders = players.filter(p => p.id !== seekerId).map(p => p.id);
      res.missed = allHiders.filter(hid => !res.found.includes(hid));
      
      // Update scores
      const foundCount = res.found.length;
      setPlayers(prev => prev.map(p => {
        if (p.id === seekerId) {
          return { ...p, score: p.score + foundCount * 10 };
        }
        if (res.missed.includes(p.id)) {
          return { ...p, score: p.score + 5 }; // Bonus for not being found
        }
        return p;
      }));
      
      setResults(res);
      setPhase('results');
      
      // Add results to chat
      if (found.length > 0) {
        const foundNames = players.filter(p => res.found.includes(p.id)).map(p => p.name);
        addChatMessage('System', `Found: ${foundNames.join(', ')}!`);
      } else {
        addChatMessage('System', 'No one was found in that spot!');
      }
    }
  }

  // Fallback if a hider doesn't pick in time (AI/autopick)
  function autoHideForAll() {
    const hiderIds = players.filter(p => p.id !== seekerId).map(p => p.id);
    let filled = { ...chosenHidingSpots };
    hiderIds.forEach(id => {
      if (!filled[id]) {
        const availableSpots = hidingSpots.map(s => s.id);
        filled[id] = availableSpots[Math.floor(Math.random() * availableSpots.length)];
      }
    });
    setChosenHidingSpots(filled);
    setPhase('seeking');
    setTimer(45);
  }

  // End of round: calculate simplified results for demo.
  function finishRound() {
    // For now, reveal all and mark random ones found for demo
    const allHiders = players.filter(p => p.id !== seekerId).map(p => p.id);
    let found = [];
    if (allHiders.length) {
      found = [allHiders[Math.floor(Math.random() * allHiders.length)]];
    }
    let missed = allHiders.filter(id => !found.includes(id));
    setResults({ found, missed });
    setPhase('results');
  }

  // Enhanced next round with proper state management
  function nextRound() {
    const newSeekerId = (() => {
      const idx = players.findIndex(p => p.id === seekerId);
      return players[(idx + 1) % players.length].id;
    })();
    
    setSeekerId(newSeekerId);
    setChosenHidingSpots({});
    setSelectedHidingSpot(null);
    setHidingSpots(location.spots);
    setPhase('hiding');
    setTimer(30);
    setResults(null);
    
    const newSeeker = players.find(p => p.id === newSeekerId);
    addChatMessage('System', `New round! ${newSeeker.name} is now the seeker.`);
  }

  // Return to lobby
  function returnToLobby() {
    setPhase('lobby');
    setLocation(null);
    setChosenHidingSpots({});
    setSelectedHidingSpot(null);
    setHidingSpots([]);
    setResults(null);
    setTimer(60);
    
    // Reset ready states
    setUserReady(false);
    setPlayers(prev => prev.map(p => ({ ...p, ready: p.isAI })));
    
    addChatMessage('System', 'Returned to lobby. Choose a new location!');
  }

  // Enhanced lobby with player customization and waiting room
  function renderLobby() {
    return (
      <div className="game-lobby-container" role="main" aria-label="Game Lobby">
        <h1 className="lobby-title">HideSeek Online</h1>
        <p className="lobby-subtitle">Customize your player and choose a location to start!</p>
        
        {/* Player Customization Section */}
        <div className="player-management" role="region" aria-label="Player Customization">
          <h2>Customize Your Player</h2>
          
          <div className="nickname-input-group">
            <label htmlFor="nickname-input" className="sr-only">Enter your nickname</label>
            <input
              id="nickname-input"
              type="text"
              className="nickname-input"
              placeholder="Enter your nickname"
              value={playerNickname}
              onChange={(e) => updatePlayerNickname(e.target.value)}
              maxLength={20}
              aria-describedby="nickname-help"
            />
            <button
              className="btn secondary"
              onClick={toggleReady}
              disabled={!playerNickname.trim()}
              aria-pressed={userReady}
            >
              {userReady ? '✓ Ready' : 'Ready?'}
            </button>
          </div>
          <div id="nickname-help" className="sr-only">
            Enter a nickname up to 20 characters long
          </div>
          
          <div className="avatar-selection" role="group" aria-label="Choose your avatar">
            <h3>Choose Your Avatar</h3>
            <div className="avatar-grid">
              {avatarOptions.map((avatar, index) => (
                <button
                  key={index}
                  className={`avatar-option ${selectedAvatar === avatar ? 'selected' : ''}`}
                  onClick={() => updatePlayerAvatar(avatar)}
                  aria-label={`Select avatar ${avatar}`}
                  aria-pressed={selectedAvatar === avatar}
                  title={`Avatar option: ${avatar}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Players List */}
        <div className="lobby-players-list" role="region" aria-label="Players in lobby">
          <h3>Players ({players.length}/4)</h3>
          {players.map(player => (
            <div key={player.id} className="player-item">
              <div className="player-avatar" aria-hidden="true">{player.avatar}</div>
              <div className="player-info">
                <div className="player-name">{player.name}</div>
                <div className="player-status">
                  {player.isAI ? '🤖 AI Player' : '👤 Human'}
                  {player.ready && <span className="ready-indicator">Ready</span>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Location Selection */}
        <div className="location-selection" role="region" aria-label="Location Selection">
          <h3>Choose a Location</h3>
          <div className="location-grid">
            {locationOptions.map(loc => (
              <button
                key={loc.id}
                className={`location-card ${location?.id === loc.id ? 'selected' : ''}`}
                onClick={() => handleLocationSelect(loc.id)}
                aria-pressed={location?.id === loc.id}
                data-tooltip={loc.description}
              >
                <div className="location-preview" aria-hidden="true">
                  {loc.icon}
                </div>
                <div className="location-name">{loc.name}</div>
                <div className="location-description">{loc.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            className="btn accent"
            onClick={toggleHowToPlay}
            style={{ marginBottom: '15px', marginRight: '10px' }}
            aria-label="Open How to Play instructions"
          >
            ❓ How to Play
          </button>
          
          {/* Start Game Button */}
          {location && (
            <>
              <button
                className={`btn btn-large ${allPlayersReady ? 'btn-ready' : ''}`}
                onClick={startGame}
                disabled={!allPlayersReady}
                aria-describedby="start-game-help"
                style={{ display: 'block', margin: '0 auto' }}
              >
                {allPlayersReady ? '🎮 Start Game!' : 'Waiting for players...'}
              </button>
              <div id="start-game-help" className="sr-only">
                {allPlayersReady 
                  ? 'All players are ready. Click to start the game.' 
                  : 'Waiting for all players to be ready before starting.'
                }
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Enhanced game map with improved accessibility and visual feedback
  function renderGameMap() {
    if (!hidingSpots || hidingSpots.length === 0) return null;
    const currentSeeker = players.find(p => p.id === seekerId);

    // Determine which spots are selectable
    let selectableSpots = [];
    if (phase === 'hiding') {
      selectableSpots = hidingSpots.map(s => s.id);
    } else if (phase === 'seeking') {
      selectableSpots = hidingSpots.map(s => s.id);
    }

    const getInstructionText = () => {
      if (phase === 'hiding') {
        return chosenHidingSpots[1] 
          ? 'Waiting for other players to hide...' 
          : 'Click a spot to hide!';
      } else if (phase === 'seeking') {
        return `${currentSeeker.name} is seeking. Click spots to find hiders!`;
      }
      return '';
    };

    return (
      <div className="game-map-container">
        <div
          ref={gameMapRef}
          className="game-map-area"
          role="application"
          aria-label={`Game map: ${location.name}`}
          aria-describedby="map-instructions"
        >
          <h2 className="map-title">{location.name}</h2>
          
          <div id="map-instructions" className="map-instructions">
            {getInstructionText()}
          </div>

          {/* Enhanced hiding spots with better accessibility */}
          {hidingSpots.map((spot, i) => {
            const isSelectedBy = Object.entries(chosenHidingSpots).find(
              ([pid, sid]) => sid === spot.id
            );
            const isMySelection = chosenHidingSpots[1] === spot.id;
            const isDisabled = !selectableSpots.includes(spot.id) ||
              (phase === 'hiding' && chosenHidingSpots[1] && !isMySelection);

            return (
              <button
                key={spot.id}
                className={`hiding-spot focusable tooltip
                  ${phase === 'hiding' ? 'hiding-phase' : 'seeking-phase'}
                  ${isMySelection ? 'selected' : ''}
                  ${isDisabled ? 'disabled' : ''}
                `}
                disabled={isDisabled}
                onClick={() => {
                  if (phase === 'hiding') handleHidingSpotPick(1, spot.id);
                  if (phase === 'seeking') handleSeekSpotClick(spot.id);
                }}
                style={{
                  left: `calc(${spot.x}% - 20px)`,
                  top: `calc(${spot.y}% - 20px)`,
                }}
                aria-label={`${spot.label} - ${spot.description}`}
                aria-pressed={isMySelection}
                data-tooltip={spot.description}
                title={spot.description}
              >
                <span className="sr-only">{spot.label}</span>
                {i + 1}
              </button>
            );
          })}

          {/* Visual indicators for selected spots during results */}
          {phase === 'results' && Object.entries(chosenHidingSpots).map(([playerId, spotId]) => {
            const spot = hidingSpots.find(s => s.id === spotId);
            const player = players.find(p => p.id === parseInt(playerId));
            if (!spot || !player) return null;

            return (
              <div
                key={`result-${playerId}`}
                style={{
                  position: 'absolute',
                  left: `calc(${spot.x}% - 15px)`,
                  top: `calc(${spot.y}% - 35px)`,
                  background: 'rgba(76, 175, 80, 0.9)',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  zIndex: 10,
                  pointerEvents: 'none'
                }}
                aria-hidden="true"
              >
                {player.avatar} {player.name}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Enhanced sidebar with timer, players, and mini-leaderboard
  function renderSidebar() {
    const currentSeeker = players.find(p => p.id === seekerId);
    
    return (
      <div className="game-sidebar" role="complementary" aria-label="Game Information">
        {/* Timer Section */}
        <div className="sidebar-section">
          <div className="timer-display" role="timer" aria-live="polite">
            <div className="timer-label">Time Remaining</div>
            <div className={`timer-value ${timer <= 10 ? 'warning' : ''}`} aria-label={`${timer} seconds remaining`}>
              {timer}s
            </div>
          </div>
        </div>

        {/* Current Phase Indicator */}
        <div className="sidebar-section">
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <span className={`phase-indicator ${phase === 'hiding' ? 'phase-hiding' : phase === 'seeking' ? 'phase-seeking' : ''}`}>
              {phase === 'hiding' ? '🙈 Hiding Phase' : phase === 'seeking' ? '👁️ Seeking Phase' : 'Game Phase'}
            </span>
          </div>
          {currentSeeker && (
            <div style={{ textAlign: 'center', fontSize: '14px', color: 'var(--text-secondary)' }}>
              <strong>{currentSeeker.name}</strong> is the seeker
            </div>
          )}
        </div>

        {/* Players Section */}
        <div className="sidebar-section players-section">
          <h3>Players</h3>
          {players.map(player => (
            <div key={player.id} className="sidebar-player-item">
              <div className={`sidebar-player-avatar ${player.id === seekerId ? 'seeker-avatar' : ''}`}>
                {player.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>
                  {player.name}
                  {player.id === seekerId && <span style={{ marginLeft: '8px', fontSize: '12px' }}>👁️</span>}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {player.isAI ? '🤖 AI' : '👤 Human'} • Score: {player.score}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mini Leaderboard */}
        <div className="sidebar-section">
          <h3>Leaderboard</h3>
          <div className="mini-leaderboard">
            {leaderboardData.map(entry => (
              <div key={entry.rank} className="leaderboard-item">
                <span className="leaderboard-rank">#{entry.rank}</span>
                <span>{entry.name}</span>
                <span className="leaderboard-score">{entry.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Game Controls */}
        <div className="sidebar-section" style={{ borderBottom: 'none' }}>
          <button
            className="btn secondary"
            onClick={() => setShowChat(!showChat)}
            style={{ width: '100%', marginBottom: '10px' }}
            aria-expanded={showChat}
            aria-controls="chat-panel"
          >
            {showChat ? '💬 Hide Chat' : '💬 Show Chat'}
          </button>
          
          <button
            className="btn accent"
            onClick={toggleHowToPlay}
            style={{ width: '100%', marginBottom: '10px' }}
            aria-label="Open How to Play instructions"
          >
            ❓ How to Play
          </button>
          
          {phase !== 'lobby' && (
            <button
              className="btn"
              onClick={returnToLobby}
              style={{ width: '100%', fontSize: '14px' }}
            >
              🏠 Return to Lobby
            </button>
          )}
        </div>
      </div>
    );
  }

  // Enhanced chat panel component
  function renderChatPanel() {
    if (!showChat) return null;

    return (
      <div 
        id="chat-panel"
        className="chat-panel" 
        role="dialog" 
        aria-label="Game Chat"
        style={{ 
          position: 'fixed', 
          right: '20px', 
          top: '100px', 
          width: '300px',
          zIndex: 500 
        }}
      >
        <div className="chat-header">
          💬 Game Chat
          <button
            onClick={() => setShowChat(false)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer'
            }}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>
        
        <div 
          className="chat-messages" 
          role="log" 
          aria-live="polite" 
          aria-label="Chat messages"
        >
          {chatMessages.map(message => (
            <div key={message.id} className="chat-message">
              <div className="message-author">{message.author}</div>
              <div className="message-text">{message.text}</div>
            </div>
          ))}
        </div>
        
        <div className="chat-input-area">
          <div className="chat-input-group">
            <label htmlFor="chat-input" className="sr-only">Type a message</label>
            <input
              id="chat-input"
              ref={chatInputRef}
              type="text"
              className="chat-input"
              placeholder="Type a message..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleChatKeyPress}
              maxLength={200}
              disabled={phase === 'lobby'}
            />
            <button
              className="chat-send-btn"
              onClick={sendChatMessage}
              disabled={!chatInput.trim() || phase === 'lobby'}
              aria-label="Send message"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // How to Play modal component with comprehensive instructions
  function renderHowToPlayModal() {
    if (!showHowToPlay) return null;

    return (
      <div 
        className="how-to-play-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="how-to-play-title"
        onClick={(e) => e.target === e.currentTarget && setShowHowToPlay(false)}
      >
        <div className="how-to-play-modal">
          <div className="modal-header">
            <h2 id="how-to-play-title" className="how-to-play-title">
              ❓ How to Play HideSeek Online
            </h2>
            <button
              onClick={() => setShowHowToPlay(false)}
              className="modal-close-btn"
              aria-label="Close How to Play modal"
              autoFocus
            >
              ✕
            </button>
          </div>

          <div className="how-to-play-content">
            {/* Game Overview */}
            <section className="help-section">
              <h3>🎯 Game Overview</h3>
              <p>
                HideSeek Online is a digital hide-and-seek game where players take turns hiding 
                and seeking in virtual locations. One player becomes the seeker while others hide 
                in secret spots around the chosen location.
              </p>
            </section>

            {/* Getting Started */}
            <section className="help-section">
              <h3>🚀 Getting Started</h3>
              <div className="help-steps">
                <div className="help-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Choose Your Avatar</h4>
                    <p>Select from various emoji avatars to represent yourself in the game. Click on any avatar in the grid to choose it.</p>
                  </div>
                </div>
                <div className="help-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Set Your Nickname</h4>
                    <p>Enter a unique nickname (up to 20 characters) that other players will see during the game.</p>
                  </div>
                </div>
                <div className="help-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Mark Yourself Ready</h4>
                    <p>Click the "Ready" button when you're satisfied with your avatar and nickname. All players must be ready before starting.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Location Selection */}
            <section className="help-section">
              <h3>🗺️ Choosing a Location</h3>
              <p>Select from various themed locations where the hide-and-seek game will take place:</p>
              <ul className="help-list">
                <li><strong>🌳 Sunny Park:</strong> Hide behind trees, benches, and playground equipment</li>
                <li><strong>🏠 Cozy House:</strong> Use closets, beds, and furniture as hiding spots</li>
                <li><strong>🏫 Old School:</strong> Explore lockers, desks, and classroom areas</li>
                <li><strong>🏰 Medieval Castle:</strong> Discover towers, dungeons, and royal chambers</li>
              </ul>
            </section>

            {/* Game Phases */}
            <section className="help-section">
              <h3>⏱️ Game Phases</h3>
              <div className="help-steps">
                <div className="help-step">
                  <div className="phase-indicator phase-hiding">🙈 Hiding</div>
                  <div className="step-content">
                    <h4>Hiding Phase (30 seconds)</h4>
                    <p>All players except the seeker choose their hiding spots by clicking on numbered locations on the map. Choose wisely!</p>
                  </div>
                </div>
                <div className="help-step">
                  <div className="phase-indicator phase-seeking">👁️ Seeking</div>
                  <div className="step-content">
                    <h4>Seeking Phase (45 seconds)</h4>
                    <p>The seeker tries to find hidden players by clicking on spots where they think players are hiding. Found players are revealed!</p>
                  </div>
                </div>
                <div className="help-step">
                  <div className="phase-indicator">🏆 Results</div>
                  <div className="step-content">
                    <h4>Results Phase</h4>
                    <p>View who was found and who stayed hidden. Points are awarded and the next round begins with a new seeker.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Controls & Features */}
            <section className="help-section">
              <h3>🎮 Controls & Features</h3>
              <div className="help-grid">
                <div className="help-feature">
                  <h4>💬 Chat System</h4>
                  <p>Communicate with other players during the game. Toggle chat on/off using the chat button. Type messages and press Enter to send.</p>
                </div>
                <div className="help-feature">
                  <h4>⏰ Timer</h4>
                  <p>Keep track of remaining time during hiding and seeking phases. The timer changes color when time is running low!</p>
                </div>
                <div className="help-feature">
                  <h4>👥 Player List</h4>
                  <p>View all players, their avatars, scores, and see who is currently the seeker (marked with 👁️).</p>
                </div>
                <div className="help-feature">
                  <h4>🏆 Leaderboard</h4>
                  <p>Track player rankings and scores throughout multiple rounds of the game.</p>
                </div>
              </div>
            </section>

            {/* Scoring */}
            <section className="help-section">
              <h3>📊 Scoring System</h3>
              <ul className="help-list">
                <li><strong>Seeker:</strong> Earns 10 points for each player they find</li>
                <li><strong>Hiders:</strong> Earn 5 points if they remain hidden</li>
                <li><strong>Strategy:</strong> Balance between choosing obvious vs. creative hiding spots!</li>
              </ul>
            </section>

            {/* Tips & Strategies */}
            <section className="help-section">
              <h3>💡 Tips & Strategies</h3>
              <div className="help-tips">
                <div className="tip-item">
                  <strong>For Hiders:</strong> Don't always choose the most obvious spots. Sometimes the best hiding place is in plain sight!
                </div>
                <div className="tip-item">
                  <strong>For Seekers:</strong> Think about where you would hide and check popular spots first, but don't forget less obvious locations.
                </div>
                <div className="tip-item">
                  <strong>Use Chat:</strong> Communicate with other players to add fun and strategy to the game.
                </div>
                <div className="tip-item">
                  <strong>Watch the Timer:</strong> Don't take too long deciding on your hiding spot or seeking location.
                </div>
              </div>
            </section>

            {/* Accessibility */}
            <section className="help-section">
              <h3>♿ Accessibility Features</h3>
              <ul className="help-list">
                <li><strong>Keyboard Navigation:</strong> Use Tab to navigate, Enter to select, Escape to close modals</li>
                <li><strong>Screen Reader Support:</strong> All elements have proper labels and descriptions</li>
                <li><strong>High Contrast:</strong> Game adapts to high contrast system preferences</li>
                <li><strong>Focus Indicators:</strong> Clear visual focus indicators for all interactive elements</li>
              </ul>
            </section>
          </div>

          <div className="modal-footer">
            <button
              className="btn btn-large"
              onClick={() => setShowHowToPlay(false)}
            >
              🎮 Start Playing!
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced results modal with animations and detailed feedback
  function renderResultsPopup() {
    if (!results) return null;
    
    const foundPlayers = players.filter(p => results.found.includes(p.id));
    const missedPlayers = players.filter(p => results.missed.includes(p.id));
    const seeker = players.find(p => p.id === seekerId);
    
    return (
      <div 
        className="results-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="results-title"
        onClick={(e) => e.target === e.currentTarget && nextRound()}
      >
        <div className="results-modal">
          <h2 id="results-title" className="results-title">
            🎯 Round Results
          </h2>
          
          <div style={{ marginBottom: '20px', fontSize: '16px', color: 'var(--text-secondary)' }}>
            <strong>{seeker.name}</strong> was seeking this round
          </div>

          <div className="results-section">
            <div className="results-label found">
              🎉 Players Found ({foundPlayers.length})
            </div>
            <div className="results-list">
              {foundPlayers.length > 0 ? (
                foundPlayers.map(player => (
                  <div key={player.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    margin: '8px 0',
                    padding: '8px',
                    background: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '6px'
                  }}>
                    <span>{player.avatar}</span>
                    <span>{player.name}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: 'var(--primary)' }}>
                      +0 pts
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  No one was found! 🕵️
                </div>
              )}
            </div>
          </div>

          <div className="results-section">
            <div className="results-label missed">
              🤫 Players Still Hidden ({missedPlayers.length})
            </div>
            <div className="results-list">
              {missedPlayers.length > 0 ? (
                missedPlayers.map(player => (
                  <div key={player.id} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    margin: '8px 0',
                    padding: '8px',
                    background: 'rgba(255, 193, 7, 0.1)',
                    borderRadius: '6px'
                  }}>
                    <span>{player.avatar}</span>
                    <span>{player.name}</span>
                    <span style={{ marginLeft: 'auto', fontWeight: 'bold', color: 'var(--secondary)' }}>
                      +5 pts
                    </span>
                  </div>
                ))
              ) : (
                <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                  Everyone was found! 🔍
                </div>
              )}
            </div>
          </div>

          <div style={{ 
            margin: '25px 0 20px',
            padding: '15px',
            background: 'var(--base-light)',
            borderRadius: '8px',
            fontSize: '14px',
            color: 'var(--text-secondary)',
            textAlign: 'center'
          }}>
            <div>Next round: <strong>{players.find(p => {
              const idx = players.findIndex(pl => pl.id === seekerId);
              return p.id === players[(idx + 1) % players.length].id;
            })?.name}</strong> will be the seeker</div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
            <button
              className="btn btn-large"
              onClick={nextRound}
              autoFocus
            >
              🎮 Next Round
            </button>
            <button
              className="btn secondary"
              onClick={returnToLobby}
            >
              🏠 New Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced main layout with responsive design and accessibility
  return (
    <div className="hideseek-game-root">
      {/* Skip to main content link for accessibility */}
      <a 
        href="#main-content" 
        className="sr-only focusable"
        style={{
          position: 'absolute',
          left: '-9999px',
          zIndex: 999,
          padding: '8px 16px',
          background: 'var(--primary)',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '4px'
        }}
        onFocus={(e) => {
          e.target.style.left = '20px';
          e.target.style.top = '20px';
        }}
        onBlur={(e) => {
          e.target.style.left = '-9999px';
        }}
      >
        Skip to main content
      </a>

      <div 
        id="main-content"
        className="game-main-content"
        tabIndex="-1"
      >
        {/* Main Game Area */}
        <div style={{ flex: '1', minWidth: '0' }}>
          {phase === "lobby" && renderLobby()}
          {["hiding", "seeking"].includes(phase) && renderGameMap()}
        </div>

        {/* Sidebar - only show during active game phases */}
        {phase !== "lobby" && (
          <div style={{ flex: '0 0 300px' }}>
            {renderSidebar()}
          </div>
        )}
      </div>

      {/* Chat Panel - floating overlay */}
      {renderChatPanel()}

      {/* How to Play Modal */}
      {renderHowToPlayModal()}

      {/* Results Modal */}
      {phase === "results" && renderResultsPopup()}

      {/* Loading/Connection Status (stubbed) */}
      <div 
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '14px',
          fontWeight: '600',
          zIndex: 100
        }}
        role="status"
        aria-live="polite"
      >
        🟢 Connected • {players.length} players
      </div>

      {/* Accessibility announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
        id="game-announcements"
      >
        {/* Dynamic announcements will be added here via JavaScript */}
        {phase === 'hiding' && 'Hiding phase started. Choose your hiding spot.'}
        {phase === 'seeking' && `Seeking phase started. ${players.find(p => p.id === seekerId)?.name} is looking for hidden players.`}
        {phase === 'results' && 'Round completed. Results are displayed.'}
      </div>
    </div>
  );
}

export default HideSeekGameContainer;
