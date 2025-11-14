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
  const [cardName, setCardName] = useState('');
  const [cardDefinition, setCardDefinition] = useState('');
  const [cardDifficulty, setCardDifficulty] = useState(1);
  const [showImportError, setShowImportError] = useState('');
  const [showManageCards, setShowManageCards] = useState(false);
  const fileInputRef = useRef(null);

  // Get cards for selected team
  const teamCards = customCards[`team${selectedTeam}`] || [];

  const handleAddCard = () => {
    if (!cardName.trim()) {
      alert('Please enter a card name');
      return;
    }

    const newCard = {
      id: `custom-team${selectedTeam}-${Date.now()}`,
      name: cardName.trim(),
      difficulty: cardDifficulty,
      definition: cardDefinition.trim() || 'Custom card',
      team: selectedTeam,
      custom: true
    };

    const updatedCards = {
      ...customCards,
      [`team${selectedTeam}`]: [...teamCards, newCard]
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
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedTeam === teamNum
                    ? theme === 'dark'
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl scale-105'
                      : 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl scale-105 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-800 hover:bg-gray-750 shadow-lg hover:shadow-xl'
                    : 'bg-white hover:bg-gray-50 shadow-md hover:shadow-lg'
                }`}
              >
                <div className="text-sm font-medium opacity-90 mb-1">Team {teamNum}</div>
                <div className="text-3xl font-bold">{teamCardCount}</div>
                <div className="text-xs opacity-75 mt-1">
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
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <span className="text-2xl">➕</span>
              Add Card
              <span className={`ml-auto text-sm font-semibold px-3 py-1 rounded-full ${
                theme === 'dark'
                  ? 'bg-blue-900 text-blue-200'
                  : 'bg-blue-100 text-blue-700'
              }`}>
                Team {selectedTeam}
              </span>
            </h2>

            <div className="space-y-4">
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
                className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              >
                Add Card to Team {selectedTeam}
              </button>
            </div>
          </div>

          {/* Import/Export & Management */}
          <div className="space-y-6">
            {/* Import/Export Section */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 shadow-2xl'
                : 'bg-white shadow-xl'
            }`}>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">💾</span>
                Import/Export
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    theme === 'dark'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-purple-500 hover:bg-purple-600 text-white shadow-md hover:shadow-lg'
                  }`}
                >
                  📥 Import
                </button>
                <button
                  onClick={handleExportJSON}
                  disabled={totalCards === 0}
                  className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                    totalCards === 0
                      ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                      : theme === 'dark'
                      ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl'
                      : 'bg-green-500 hover:bg-green-600 text-white shadow-md hover:shadow-lg'
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
                <div className="mt-3 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg">
                  <p className="text-red-500 text-sm">{showImportError}</p>
                </div>
              )}
            </div>

            {/* Manage Cards Section */}
            <div className={`rounded-2xl p-6 ${
              theme === 'dark'
                ? 'bg-gray-800 shadow-2xl'
                : 'bg-white shadow-xl'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span className="text-2xl">🎴</span>
                  Manage Cards
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  theme === 'dark'
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {teamCards.length}
                </span>
              </div>

              {teamCards.length === 0 ? (
                <p className={`text-center py-8 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No cards added yet for Team {selectedTeam}
                </p>
              ) : (
                <>
                  <button
                    onClick={() => setShowManageCards(!showManageCards)}
                    className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                      showManageCards
                        ? theme === 'dark'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-red-500 hover:bg-red-600 text-white'
                        : theme === 'dark'
                        ? 'bg-gray-700 hover:bg-gray-600 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    } shadow-md hover:shadow-lg`}
                  >
                    {showManageCards ? '🔒 Hide Cards' : '👁️ View & Edit Cards'}
                  </button>

                  {showManageCards && (
                    <div className="mt-4 space-y-2 max-h-96 overflow-y-auto pr-2">
                      {teamCards.map((card, index) => (
                        <div
                          key={card.id}
                          className={`p-4 rounded-xl transition-all ${
                            theme === 'dark'
                              ? 'bg-gray-700 hover:bg-gray-650'
                              : 'bg-gray-50 hover:bg-gray-100'
                          } border-2 ${
                            theme === 'dark' ? 'border-gray-600' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg">{index + 1}.</span>
                                <span className="font-semibold">{card.name}</span>
                                <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                                  card.difficulty === 1
                                    ? 'bg-green-500 text-white'
                                    : card.difficulty === 2
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-red-500 text-white'
                                }`}>
                                  {card.difficulty === 1 ? '⭐' : card.difficulty === 2 ? '⭐⭐' : '⭐⭐⭐'}
                                </span>
                              </div>
                              {card.definition && card.definition !== 'Custom card' && (
                                <p className={`text-sm ${
                                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {card.definition}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteCard(card.id)}
                              className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-semibold transition-all duration-200 shadow hover:shadow-md"
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
