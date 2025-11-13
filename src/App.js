import React, { useState, useEffect } from 'react';
import './App.css';
import { cards } from './data/cards';

function App() {
  // Basic game state
  const [currentCard, setCurrentCard] = useState(null);
  const [usedCards, setUsedCards] = useState([]);
  const [showDefinition, setShowDefinition] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [gameStarted, setGameStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [cardsCompleted, setCardsCompleted] = useState(0);

  // Monikers mode state
  const [gameMode, setGameMode] = useState('quick'); // 'quick' or 'monikers'
  const [currentRound, setCurrentRound] = useState(1);
  const [deckForRounds, setDeckForRounds] = useState([]);
  const [roundScores, setRoundScores] = useState({});
  const [scoredCards, setScoredCards] = useState([]);
  const [skippedCards, setSkippedCards] = useState([]);
  const [showTransition, setShowTransition] = useState(false);
  const [showFinalScore, setShowFinalScore] = useState(false);

  // Function to play buzzer sound when timer ends
  const playBuzzer = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 400; // Hz
      oscillator.type = 'square';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.log('Audio play failed:', err);
    }
  };

  // Round rules configuration
  const getRoundRules = (roundNumber) => {
    switch(roundNumber) {
      case 1:
        return {
          title: "Round 1: Anything Goes",
          icon: "🗣️",
          description: "Use any words, sounds, or gestures. You can't say the name itself!",
          color: "#3b82f6"
        };
      case 2:
        return {
          title: "Round 2: One Word Only",
          icon: "🎯",
          description: "Say only ONE word as a clue. No sounds or gestures!",
          color: "#f97316"
        };
      case 3:
        return {
          title: "Round 3: Just Charades",
          icon: "🤐",
          description: "No talking! Just gestures and acting.",
          color: "#a855f7"
        };
      default:
        return {
          title: "Quick Play",
          icon: "🎮",
          description: "Play at your own pace!",
          color: "#64748b"
        };
    }
  };

  // Timer countdown effect
  useEffect(() => {
    let interval = null;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          const newTime = time - 1;

          // Play sound when timer hits zero
          if (newTime === 0) {
            playBuzzer();
          }

          return newTime;
        });
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

  const startGame = (mode = 'quick') => {
    setGameMode(mode);
    setGameStarted(true);

    if (mode === 'monikers') {
      // Initialize deck for Monikers mode
      const deck = initializeDeck();
      setCurrentRound(1);
      setScoredCards([]);
      setSkippedCards([]);
      setRoundScores({});
      setShowTransition(false);
      setShowFinalScore(false);
      setCurrentCard(deck[0]);
      setUsedCards([deck[0].id]);
    } else {
      // Quick play mode
      getRandomCard();
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setCurrentCard(null);
    setUsedCards([]);
    setTimeLeft(60);
    setTimerRunning(false);
    setCardsCompleted(0);
    setGameMode('quick');
    setCurrentRound(1);
    setDeckForRounds([]);
    setRoundScores({});
    setScoredCards([]);
    setSkippedCards([]);
    setShowTransition(false);
    setShowFinalScore(false);
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

  // Helper function to shuffle array
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Initialize deck for Monikers mode
  const initializeDeck = () => {
    let availableCards = selectedDifficulty === 'all'
      ? cards
      : cards.filter(card => card.difficulty === parseInt(selectedDifficulty));

    const shuffled = shuffleArray(availableCards);
    setDeckForRounds(shuffled);
    return shuffled;
  };

  // Score a card as correct
  const scoreCard = () => {
    if (currentCard) {
      setScoredCards([...scoredCards, currentCard]);
      setCardsCompleted(prev => prev + 1);
      getNextCardInRound();
    }
  };

  // Skip a card
  const skipCurrentCard = () => {
    if (currentCard) {
      setSkippedCards([...skippedCards, currentCard]);
      getNextCardInRound();
    }
  };

  // Get next card in Monikers round
  const getNextCardInRound = () => {
    if (gameMode === 'monikers') {
      const allUsedIds = [...scoredCards.map(c => c.id), ...skippedCards.map(c => c.id), ...usedCards];
      const availableCards = deckForRounds.filter(card => !allUsedIds.includes(card.id));

      if (availableCards.length === 0) {
        // Round complete!
        setCurrentCard(null);
        setTimerRunning(false);
        completeRound();
      } else {
        const nextCard = availableCards[0];
        setCurrentCard(nextCard);
        setUsedCards([...usedCards, nextCard.id]);
      }
    } else {
      getRandomCard();
    }
  };

  // Complete current round
  const completeRound = () => {
    const roundScore = {
      scored: scoredCards.length,
      skipped: skippedCards.length,
      total: deckForRounds.length,
      percentage: Math.round((scoredCards.length / deckForRounds.length) * 100)
    };

    setRoundScores({
      ...roundScores,
      [`round${currentRound}`]: roundScore
    });

    if (currentRound < 3) {
      setShowTransition(true);
    } else {
      setShowFinalScore(true);
    }
  };

  // Start next round
  const startNextRound = () => {
    setCurrentRound(currentRound + 1);
    setScoredCards([]);
    setSkippedCards([]);
    setUsedCards([]);
    setTimeLeft(60);
    setCardsCompleted(0);
    setShowTransition(false);

    // Reshuffle the same deck
    const reshuffled = shuffleArray(deckForRounds);
    setDeckForRounds(reshuffled);
    setCurrentCard(reshuffled[0]);
    setUsedCards([reshuffled[0].id]);
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 1: return '#06b6d4';
      case 2: return '#8b5cf6';
      case 3: return '#ec4899';
      default: return '#64748b';
    }
  };

  // Show round transition screen
  if (showTransition) {
    const roundRules = getRoundRules(currentRound + 1);
    const prevRoundScore = roundScores[`round${currentRound}`];

    return (
      <div className="App">
        <div className="transition-screen">
          <h1>Round {currentRound} Complete!</h1>
          <div className="round-score">
            <h2>Your Score: {prevRoundScore.scored}/{prevRoundScore.total}</h2>
            <p className="score-percentage">{prevRoundScore.percentage}% Correct</p>
          </div>

          <div className="next-round-info">
            <h2 style={{ color: roundRules.color }}>
              {roundRules.icon} {roundRules.title}
            </h2>
            <p className="round-description">{roundRules.description}</p>
          </div>

          <button className="start-button" onClick={startNextRound}>
            Start Round {currentRound + 1}
          </button>
        </div>
      </div>
    );
  }

  // Show final score screen
  if (showFinalScore) {
    const totalScored = Object.values(roundScores).reduce((sum, r) => sum + r.scored, 0);
    const totalCards = deckForRounds.length * 3;
    const totalPercentage = Math.round((totalScored / totalCards) * 100);

    return (
      <div className="App">
        <div className="final-score-screen">
          <h1>🎉 Game Complete! 🎉</h1>
          <div className="total-score">
            <h2>Final Score: {totalScored}/{totalCards}</h2>
            <p className="score-percentage">{totalPercentage}% Correct</p>
          </div>

          <div className="round-breakdown">
            <h3>Round Breakdown:</h3>
            {[1, 2, 3].map(roundNum => {
              const score = roundScores[`round${roundNum}`];
              const rules = getRoundRules(roundNum);
              return (
                <div key={roundNum} className="round-summary" style={{ borderLeft: `4px solid ${rules.color}` }}>
                  <span className="round-icon">{rules.icon}</span>
                  <span className="round-name">Round {roundNum}</span>
                  <span className="round-score-text">
                    {score.scored}/{score.total} ({score.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="final-buttons">
            <button className="start-button" onClick={() => startGame('monikers')}>
              Play Again
            </button>
            <button className="back-button" onClick={resetGame}>
              Back to Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

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

          <div className="mode-selector">
            <h3>Choose Game Mode:</h3>
            <div className="mode-options">
              <div className="mode-card">
                <h4>⚡ Quick Play</h4>
                <p>Single round, any difficulty. Play at your own pace!</p>
                <button className="mode-button" onClick={() => startGame('quick')}>
                  Quick Play
                </button>
              </div>
              <div className="mode-card monikers-mode">
                <h4>🎭 Monikers Mode</h4>
                <p>Play the same cards 3 ways!</p>
                <div className="round-preview">
                  <div className="round-preview-item">🗣️ Round 1: Say anything</div>
                  <div className="round-preview-item">🎯 Round 2: One word only</div>
                  <div className="round-preview-item">🤐 Round 3: Just charades</div>
                </div>
                <button className="mode-button monikers" onClick={() => startGame('monikers')}>
                  Start Monikers Mode
                </button>
              </div>
            </div>
          </div>

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

  const roundRules = gameMode === 'monikers' ? getRoundRules(currentRound) : null;

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

      {gameMode === 'monikers' && roundRules && (
        <div className="round-indicator" style={{ backgroundColor: roundRules.color }}>
          <div className="round-info">
            <span className="round-icon">{roundRules.icon}</span>
            <span className="round-title">{roundRules.title}</span>
          </div>
          <div className="round-description-inline">{roundRules.description}</div>
          <div className="round-score-tracker">
            Score: {scoredCards.length}/{deckForRounds.length}
          </div>
        </div>
      )}

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

          {gameMode === 'monikers' ? (
            <div className="monikers-controls">
              <button className="skip-button" onClick={skipCurrentCard}>
                Skip Card
              </button>
              <button className="score-button" onClick={scoreCard}>
                Got It! ✓
              </button>
            </div>
          ) : (
            <button className="next-button" onClick={getRandomCard}>
              Next Card →
            </button>
          )}
        </div>
      )}

      {gameMode === 'monikers' && !currentCard && timeLeft === 0 && (
        <div className="round-complete-message">
          <h2>Round {currentRound} Complete!</h2>
          <p>You scored {scoredCards.length} out of {deckForRounds.length} cards!</p>
        </div>
      )}
    </div>
  );
}

export default App;
