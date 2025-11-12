import React, { useState, useEffect } from 'react';
import './App.css';
import { cards } from './data/cards';

function App() {
  const [currentCard, setCurrentCard] = useState(null);
  const [usedCards, setUsedCards] = useState([]);
  const [showDefinition, setShowDefinition] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [cardsCompleted, setCardsCompleted] = useState(0);

  // Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft]);

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

    // Increment cards completed if timer is running
    if (timerRunning && currentCard) {
      setCardsCompleted(prev => prev + 1);
    }
  };

  const startGame = () => {
    setGameStarted(true);
    getRandomCard();
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentCard(null);
    setUsedCards([]);
    setTimeLeft(60);
    setTimerRunning(false);
    setCardsCompleted(0);
  };

  const startTimer = () => {
    setTimeLeft(60);
    setCardsCompleted(0);
    setTimerRunning(true);
  };

  const pauseTimer = () => {
    setTimerRunning(false);
  };

  const resetTimer = () => {
    setTimeLeft(60);
    setTimerRunning(false);
    setCardsCompleted(0);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 1: return '#06b6d4';
      case 2: return '#8b5cf6';
      case 3: return '#ec4899';
      default: return '#64748b';
    }
  };

  if (!gameStarted) {
    return (
      <div className="App">
        <div className="welcome-screen">
          <h1>Mini-Miney-Monikers</h1>
          <p className="tagline">Addy-J and Cammy-K Jam</p>
          
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
                Easy
              </button>
              <button
                className={selectedDifficulty === '2' ? 'selected' : ''}
                onClick={() => setSelectedDifficulty('2')}
                style={{ borderColor: getDifficultyColor(2) }}
              >
                Medium
              </button>
              <button
                className={selectedDifficulty === '3' ? 'selected' : ''}
                onClick={() => setSelectedDifficulty('3')}
                style={{ borderColor: getDifficultyColor(3) }}
              >
                Hard
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
              <li>No talking or sounds allowed</li>
              <li>Other players attempt to guess</li>
              <li>Complete as many cards as possible in 60 seconds</li>
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
        <h2>Mini-Miney-Monikers</h2>
        <div className="timer-section">
          <div className="timer-display" style={{
            color: timeLeft <= 10 ? '#ef4444' : 'white',
            fontSize: timeLeft <= 10 ? '2rem' : '1.5rem',
            fontWeight: 'bold'
          }}>
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
          </div>
          <div className="timer-controls">
            {!timerRunning ? (
              <button className="timer-button start" onClick={startTimer}>
                Start Timer
              </button>
            ) : (
              <button className="timer-button pause" onClick={pauseTimer}>
                Pause
              </button>
            )}
            <button className="timer-button reset" onClick={resetTimer}>
              Reset
            </button>
          </div>
          {timeLeft === 0 && (
            <div className="score-display">
              Cards Completed: {cardsCompleted}
            </div>
          )}
        </div>
      </div>

      {currentCard && (
        <div className="card-container">
          <div 
            className="game-card"
            style={{ borderColor: getDifficultyColor(currentCard.difficulty) }}
          >
            <div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(currentCard.difficulty) }}>
              Level {currentCard.difficulty}
            </div>
            
            <h1 className="card-name">{currentCard.name}</h1>
            
            <div className="definition-section">
              <button
                className="toggle-definition"
                onClick={() => setShowDefinition(!showDefinition)}
              >
                {showDefinition ? 'Hide Hint' : 'Show Hint'}
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
