import React, { useState, useEffect } from 'react';

// PUBLIC_INTERFACE
/**
 * Main HideSeek Online game container.
 * - Handles state for players, AI, map/location, hiding spots, turn phase, timer, and scores.
 * - UI sections: location/map picker, game area (clickable map), sidebar (timer, player list), round results popup.
 * Multiplayer sync and AI computations are stubbed.
 * Color scheme: primary (#4CAF50), secondary (#FFC107), accent (#2196F3). Theme: light.
 */
function HideSeekGameContainer() {
  // Game Phases: 'lobby', 'hiding', 'seeking', 'results'
  const [phase, setPhase] = useState('lobby');
  const [location, setLocation] = useState(null);
  const [players, setPlayers] = useState([
    { id: 1, name: 'You', isAI: false },
    { id: 2, name: 'Player 2', isAI: true },
    { id: 3, name: 'Player 3', isAI: true },
  ]);
  const [hidingSpots, setHidingSpots] = useState([]);
  const [chosenHidingSpots, setChosenHidingSpots] = useState({}); // {playerId: spotId}
  const [seekerId, setSeekerId] = useState(1); // Rotates between players
  const [timer, setTimer] = useState(60);
  const [results, setResults] = useState(null); // { found: [ids], missed: [ids] }

  // Demo locations (can be expanded)
  const locationOptions = [
    {
      id: 'park',
      name: 'Sunny Park',
      mapImage: '', // placeholder, could be set to a static asset
      spots: [
        { id: 'bush', label: 'Behind the bush', x: 40, y: 60 },
        { id: 'tree', label: 'Behind the tree', x: 60, y: 25 },
        { id: 'bench', label: 'Under the bench', x: 25, y: 77 },
        { id: 'slide', label: 'Inside the slide', x: 72, y: 48 },
      ],
    },
    {
      id: 'house',
      name: 'Spooky House',
      mapImage: '',
      spots: [
        { id: 'closet', label: 'In the closet', x: 30, y: 35 },
        { id: 'sofa', label: 'Behind the sofa', x: 70, y: 60 },
        { id: 'bed', label: 'Under the bed', x: 40, y: 80 },
        { id: 'stairs', label: 'Behind the stairs', x: 60, y: 20 },
      ],
    },
    {
      id: 'school',
      name: 'Old School',
      mapImage: '',
      spots: [
        { id: 'locker', label: 'In a locker', x: 30, y: 50 },
        { id: 'desk', label: 'Beneath the desk', x: 60, y: 22 },
        { id: 'stage', label: 'Behind the stage', x: 48, y: 76 },
        { id: 'bookshelf', label: 'Behind bookshelf', x: 77, y: 67 },
      ],
    },
  ];

  // Start the game after location chosen
  const startGame = () => {
    setHidingSpots(location.spots);
    setChosenHidingSpots({});
    setPhase('hiding');
    setTimer(30);
    setResults(null);
  };

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

  // Hider picks a hiding spot
  function handleHidingSpotPick(playerId, spotId) {
    setChosenHidingSpots(prev => ({
      ...prev,
      [playerId]: spotId,
    }));
  }

  // Seeker clicks a spot
  function handleSeekSpotClick(spotId) {
    // If seeker guesses and is right, add to found list (stub for now)
    if (!results) {
      const found = Object.entries(chosenHidingSpots).filter(
        ([pid, sId]) => parseInt(pid, 10) !== seekerId && sId === spotId
      );
      let res = { found: [], missed: [] };
      found.forEach(([pid]) => (res.found.push(Number(pid))));
      const allHiders = players.filter(p => p.id !== seekerId).map(p => p.id);
      res.missed = allHiders.filter(hid => !res.found.includes(hid));
      setResults(res);
      setPhase('results');
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

  // Go to next round (rotate seeker, reset hiding spots)
  function nextRound() {
    setSeekerId(prev => {
      const idx = players.findIndex(p => p.id === prev);
      return players[(idx + 1) % players.length].id;
    });
    setChosenHidingSpots({});
    setHidingSpots(location.spots);
    setPhase('hiding');
    setTimer(30);
    setResults(null);
  }

  // UI Renders
  // Lobby: Location Picker
  function renderLobby() {
    return (
      <div className="game-lobby-picker">
        <h2>Choose a Location</h2>
        <div className="location-options-row">
          {locationOptions.map(loc => (
            <button
              key={loc.id}
              onClick={() => handleLocationSelect(loc.id)}
              style={{
                background: "#fff",
                border: `2px solid #4CAF50`,
                color: "#333",
                borderRadius: 10,
                margin: "0 18px 16px 0",
                padding: "22px 36px",
                minWidth: 150,
                minHeight: 70,
                fontSize: 18,
                cursor: "pointer",
                boxShadow: "0 2px 8px #e0e0e0",
                transition: "all 0.2s"
              }}
            >
              {loc.name}
            </button>
          ))}
        </div>
        {location && (
          <button
            className="btn"
            style={{
              backgroundColor: "#4CAF50",
              color: "#fff",
              marginTop: "30px",
              fontWeight: "600",
              fontSize: 20,
              padding: "12px 32px",
              borderRadius: 8,
            }}
            onClick={startGame}
          >
            Start Game
          </button>
        )}
      </div>
    );
  }

  // Main Game Map (scene with clickable spots)
  function renderGameMap() {
    if (!hidingSpots || hidingSpots.length === 0) return null;
    const currentPlayer = players.find(p => p.id === seekerId);

    // Determine which spots are selectable
    let selectableSpots = [];
    if (phase === 'hiding') {
      // Only hiders (not current seeker) may pick
      selectableSpots = hidingSpots.map(s => s.id);
    } else if (phase === 'seeking') {
      // Only seeker can click to seek
      selectableSpots = hidingSpots.map(s => s.id);
    }

    // Minimal graphic for the map (use a colored div + spots as buttons/circles)
    return (
      <div
        className="game-map-area"
        style={{
          position: "relative",
          width: "380px",
          height: "320px",
          margin: "0 auto",
          background: "#f8f8f8",
          borderRadius: "16px",
          border: `3px solid #2196F3`,
        }}
      >
        {/* Map Title */}
        <div style={{
          position: "absolute",
          top: 10,
          left: 16,
          color: "#2196F3",
          fontWeight: "700",
          fontSize: 22
        }}>
          {location.name}
        </div>
        {/* Spots */}
        {hidingSpots.map((spot, i) => {
          // Place dot button at X%,Y% location
          const isSelectedBy = Object.entries(chosenHidingSpots).find(
            ([pid, sid]) => sid === spot.id
          );
          return (
            <button
              key={spot.id}
              disabled={
                !selectableSpots.includes(spot.id) ||
                (phase === 'hiding' &&
                  chosenHidingSpots[1] && // Only allow each hider one pick
                  spot.id !== chosenHidingSpots[1])
              }
              onClick={() => {
                if (phase === 'hiding') handleHidingSpotPick(1, spot.id);
                if (phase === 'seeking') handleSeekSpotClick(spot.id);
              }}
              style={{
                position: "absolute",
                left: `calc(${spot.x}% - 18px)`,
                top: `calc(${spot.y}% - 18px)`,
                width: 36,
                height: 36,
                backgroundColor:
                  phase === 'hiding'
                    ? "#FFC107"
                    : phase === 'seeking'
                      ? "#2196F3"
                      : "#4CAF50",
                color: "#fff",
                borderRadius: "50%",
                border:
                  isSelectedBy ? "3px solid #4CAF50" : "2px solid #ddd",
                fontWeight: 600,
                fontSize: 20,
                cursor: "pointer",
                zIndex: 2,
                opacity:
                  (phase === 'hiding' &&
                    chosenHidingSpots[1] &&
                    spot.id !== chosenHidingSpots[1])
                    ? 0.4
                    : 1,
                boxShadow: isSelectedBy ? "0 0 8px #4CAF50AA" : "0 2px 6px #ddd",
                transition: "background 0.15s, border 0.2s, box-shadow 0.2s"
              }}
              title={spot.label}
            >
              {i + 1}
            </button>
          );
        })}
      </div>
    );
  }

  // Sidebar: Timer and Players List
  function renderSidebar() {
    const currentSeeker = players.find(p => p.id === seekerId);
    return (
      <div className="side-bar"
        style={{
          background: "#fff",
          color: "#444",
          borderRadius: 16,
          boxShadow: "0 1px 12px #efefef",
          padding: "24px 24px",
          margin: "24px 0 0 0",
          minWidth: 180,
          minHeight: 220,
          position: "relative"
        }}
      >
        <div style={{
          borderLeft: `5px solid #2196F3`,
          paddingLeft: 10,
          marginBottom: 16,
          fontSize: 22,
          fontWeight: 600,
        }}>
          Timer:
          <span style={{
            marginLeft: 10,
            fontWeight: 700,
            color: timer <= 5 ? '#D32F2F' : '#4CAF50'
          }}>{timer}s</span>
        </div>
        <div>
          <div style={{
            color: "#2196F3",
            fontWeight: 600,
            fontSize: 17,
            marginBottom: 8,
          }}>Players:</div>
          <ul style={{
            listStyle: "none",
            padding: 0
          }}>
            {players.map(p => (
              <li key={p.id}
                style={{
                  marginBottom: 6,
                  color: p.id === seekerId ? "#FFC107" : "#222",
                  fontWeight: p.id === seekerId ? "bold" : "normal"
                }}>
                {p.name} {p.id === seekerId ? "(Seeker)" : ""}
                {p.isAI && (
                  <span style={{
                    fontSize: 13, marginLeft: 6, color: "#888"
                  }}>🤖</span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div style={{
          position: "absolute",
          bottom: 18,
          left: 0,
          width: "100%",
          fontSize: 13,
          color: "#8d8d8d"
        }}>
          <span style={{
            color: "#2196F3",
            fontWeight: 500
          }}>{phase === "hiding" ? "Hiding..." : phase === "seeking" ? "Seeking..." : ""}</span>
        </div>
      </div>
    );
  }

  // Round Results Modal/Popup
  function renderResultsPopup() {
    if (!results) return null;
    const foundNames = players.filter(p => results.found.includes(p.id)).map(p => p.name);
    const missedNames = players.filter(p => results.missed.includes(p.id)).map(p => p.name);
    return (
      <div style={{
        position: "fixed", left: 0, top: 0, width: "100vw", height: "100vh",
        background: "rgba(33,150,243,0.10)",
        zIndex: 1000, display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{
          minWidth: 280,
          maxWidth: 400,
          background: "#fff",
          border: "4px solid #4CAF50",
          borderRadius: 18,
          boxShadow: "0 0 18px #2196F3A0",
          padding: 32,
          color: "#222",
          textAlign: "center"
        }}>
          <h2 style={{
            fontWeight: 700,
            color: "#2196F3",
          }}>Round Results</h2>
          <div style={{
            margin: "20px 0 10px",
            fontSize: 18
          }}>
            <b style={{ color: "#4CAF50" }}>Found:</b>
            {foundNames.length > 0 ? (
              <span> {foundNames.join(', ')}</span>
            ) : <span> None</span>}
          </div>
          <div style={{
            fontSize: 18
          }}>
            <b style={{ color: "#FFC107" }}>Missed:</b>
            {missedNames.length > 0 ? (
              <span> {missedNames.join(', ')}</span>
            ) : <span> None</span>}
          </div>
          <div style={{
            margin: "20px 0 10px",
            color: "#888",
            fontSize: 15
          }}>
            (Scores/stats logic placeholder)
          </div>
          <button
            className="btn"
            style={{
              backgroundColor: "#4CAF50",
              color: "#fff",
              marginTop: "18px",
              fontWeight: "600",
              fontSize: 20,
              padding: "10px 32px",
              borderRadius: 8,
            }}
            onClick={nextRound}
          >
            Next Round
          </button>
        </div>
      </div>
    );
  }

  // Main layout
  return (
    <div
      className="hideseek-game-root"
      style={{
        background: "#f6f9fb",
        minHeight: "100vh",
        width: "100vw",
        paddingTop: 64,
      }}
    >
      <div style={{
        maxWidth: 1140,
        margin: "0 auto",
        display: "flex",
        flexDirection: "row",
        gap: 38,
        justifyContent: "center",
        alignItems: "flex-start",
        paddingTop: 54
      }}>
        <div style={{ flexGrow: 0, flexShrink: 0, width: 420 }}>
          {phase === "lobby" && renderLobby()}
          {["hiding", "seeking"].includes(phase) && renderGameMap()}
        </div>
        <div style={{ flexGrow: 0, flexShrink: 0 }}>
          {phase !== "lobby" && renderSidebar()}
        </div>
      </div>
      {phase === "results" && renderResultsPopup()}
    </div>
  );
}

export default HideSeekGameContainer;
