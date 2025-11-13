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
    <div className={`min-h-screen p-6 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className={`px-4 py-2 rounded-lg mb-4 ${
              theme === 'dark'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          >
            ← Back to Game Setup
          </button>
          <h1 className="text-3xl font-bold mb-2">Manage Custom Cards</h1>
          <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
            Add custom cards for each team. Total cards: {totalCards}
          </p>
        </div>

        {/* Import/Export Section */}
        <div className={`p-4 rounded-lg mb-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-semibold mb-3">Import/Export</h2>
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Import from JSON
            </button>
            <button
              onClick={handleExportJSON}
              disabled={totalCards === 0}
              className={`px-4 py-2 rounded-lg text-white ${
                totalCards === 0
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Export to JSON
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
            <p className="text-red-500 mt-2 text-sm">{showImportError}</p>
          )}
        </div>

        {/* Team Selector */}
        <div className={`p-4 rounded-lg mb-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-semibold mb-3">Select Team</h2>
          <div className="flex gap-2 flex-wrap">
            {Array.from({ length: numberOfTeams }, (_, i) => i + 1).map(teamNum => (
              <button
                key={teamNum}
                onClick={() => setSelectedTeam(teamNum)}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  selectedTeam === teamNum
                    ? 'bg-blue-600 text-white'
                    : theme === 'dark'
                    ? 'bg-gray-700 hover:bg-gray-600'
                    : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                Team {teamNum} ({customCards[`team${teamNum}`]?.length || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Add Card Form */}
        <div className={`p-4 rounded-lg mb-6 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-semibold mb-3">Add Card for Team {selectedTeam}</h2>

          <div className="space-y-3">
            <div>
              <label className="block mb-1 font-medium">Card Name *</label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="e.g., Dancing in the rain"
                className={`w-full px-3 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                } border`}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Definition/Hint (optional)</label>
              <textarea
                value={cardDefinition}
                onChange={(e) => setCardDefinition(e.target.value)}
                placeholder="e.g., Joyful outdoor activity. Pretend to dance with arms up!"
                rows={3}
                className={`w-full px-3 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                } border`}
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">Difficulty</label>
              <select
                value={cardDifficulty}
                onChange={(e) => setCardDifficulty(Number(e.target.value))}
                className={`w-full px-3 py-2 rounded-lg ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600'
                    : 'bg-white border-gray-300'
                } border`}
              >
                <option value={1}>Easy (1 point)</option>
                <option value={2}>Medium (2 points)</option>
                <option value={3}>Hard (3 points)</option>
              </select>
            </div>

            <button
              onClick={handleAddCard}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
            >
              Add Card to Team {selectedTeam}
            </button>
          </div>
        </div>

        {/* Team's Cards List */}
        <div className={`p-4 rounded-lg ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <h2 className="text-xl font-semibold mb-3">
            Team {selectedTeam}'s Cards ({teamCards.length})
          </h2>

          {teamCards.length === 0 ? (
            <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
              No custom cards yet. Add some above!
            </p>
          ) : (
            <div className="space-y-2">
              {teamCards.map((card, index) => (
                <div
                  key={card.id}
                  className={`p-3 rounded-lg border ${
                    theme === 'dark'
                      ? 'bg-gray-700 border-gray-600'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{index + 1}. {card.name}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          card.difficulty === 1
                            ? 'bg-green-600 text-white'
                            : card.difficulty === 2
                            ? 'bg-yellow-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}>
                          {card.difficulty === 1 ? 'Easy' : card.difficulty === 2 ? 'Medium' : 'Hard'}
                        </span>
                      </div>
                      {card.definition && (
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {card.definition}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="ml-3 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardManagement;
