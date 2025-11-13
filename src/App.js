import React, { useState, useEffect } from 'react';
import './App.css';
import { cards } from './data/cards';
import { useSwipe } from './hooks/useSwipe';
import { useTheme } from './hooks/useTheme';
import ScoreBoard from './components/ScoreBoard';
import SkippedCardsModal from './components/SkippedCardsModal';

function App() {
  const { theme, toggleTheme } = useTheme();

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

  // Swipe scoring state
  const [scoredCards, setScoredCards] = useState([]);
  const [skippedCards, setSkippedCards] = useState([]);
  const [showSkippedModal, setShowSkippedModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('');

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
    setScoredCards([]);
    setSkippedCards([]);
    setAnimationClass('');
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

  // Swipe handlers
  const handleSwipeRight = () => {
    if (isAnimating || !currentCard) return;

    setIsAnimating(true);
    setAnimationClass('card-swipe-right');
    setScoredCards([...scoredCards, currentCard]);

    setTimeout(() => {
      getRandomCard();
      setAnimationClass('');
      setIsAnimating(false);
    }, 300);
  };

  const handleSwipeLeft = () => {
    if (isAnimating || !currentCard) return;

    setIsAnimating(true);
    setAnimationClass('card-swipe-left');
    setSkippedCards([...skippedCards, currentCard]);

    setTimeout(() => {
      getRandomCard();
      setAnimationClass('');
      setIsAnimating(false);
    }, 300);
  };

  const goToPreviousCard = () => {
    if (skippedCards.length > 0) {
      const lastSkipped = skippedCards[skippedCards.length - 1];
      setCurrentCard(lastSkipped);
      setSkippedCards(skippedCards.slice(0, -1));
      // Remove from used cards so it can be scored
      setUsedCards(usedCards.filter(id => id !== lastSkipped.id));
    }
  };

  const handleSelectSkippedCard = (card) => {
    setCurrentCard(card);
    setSkippedCards(skippedCards.filter(c => c.id !== card.id));
    setShowSkippedModal(false);
    // Remove from used cards so it can be scored
    setUsedCards(usedCards.filter(id => id !== card.id));
  };

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty);
  };

  // Initialize swipe hook
  const { handlers, swipeDirection, dragOffset } = useSwipe(
    handleSwipeLeft,
    handleSwipeRight,
    100
  );

  // Apply drag transform
  const cardStyle = dragOffset.x !== 0 ? {
    transform: `translateX(${dragOffset.x}px) rotate(${dragOffset.x * 0.05}deg)`,
  } : {};

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
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
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
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle dark mode">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>
      <div className="game-header">
        <button className="back-button" onClick={resetGame}>
          ← Back to Menu
        </button>
        <ScoreBoard
          score={scoredCards.length}
          skippedCount={skippedCards.length}
          onReviewSkipped={() => setShowSkippedModal(true)}
        />
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

      {skippedCards.length > 0 && (
        <button className="previous-button" onClick={goToPreviousCard}>
          ← Previous Skipped Card
        </button>
      )}

      {currentCard && (
        <div className="card-container">
          <div
            {...handlers}
            className={`game-card ${animationClass} ${swipeDirection === 'right' ? 'score-glow-right' : ''} ${swipeDirection === 'left' ? 'score-glow-left' : ''}`}
            style={{
              borderColor: getDifficultyColor(currentCard.difficulty),
              ...cardStyle
            }}
          >
            <div className="difficulty-badge" style={{ backgroundColor: getDifficultyColor(currentCard.difficulty) }}>
              {getDifficultyStars(currentCard.difficulty)} Level {currentCard.difficulty}
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

          <div className="swipe-instructions">
            <div className="swipe-hint swipe-left">
              <span className="swipe-arrow">←</span>
              <span>Swipe left to skip</span>
            </div>
            <div className="swipe-hint swipe-right">
              <span>Swipe right to score</span>
              <span className="swipe-arrow">→</span>
            </div>
          </div>
        </div>
      )}

      {showSkippedModal && (
        <SkippedCardsModal
          skippedCards={skippedCards}
          onClose={() => setShowSkippedModal(false)}
          onSelectCard={handleSelectSkippedCard}
          getDifficultyColor={getDifficultyColor}
          getDifficultyStars={getDifficultyStars}
        />
      )}
    </div>
  );
}

export default App;