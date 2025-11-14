import React, { useState, useRef } from 'react';
import './CardManagement.css';

const CardManagement = ({
  numberOfTeams,
  customCards,
  onSaveCards,
  onBack
}) => {
  const [activeTab, setActiveTab] = useState('team'); // 'team' or 'shared'
  const [selectedTeam, setSelectedTeam] = useState(1);
  const [cardName, setCardName] = useState('');
  const [cardDefinition, setCardDefinition] = useState('');
  const [cardDifficulty, setCardDifficulty] = useState(1);
  const [showImportError, setShowImportError] = useState('');
  const [showManageCards, setShowManageCards] = useState(false);
  const fileInputRef = useRef(null);

  // Get cards for selected team
  const teamCards = customCards[`team${selectedTeam}`] || [];
  // Get shared cards
  const sharedCards = customCards.shared || [];

  const handleAddCard = () => {
    if (!cardName.trim()) {
      alert('Please enter a card name');
      return;
    }

    const newCard = {
      id: `custom-${activeTab}-${Date.now()}`,
      name: cardName.trim(),
      difficulty: cardDifficulty,
      definition: cardDefinition.trim() || 'Custom card',
      team: activeTab === 'team' ? selectedTeam : 'shared',
      custom: true
    };

    const key = activeTab === 'team' ? `team${selectedTeam}` : 'shared';
    const currentCards = activeTab === 'team' ? teamCards : sharedCards;

    const updatedCards = {
      ...customCards,
      [key]: [...currentCards, newCard]
    };

    onSaveCards(updatedCards);

    // Reset form
    setCardName('');
    setCardDefinition('');
    setCardDifficulty(1);
  };

  const handleDeleteCard = (cardId) => {
    const key = activeTab === 'team' ? `team${selectedTeam}` : 'shared';
    const currentCards = activeTab === 'team' ? teamCards : sharedCards;

    const updatedCurrentCards = currentCards.filter(card => card.id !== cardId);
    const updatedCards = {
      ...customCards,
      [key]: updatedCurrentCards
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

        // Validate each team's cards and shared cards
        Object.keys(imported).forEach(key => {
          if (!key.startsWith('team') && key !== 'shared') {
            throw new Error('Invalid key format. Expected "team1", "team2", etc., or "shared"');
          }
          if (!Array.isArray(imported[key])) {
            throw new Error('Cards must be an array');
          }
          imported[key].forEach(card => {
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

  // Count total cards across all teams and shared
  const totalCards = Object.values(customCards).reduce(
    (sum, cards) => sum + cards.length,
    0
  );

  const currentCards = activeTab === 'team' ? teamCards : sharedCards;

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

        {/* Tab Selector */}
        <div className="tab-selector">
          <button
            className={`tab-button ${activeTab === 'team' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('team');
              setShowManageCards(false);
            }}
          >
            My Team's Cards
          </button>
          <button
            className={`tab-button ${activeTab === 'shared' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('shared');
              setShowManageCards(false);
            }}
          >
            Shared Pool
          </button>
        </div>

        {/* Team Overview (only show on Team tab) */}
        {activeTab === 'team' && (
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
        )}

        {/* Main Content Grid */}
        <div className="content-grid">
          {/* Add Card Form */}
          <div className="card-section">
            <div className="section-header">
              <h2>➕ Add Card</h2>
              <span className={`section-badge ${activeTab === 'shared' ? 'shared' : ''}`}>
                {activeTab === 'team' ? `Team ${selectedTeam}` : 'Shared Pool'}
              </span>
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
              Add to {activeTab === 'team' ? `Team ${selectedTeam}` : 'Shared Pool'}
            </button>
          </div>

          {/* Import/Export Section */}
          <div className="card-section">
            <div className="section-header">
              <h2>💾 Import/Export</h2>
            </div>
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
            <h2>
              🎴 Manage Cards
            </h2>
            <span className="card-count-badge">{currentCards.length}</span>
          </div>

          {currentCards.length === 0 ? (
            <div className="empty-state">
              No cards added yet for {activeTab === 'team' ? `Team ${selectedTeam}` : 'Shared Pool'}
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
                  {currentCards.map((card, index) => (
                    <div key={card.id} className="card-item">
                      <div className="card-item-header">
                        <div className="card-item-info">
                          <div className="card-item-name-row">
                            <span className="card-item-number">{index + 1}.</span>
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
                              {card.difficulty === 1 ? '⭐' : card.difficulty === 2 ? '⭐⭐' : '⭐⭐⭐'}
                            </span>
                          </div>
                          {card.definition && card.definition !== 'Custom card' && (
                            <p className="card-item-definition">{card.definition}</p>
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
