import React, { useState, useEffect } from 'react';
import './App.css';
import { cards } from './data/cards';

function App() {
  const [currentCard, setCurrentCard] = useState(null);
  const [usedCards, setUsedCards] = useState([]);
  const [showDefinition, setShowDefinition] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [gameStarted, setGameStarted] = useState(false);

  const getRandomCard = () => {
    let availableCards = cards.filter(card => !usedCards.includes(card.id));
    
    // Filter by difficulty if not 'all'
    if (selectedDifficulty !== 'all') {
      availableCards = availableCards.filter(
        card => card.difficulty === parseInt(selectedDifficulty)
      );
    }

    if (availableCards.length === 0) {
      // Reset if all cards have been used
      setUsedCards([]);
      availableCards = selectedDifficulty === 'all' 
        ? cards 
        : cards.filter(card => card.difficulty === parseInt(selectedDifficulty));
    }

    const randomIndex = Math.floor(Math.random() * availableCards.length);
    const selectedCard = availableCards[randomIndex];
    setCurrentCard(selectedCard);
    setUsedCards([...usedCards, selectedCard.id]);
  };

  const startGame = () => {
    setGameStarted(true);
    getRandomCard();
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentCard(null);
    setUsedCards([]);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 1: return '#4ade80';
      case 2: return '#fbbf24';
      case 3: return '#f87171';
      default: return '#94a3b8';
    }
  };

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty);
  };

  if (!gameStarted) {
    return (
      <div className="App">
        <div className="welcome-screen">
          <h1>🐟 Addison and Camryn's Fish in a Bowl</h1>
          <p className="tagline">Act it out, guess it fast - make some memories that last!</p>
          
          <div className="difficulty-selector">
            <h3>Choose Difficulty:</h3>
            <div className="difficulty-buttons">
              <button 
                className={selectedDifficulty === 'all' ? 'selected' : ''}
                onClick={() => setSelectedDifficulty('all')}
              >
                All Cards
              </button>
              <button 
                className={selectedDifficulty === '1' ? 'selected' : ''}
                onClick={() => setSelectedDifficulty('1')}
                style={{ borderColor: getDifficultyColor(1) }}
              >
                ⭐ Easy
              </button>
              <button 
                className={selectedDifficulty === '2' ? 'selected' : ''}
                onClick={() => setSelectedDifficulty('2')}
                style={{ borderColor: getDifficultyColor(2) }}
              >
                ⭐⭐ Medium
              </button>
              <button 
                className={selectedDifficulty === '3' ? 'selected' : ''}
                onClick={() => setSelectedDifficulty('3')}
                style={{ borderColor: getDifficultyColor(3) }}
              >
                ⭐⭐⭐ Hard
              </button>
            </div>
          </div>

          <button className="start-button" onClick={startGame}>
            Start Playing!
          </button>

          <div className="game-info">
            <h3>How to Play:</h3>
            <ol>
              <li>One player draws a card and acts it out</li>
              <li>No talking or sounds (unless the card says so!)</li>
              <li>Other players guess what you're acting</li>
              <li>Have fun and be creative!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <div className="game-header">
        <button className="back-button" onClick={resetGame}>
          ← Back to Menu
        </button>
        <h2>Fish in a Bowl</h2>
        <div className="cards-remaining">
          Cards left: {cards.length - usedCards.length + 1}
        </div>
      </div>

      {currentCard && (
        <div className="card-container">
          <div 
            className="game-card"
            style={{ borderColor: getDifficultyColor(currentCard.difficulty) }}
          >
            <div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(currentCard.difficulty) }}>
              {getDifficultyStars(currentCard.difficulty)} Difficulty {currentCard.difficulty}
            </div>
            
            <h1 className="card-name">{currentCard.name}</h1>
            
            <div className="definition-section">
              <button 
                className="toggle-definition"
                onClick={() => setShowDefinition(!showDefinition)}
              >
                {showDefinition ? '👁️ Hide Hint' : '👁️ Show Hint'}
              </button>
              
              {showDefinition && (
                <p className="card-definition">{currentCard.definition}</p>
              )}
            </div>
          </div>

          <button className="next-button" onClick={getRandomCard}>
            Next Card →
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
