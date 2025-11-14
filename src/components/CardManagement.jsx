import React, { useState, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

const CardManagement = ({
  numberOfTeams,
  customCards,
  onSaveCards,
  onBack
}) => {
  const { theme } = useTheme();
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
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 via-white to-gray-100 text-gray-900'}`}>
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl mb-6 font-medium transition-all duration-200 ${
              theme === 'dark'
                ? 'bg-gray-800 hover:bg-gray-700 shadow-lg hover:shadow-xl'
                : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
            }`}
          >
            <span className="transition-transform group-hover:-translate-x-1">←</span>
            <span>Back to Game Setup</span>
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Custom Card Studio
            </h1>
            <p className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Create unique cards for your game • Total: {totalCards} cards
            </p>
          </div>
        </div>

        {/* Team Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: numberOfTeams }, (_, i) => i + 1).map(teamNum => {
            const teamCardCount = customCards[`team${teamNum}`]?.length || 0;
            return (
              <button
                key={teamNum}
                onClick={() => {
                  setSelectedTeam(teamNum);
                  setShowManageCards(false);
                }}
                className={`p-5 rounded-xl transition-all duration-200 transform hover:scale-105 ${
                  selectedTeam === teamNum
                    ? theme === 'dark'
                      ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 shadow-2xl scale-105 border-2 border-blue-500'
                      : 'bg-gradient-to-br from-blue-500 via-blue-600 to-purple-600 shadow-2xl scale-105 text-white border-2 border-blue-400'
                    : theme === 'dark'
                    ? 'bg-gradient-to-br from-gray-800 to-gray-850 hover:from-gray-750 hover:to-gray-800 shadow-lg hover:shadow-xl border border-gray-700'
                    : 'bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-white shadow-md hover:shadow-lg border border-gray-200'
                }`}
              >
                <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${
                  selectedTeam === teamNum
                    ? 'text-blue-100'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Team {teamNum}
                </div>
                <div className="text-4xl font-bold mb-1">{teamCardCount}</div>
                <div className={`text-xs font-medium ${
                  selectedTeam === teamNum
                    ? 'text-blue-200'
                    : theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {teamCardCount === 1 ? 'card' : 'cards'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Add Card Form */}
          <div className={`rounded-2xl p-6 ${
            theme === 'dark'
              ? 'bg-gray-800 shadow-2xl'
              : 'bg-white shadow-xl'
          }`}>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">➕</span>
              Add Card
              <span className={`ml-auto text-sm font-semibold px-3 py-1 rounded-full ${
                theme === 'dark'
                  ? 'bg-blue-900 text-blue-200'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                Creating as Team {selectedTeam}
              </span>
            </h2>

            <div className={`mb-5 p-4 rounded-xl ${
              theme === 'dark'
                ? 'bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-purple-700/50'
                : 'bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200'
            }`}>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                💡 <span className="font-semibold">Tip:</span> Cards you create will be assigned to other teams to guess. You won't receive your own cards!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-semibold text-sm flex items-center gap-2">
                  <span className="text-lg">🎯</span>
                  Assign Card To *
                </label>
                <select
                  value={targetTeam}
                  onChange={(e) => setTargetTeam(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-2 border-gray-600 focus:border-purple-500'
                      : 'bg-gray-50 border-2 border-gray-200 focus:border-purple-500'
                  } outline-none cursor-pointer font-semibold`}
                >
                  {getAvailableTargetTeams().map(teamNum => (
                    <option key={teamNum} value={teamNum}>
                      Team {teamNum}
                    </option>
                  ))}
                </select>
                <p className={`mt-2 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  This card will be added to Team {targetTeam}'s deck
                </p>
              </div>

              <div>
                <label className="block mb-2 font-semibold text-sm">Card Name *</label>
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g., Dancing in the rain"
                  className={`w-full px-4 py-3 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-2 border-gray-600 focus:border-blue-500 focus:bg-gray-650'
                      : 'bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-sm">Definition/Hint (optional)</label>
                <textarea
                  value={cardDefinition}
                  onChange={(e) => setCardDefinition(e.target.value)}
                  placeholder="Add a helpful hint or description..."
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl transition-all resize-none ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-2 border-gray-600 focus:border-blue-500 focus:bg-gray-650'
                      : 'bg-gray-50 border-2 border-gray-200 focus:border-blue-500 focus:bg-white'
                  } outline-none`}
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold text-sm">Difficulty</label>
                <select
                  value={cardDifficulty}
                  onChange={(e) => setCardDifficulty(Number(e.target.value))}
                  className={`w-full px-4 py-3 rounded-xl transition-all ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-2 border-gray-600 focus:border-blue-500'
                      : 'bg-gray-50 border-2 border-gray-200 focus:border-blue-500'
                  } outline-none cursor-pointer`}
                >
                  <option value={1}>⭐ Easy (1 point)</option>
                  <option value={2}>⭐⭐ Medium (2 points)</option>
                  <option value={3}>⭐⭐⭐ Hard (3 points)</option>
                </select>
              </div>

              <button
                onClick={handleAddCard}
                className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                ✨ Add Card to Team {targetTeam}
              </button>
            </div>
          </div>

          {/* Import/Export & Management */}
          <div className="space-y-6">
            {/* Import/Export Section */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 shadow-2xl border border-gray-700'
                : 'bg-gradient-to-br from-white to-gray-50 shadow-xl border border-gray-200'
            }`}>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <span className="text-2xl">💾</span>
                Import/Export
              </h2>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Share your custom cards with others
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                    theme === 'dark'
                      ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  📥 Import
                </button>
                <button
                  onClick={handleExportJSON}
                  disabled={totalCards === 0}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform ${
                    totalCards === 0
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : theme === 'dark'
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl hover:scale-105'
                      : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg hover:scale-105'
                  }`}
                >
                  📤 Export
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </div>
              {showImportError && (
                <div className={`mt-3 p-3 rounded-lg border ${
                  theme === 'dark'
                    ? 'bg-red-900/20 border-red-700'
                    : 'bg-red-50 border-red-300'
                }`}>
                  <p className={`text-sm font-medium ${theme === 'dark' ? 'text-red-400' : 'text-red-700'}`}>
                    ⚠️ {showImportError}
                  </p>
                </div>
              )}
            </div>

            {/* Manage Cards Section */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gradient-to-br from-gray-800 to-gray-850 shadow-2xl border border-gray-700'
                : 'bg-gradient-to-br from-white to-gray-50 shadow-xl border border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🎴</span>
                  Manage Cards
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  theme === 'dark'
                    ? 'bg-blue-900 text-blue-200'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {teamCards.length}
                </span>
              </div>
              <p className={`text-sm mb-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Cards assigned to Team {selectedTeam}
              </p>

              {teamCards.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No cards added yet for Team {selectedTeam}
                </p>
              ) : (
                <>
                  <button
                    onClick={() => setShowManageCards(!showManageCards)}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 ${
                      showManageCards
                        ? theme === 'dark'
                          ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                          : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                        : theme === 'dark'
                        ? 'bg-gradient-to-r from-gray-700 to-gray-750 hover:from-gray-650 hover:to-gray-700 text-white'
                        : 'bg-gradient-to-r from-gray-200 to-gray-300 hover:from-gray-300 hover:to-gray-400 text-gray-900'
                    } shadow-md hover:shadow-lg`}
                  >
                    {showManageCards ? '🔒 Hide Cards' : '👁️ View & Edit Cards'}
                  </button>

                  {showManageCards && (
                    <div className="mt-4 space-y-3 max-h-96 overflow-y-auto pr-2">
                      {teamCards.map((card, index) => (
                        <div
                          key={card.id}
                          className={`p-4 rounded-xl transition-all transform hover:scale-[1.02] ${
                            theme === 'dark'
                              ? 'bg-gradient-to-r from-gray-700 to-gray-750 hover:from-gray-650 hover:to-gray-700'
                              : 'bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50'
                          } border-2 ${
                            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                          } shadow-md hover:shadow-lg`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`px-2 py-1 rounded-md text-sm font-bold ${
                                  theme === 'dark' ? 'bg-gray-600 text-gray-200' : 'bg-gray-200 text-gray-700'
                                }`}>
                                  #{index + 1}
                                </span>
                                <span className="font-bold text-base">{card.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold shadow-sm ${
                                  card.difficulty === 1
                                    ? 'bg-green-500 text-white'
                                    : card.difficulty === 2
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}>
                                  {card.difficulty === 1 ? '⭐ Easy' : card.difficulty === 2 ? '⭐⭐ Med' : '⭐⭐⭐ Hard'}
                                </span>
                                {card.createdBy && (
                                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                    theme === 'dark'
                                      ? 'bg-purple-900/50 text-purple-200 border border-purple-700'
                                      : 'bg-purple-100 text-purple-700 border border-purple-300'
                                  }`}>
                                    Created by Team {card.createdBy}
                                  </span>
                                )}
                              </div>
                              {card.definition && card.definition !== 'Custom card' && (
                                <p className={`text-sm mt-2 italic ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  💡 {card.definition}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="px-3 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow hover:shadow-md transform hover:scale-105"
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
      </div>
    </div>
  );
};

export default CardManagement;
