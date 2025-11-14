import React, { useState, useRef } from 'react';
import './CardManagement.css';

const CardManagement = ({
  numberOfTeams,
  customCards,
  onSaveCards,
  onBack
}) => {
  const [selectedTeam, setSelectedTeam] = useState(1);
  const [targetTeam, setTargetTeam] = useState(numberOfTeams >= 2 ? 2 : 1);
  const [cardName, setCardName] = useState('');
  const [cardDefinition, setCardDefinition] = useState('');
  const [cardDifficulty, setCardDifficulty] = useState(1);
  const [showImportError, setShowImportError] = useState('');
  const [showManageCards, setShowManageCards] = useState(false);
  const fileInputRef = useRef(null);

  // Get cards for selected team
  const teamCards = customCards[`team${selectedTeam}`] || [];

  // Get available target teams (all teams except the creating team)
  const getAvailableTargetTeams = () => {
    return Array.from({ length: numberOfTeams }, (_, i) => i + 1).filter(
      teamNum => teamNum !== selectedTeam
    );
  };

  // Update target team when selected team changes
  React.useEffect(() => {
    const availableTeams = Array.from({ length: numberOfTeams }, (_, i) => i + 1).filter(
      teamNum => teamNum !== selectedTeam
    );
    if (availableTeams.length > 0 && !availableTeams.includes(targetTeam)) {
      setTargetTeam(availableTeams[0]);
    }
  }, [selectedTeam, numberOfTeams, targetTeam]);

  const handleAddCard = () => {
    if (!cardName.trim()) {
      alert('Please enter a card name');
      return;
    }

    const targetTeamCards = customCards[`team${targetTeam}`] || [];

    const newCard = {
      id: `custom-team${targetTeam}-${Date.now()}`,
      name: cardName.trim(),
      difficulty: cardDifficulty,
      definition: cardDefinition.trim() || 'Custom card',
      team: targetTeam,
      custom: true,
      createdBy: selectedTeam // Track which team created the card
    };

    const updatedCards = {
      ...customCards,
      [`team${targetTeam}`]: [...targetTeamCards, newCard]
    };

    onSaveCards(updatedCards);

    // Reset form
    setCardName('');
    setCardDefinition('');
    setCardDifficulty(1);
  };

  const handleDeleteCard = (cardId) => {
    const updatedTeamCards = teamCards.filter(card => card.id !== cardId);
    const updatedCards = {
      ...customCards,
      [`team${selectedTeam}`]: updatedTeamCards
    };
    onSaveCards(updatedCards);
  };

  const handleImportJSON = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);

        // Validate structure
        if (typeof imported !== 'object') {
          throw new Error('Invalid JSON structure');
        }

        // Validate each team's cards
        Object.keys(imported).forEach(teamKey => {
          if (!teamKey.startsWith('team')) {
            throw new Error('Invalid team key format');
          }
          if (!Array.isArray(imported[teamKey])) {
            throw new Error('Team cards must be an array');
          }
          imported[teamKey].forEach(card => {
            if (!card.name) {
              throw new Error('Each card must have a name');
            }
          });
        });

        onSaveCards(imported);
        setShowImportError('');
        alert('Cards imported successfully!');
      } catch (error) {
        setShowImportError(`Import failed: ${error.message}`);
      }
    };
    reader.readAsText(file);

    // Reset file input
    event.target.value = '';
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(customCards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom-cards-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Count total cards across all teams
  const totalCards = Object.values(customCards).reduce(
    (sum, cards) => sum + cards.length,
    0
  );

  return (
    <div className="card-management-container">
      <div className="card-management-content">
        {/* Header */}
        <div className="card-management-header">
          <button onClick={onBack} className="back-button-cm">
            <span className="arrow">←</span>
            <span>Back to Game Setup</span>
          </button>
          <div className="card-management-title">
            <h1>Custom Card Studio</h1>
            <p>Create unique cards for your game • Total: {totalCards} cards</p>
          </div>
        </div>

        {/* Team Overview Cards */}
        <div className="team-overview">
          {Array.from({ length: numberOfTeams }, (_, i) => i + 1).map(teamNum => {
            const teamCardCount = customCards[`team${teamNum}`]?.length || 0;
            return (
              <div
                key={teamNum}
                className={`team-card ${selectedTeam === teamNum ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedTeam(teamNum);
                  setShowManageCards(false);
                }}
              >
                <div className="team-card-label">Team {teamNum}</div>
                <div className="team-card-count">{teamCardCount}</div>
                <div className="team-card-text">
                  {teamCardCount === 1 ? 'card' : 'cards'}
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Add Card Form */}
          <div className="card-section">
            <div className="section-header">
              <h2>➕ Add Card</h2>
              <span className="section-badge">Creating as Team {selectedTeam}</span>
            </div>

            <div className="tip-box">
              <p>💡 <span className="tip-bold">Tip:</span> Cards you create will be assigned to other teams to guess. You won't receive your own cards!</p>
            </div>

            <div className="form-group">
              <label>
                <span className="label-icon">🎯</span>
                Assign Card To *
              </label>
              <select
                value={targetTeam}
                onChange={(e) => setTargetTeam(Number(e.target.value))}
                className="form-select"
              >
                {getAvailableTargetTeams().map(teamNum => (
                  <option key={teamNum} value={teamNum}>
                    Team {teamNum}
                  </option>
                ))}
              </select>
              <p className="help-text">This card will be added to Team {targetTeam}'s deck</p>
            </div>

            <div className="form-group">
              <label>Card Name *</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="e.g., Dancing in the rain"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Definition/Hint (optional)</label>
              <textarea
                value={cardDefinition}
                onChange={(e) => setCardDefinition(e.target.value)}
                placeholder="Add a helpful hint or description..."
                className="form-textarea"
              />
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select
                value={cardDifficulty}
                onChange={(e) => setCardDifficulty(Number(e.target.value))}
                className="form-select"
              >
                <option value={1}>⭐ Easy (1 point)</option>
                <option value={2}>⭐⭐ Medium (2 points)</option>
                <option value={3}>⭐⭐⭐ Hard (3 points)</option>
              </select>
            </div>

            <button onClick={handleAddCard} className="primary-button">
              ✨ Add Card to Team {targetTeam}
            </button>
          </div>

          {/* Import/Export Section */}
          <div className="card-section">
            <div className="section-header">
              <h2>💾 Import/Export</h2>
            </div>
            <p className="section-description">Share your custom cards with others</p>

            <div className="button-row">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="secondary-button import"
              >
                📥 Import
              </button>
              <button
                onClick={handleExportJSON}
                disabled={totalCards === 0}
                className="secondary-button export"
              >
                📤 Export
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                style={{ display: 'none' }}
              />
            </div>
            {showImportError && (
              <div className="error-message">{showImportError}</div>
            )}
          </div>
        </div>

        {/* Manage Cards Section */}
        <div className="manage-cards-section">
          <div className="manage-header">
            <h2>🎴 Manage Cards</h2>
            <span className="card-count-badge">{teamCards.length}</span>
          </div>
          <p className="section-description">Cards assigned to Team {selectedTeam}</p>

          {teamCards.length === 0 ? (
            <div className="empty-state">
              No cards added yet for Team {selectedTeam}
            </div>
          ) : (
            <>
              <button
                onClick={() => setShowManageCards(!showManageCards)}
                className={`toggle-cards-button ${showManageCards ? 'showing' : ''}`}
              >
                {showManageCards ? '🔒 Hide Cards' : '👁️ View & Edit Cards'}
              </button>

              {showManageCards && (
                <div className="cards-list">
                  {teamCards.map((card, index) => (
                    <div key={card.id} className="card-item">
                      <div className="card-item-header">
                        <div className="card-item-info">
                          <div className="card-item-name-row">
                            <span className="card-item-number">#{index + 1}</span>
                            <span className="card-item-name">{card.name}</span>
                            <span
                              className={`difficulty-indicator ${
                                card.difficulty === 1
                                  ? 'easy'
                                  : card.difficulty === 2
                                  ? 'medium'
                                  : 'hard'
                              }`}
                            >
                              {card.difficulty === 1 ? '⭐ Easy' : card.difficulty === 2 ? '⭐⭐ Med' : '⭐⭐⭐ Hard'}
                            </span>
                            {card.createdBy && (
                              <span className="created-by-badge">
                                Created by Team {card.createdBy}
                              </span>
                            )}
                          </div>
                          {card.definition && card.definition !== 'Custom card' && (
                            <p className="card-item-definition">💡 {card.definition}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteCard(card.id)}
                          className="delete-button"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardManagement;
