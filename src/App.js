import React, { useState, useEffect } from 'react';
import './App.css';
import { cards } from './data/cards';
import standardCards from './data/content.json';
import { useSwipe } from './hooks/useSwipe';
import { useTheme } from './hooks/useTheme';
import ScoreBoard from './components/ScoreBoard';
import SkippedCardsModal from './components/SkippedCardsModal';
import CardManagement from './components/CardManagement';

function App() {
  const { theme, toggleTheme } = useTheme();

  // Basic game state
  const [currentCard, setCurrentCard] = useState(null);
  const [usedCards, setUsedCards] = useState([]);
  const [showDefinition, setShowDefinition] = useState(true);
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [contentMode, setContentMode] = useState('family'); // 'family' or 'standard'
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
  const [ramboLevel, setRamboLevel] = useState(0); // 0 = none, 1 = rambo (skipped cards), 2 = double rambo (all cards)
  const [originalDeck, setOriginalDeck] = useState([]); // Track the full deck from round 1

  // Team state
  const [numberOfTeams, setNumberOfTeams] = useState(2);
  const [currentTeam, setCurrentTeam] = useState(1);
  const [teamScores, setTeamScores] = useState({});
  const [showTeamTransition, setShowTeamTransition] = useState(false);

  // Track cards used across ALL teams in the current round
  const [roundUsedCards, setRoundUsedCards] = useState([]);

  // Swipe animation state
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationClass, setAnimationClass] = useState('');
  const [showSkippedModal, setShowSkippedModal] = useState(false);

  // Custom cards state
  const [customCards, setCustomCards] = useState({});
  const [showCardManagement, setShowCardManagement] = useState(false);

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

            // In Monikers mode, stop timer and show team transition
            if (gameMode === 'monikers') {
              setTimerRunning(false);
            }
          }

          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeLeft, gameMode]);

  // Load custom cards from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customCards');
    if (saved) {
      try {
        setCustomCards(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to load custom cards:', err);
      }
    }
  }, []);

  // Save custom cards to localStorage whenever they change
  const handleSaveCustomCards = (newCustomCards) => {
    setCustomCards(newCustomCards);
    localStorage.setItem('customCards', JSON.stringify(newCustomCards));
  };

  // Export custom cards to JSON file
  const handleExportCards = () => {
    const dataStr = JSON.stringify(customCards, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `custom-cards-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Get all available cards (default + custom for all teams)
  const getAllAvailableCards = () => {
    // Use either family or standard cards based on content mode
    let allCards = contentMode === 'standard' ? [...standardCards] : [...cards];

    // Add all custom cards from all teams
    Object.values(customCards).forEach(teamCards => {
      if (Array.isArray(teamCards)) {
        allCards = [...allCards, ...teamCards];
      }
    });

    return allCards;
  };

  const getRandomCard = () => {
    const allCards = getAllAvailableCards();
    let availableCards = allCards.filter(card => !usedCards.includes(card.id));

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
        ? allCards
        : allCards.filter(card => card.difficulty === parseInt(selectedDifficulty));
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
      setOriginalDeck([...deck]); // Save a copy of the original deck for rambo mode
      setCurrentRound(1);
      setCurrentTeam(1);
      setScoredCards([]);
      setSkippedCards([]);
      setRoundScores({});
      setRamboLevel(0);

      // Initialize team scores
      const initialTeamScores = {};
      for (let i = 1; i <= numberOfTeams; i++) {
        initialTeamScores[`team${i}`] = { rounds: {} };
      }
      setTeamScores(initialTeamScores);

      setShowTransition(false);
      setShowFinalScore(false);
      setShowTeamTransition(false);
      setCurrentCard(deck[0]);
      setUsedCards([deck[0].id]);
      setRoundUsedCards([deck[0].id]); // Track first card at round level
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
    setCurrentTeam(1);
    setDeckForRounds([]);
    setRoundScores({});
    setTeamScores({});
    setScoredCards([]);
    setSkippedCards([]);
    setRoundUsedCards([]);
    setShowTransition(false);
    setShowFinalScore(false);
    setShowTeamTransition(false);
    setRamboLevel(0);
    setOriginalDeck([]);
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

  // Calculate points from array of cards based on difficulty
  const calculatePoints = (cards) => {
    return cards.reduce((total, card) => total + card.difficulty, 0);
  };

  // Calculate max possible points from deck
  const calculateMaxPoints = (deck) => {
    return deck.reduce((total, card) => total + card.difficulty, 0);
  };

  // Initialize deck for Monikers mode
  const initializeDeck = () => {
    const allCards = getAllAvailableCards();
    let availableCards = selectedDifficulty === 'all'
      ? allCards
      : allCards.filter(card => card.difficulty === parseInt(selectedDifficulty));

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

  // Activate Rambo Mode - progressive system for extra cards
  const activateRamboMode = () => {
    if (currentRound > 1) {
      // Get cards that haven't been used in this round yet
      const alreadyUsedIds = roundUsedCards;

      console.log('Activating Rambo Mode:', {
        ramboLevel,
        skippedCardsCount: skippedCards.length,
        roundUsedCardsCount: roundUsedCards.length,
        deckForRoundsCount: deckForRounds.length,
        originalDeckCount: originalDeck.length
      });

      if (ramboLevel === 0) {
        // First activation: try Rambo Mode with skipped cards only
        const skippedAvailable = skippedCards.filter(card => !alreadyUsedIds.includes(card.id));

        console.log('Level 0 -> Checking skipped cards:', {
          skippedAvailableCount: skippedAvailable.length,
          skippedCards: skippedCards.map(c => c.name)
        });

        if (skippedAvailable.length > 0) {
          // Activate Rambo Mode (level 1) with skipped cards
          setRamboLevel(1);
          const nextCard = skippedAvailable[0];
          console.log('Activating Level 1 with card:', nextCard.name);
          setCurrentCard(nextCard);
          setUsedCards([...usedCards, nextCard.id]);
          setRoundUsedCards([...roundUsedCards, nextCard.id]);
        } else {
          // No skipped cards available, go straight to Double Rambo (level 2)
          // Double Rambo: cards from original deck that are NOT in current round's deck
          const deckIds = deckForRounds.map(c => c.id);
          const allAvailable = originalDeck.filter(card =>
            !alreadyUsedIds.includes(card.id) && !deckIds.includes(card.id)
          );
          console.log('No skipped cards, going to Level 2:', {
            allAvailableCount: allAvailable.length,
            allAvailable: allAvailable.slice(0, 5).map(c => c.name)
          });
          if (allAvailable.length > 0) {
            setRamboLevel(2);
            const nextCard = allAvailable[0];
            setCurrentCard(nextCard);
            setUsedCards([...usedCards, nextCard.id]);
            setRoundUsedCards([...roundUsedCards, nextCard.id]);
          }
        }
      } else if (ramboLevel === 1) {
        // Already in Rambo Mode, upgrade to Double Rambo (level 2)
        // Double Rambo: cards from original deck that are NOT in current round's deck
        const deckIds = deckForRounds.map(c => c.id);
        const allAvailable = originalDeck.filter(card =>
          !alreadyUsedIds.includes(card.id) && !deckIds.includes(card.id)
        );
        console.log('Level 1 -> Level 2:', {
          allAvailableCount: allAvailable.length
        });
        if (allAvailable.length > 0) {
          setRamboLevel(2);
          const nextCard = allAvailable[0];
          setCurrentCard(nextCard);
          setUsedCards([...usedCards, nextCard.id]);
          setRoundUsedCards([...roundUsedCards, nextCard.id]);
        }
      }
    }
  };

  // Get next card in Monikers round
  const getNextCardInRound = () => {
    if (gameMode === 'monikers') {
      // Filter out cards used by ANY team in this round
      let availableCards = deckForRounds.filter(card => !roundUsedCards.includes(card.id));

      console.log('Getting next card in round:', {
        regularDeckAvailable: availableCards.length,
        ramboLevel,
        skippedCardsCount: skippedCards.length
      });

      // If no cards from regular deck but rambo mode is active, use appropriate card pool
      if (availableCards.length === 0 && ramboLevel > 0 && currentRound > 1) {
        if (ramboLevel === 1) {
          // Rambo Mode: use only skipped cards
          availableCards = skippedCards.filter(card => !roundUsedCards.includes(card.id));
          console.log('Rambo Level 1: Using skipped cards:', {
            availableCount: availableCards.length,
            cards: availableCards.slice(0, 3).map(c => c.name)
          });
        } else if (ramboLevel === 2) {
          // Double Rambo Mode: cards from original deck NOT in current round's deck
          const deckIds = deckForRounds.map(c => c.id);
          availableCards = originalDeck.filter(card =>
            !roundUsedCards.includes(card.id) && !deckIds.includes(card.id)
          );
          console.log('Rambo Level 2: Using never-scored cards:', {
            availableCount: availableCards.length,
            cards: availableCards.slice(0, 3).map(c => c.name)
          });
        }
      }

      if (availableCards.length === 0) {
        // No more cards available - show rambo mode option
        setCurrentCard(null);
        console.log('No more cards available');
        // Don't stop timer or end turn - let player choose rambo mode or end turn manually
      } else {
        const nextCard = availableCards[0];
        console.log('Next card:', nextCard.name);
        setCurrentCard(nextCard);
        // Add to both usedCards (for current team) and roundUsedCards (for all teams)
        setUsedCards([...usedCards, nextCard.id]);
        setRoundUsedCards([...roundUsedCards, nextCard.id]);
      }
    } else {
      getRandomCard();
    }
  };

  // Complete current team's turn
  const completeTeamTurn = () => {
    const points = calculatePoints(scoredCards);
    const maxPoints = calculateMaxPoints(deckForRounds);

    const turnScore = {
      scored: scoredCards.length,
      skipped: skippedCards.length,
      total: deckForRounds.length,
      points: points,
      maxPoints: maxPoints,
      percentage: maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0,
      scoredCardsList: [...scoredCards],
      skippedCardsList: [...skippedCards]
    };

    // Save this team's score for this round
    const updatedTeamScores = { ...teamScores };
    if (!updatedTeamScores[`team${currentTeam}`]) {
      updatedTeamScores[`team${currentTeam}`] = { rounds: {} };
    }
    updatedTeamScores[`team${currentTeam}`].rounds[`round${currentRound}`] = turnScore;
    setTeamScores(updatedTeamScores);

    // Check if all teams have played this round
    if (currentTeam < numberOfTeams) {
      // More teams need to play this round
      setShowTeamTransition(true);
    } else {
      // All teams finished this round, complete the round
      completeRound(updatedTeamScores);
    }
  };

  // Complete current round (after all teams have played)
  const completeRound = (finalTeamScores = teamScores) => {
    // Aggregate all scored cards from all teams in this round
    let allScoredCards = [];
    for (let i = 1; i <= numberOfTeams; i++) {
      const teamRoundData = finalTeamScores[`team${i}`]?.rounds[`round${currentRound}`];
      if (teamRoundData && teamRoundData.scoredCardsList) {
        allScoredCards = [...allScoredCards, ...teamRoundData.scoredCardsList];
      }
    }

    // Calculate round totals
    const totalPoints = Object.keys(finalTeamScores).reduce((sum, teamKey) => {
      const roundData = finalTeamScores[teamKey].rounds[`round${currentRound}`];
      return sum + (roundData?.points || 0);
    }, 0);

    const maxPoints = calculateMaxPoints(deckForRounds) * numberOfTeams;

    const roundScore = {
      totalPoints: totalPoints,
      maxPoints: maxPoints,
      percentage: maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0,
      allScoredCards: allScoredCards
    };

    setRoundScores({
      ...roundScores,
      [`round${currentRound}`]: roundScore
    });

    // Use the aggregated scored cards for the next round
    setScoredCards(allScoredCards);

    if (currentRound < 3) {
      setShowTransition(true);
    } else {
      setShowFinalScore(true);
    }
  };

  // Start next team's turn
  const startNextTeam = () => {
    setCurrentTeam(currentTeam + 1);
    setShowTeamTransition(false);

    // Reset turn state (but keep roundUsedCards to prevent card repetition)
    setScoredCards([]);
    setSkippedCards([]);
    setUsedCards([]);
    setTimeLeft(60);
    setCardsCompleted(0);
    setTimerRunning(false);
    setRamboLevel(0); // Reset rambo mode for new team

    // Start with first available card from the deck that hasn't been used this round
    const availableCards = deckForRounds.filter(card => !roundUsedCards.includes(card.id));
    if (availableCards.length > 0) {
      const firstCard = availableCards[0];
      setCurrentCard(firstCard);
      setUsedCards([firstCard.id]);
      setRoundUsedCards([...roundUsedCards, firstCard.id]);
    }
  };

  // Start next round
  const startNextRound = () => {
    setCurrentRound(currentRound + 1);
    setCurrentTeam(1);

    // Use only the scored cards from previous round as the new deck
    const newDeck = shuffleArray(scoredCards);
    setDeckForRounds(newDeck);

    // Reset round state (including roundUsedCards for the new round)
    setScoredCards([]);
    setSkippedCards([]);
    setUsedCards([]);
    setRoundUsedCards([]);
    setTimeLeft(60);
    setCardsCompleted(0);
    setShowTransition(false);
    setRamboLevel(0); // Reset rambo mode for new round

    // Start with first card if deck is not empty
    if (newDeck.length > 0) {
      setCurrentCard(newDeck[0]);
      setUsedCards([newDeck[0].id]);
      setRoundUsedCards([newDeck[0].id]); // Track first card of new round
    } else {
      // If no cards were scored, show final score
      setCurrentCard(null);
      setShowFinalScore(true);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 1: return '#ffffff'; // White background for Level 1
      case 2: return '#f97316'; // Orange background for Level 2
      case 3: return '#dc2626'; // Red background for Level 3
      default: return '#64748b';
    }
  };

  const getDifficultyTextColor = (difficulty) => {
    switch(difficulty) {
      case 1: return '#1e1e2e'; // Dark text for white background
      case 2: return '#ffffff'; // White text for orange background
      case 3: return '#ffffff'; // White text for red background
      default: return '#e0e0e0';
    }
  };

  const getDifficultyBadgeColor = (difficulty) => {
    switch(difficulty) {
      case 1: return '#6b7280'; // Gray badge for white card
      case 2: return '#c2410c'; // Darker orange for badge
      case 3: return '#991b1b'; // Darker red for badge
      default: return '#475569';
    }
  };

  const getDifficultyStars = (difficulty) => {
    return '⭐'.repeat(difficulty);
  };

  // Swipe handlers for Quick Play mode
  const handleSwipeRight = () => {
    if (isAnimating || !currentCard || gameMode === 'monikers') return;
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
    if (isAnimating || !currentCard || gameMode === 'monikers') return;
    setIsAnimating(true);
    setAnimationClass('card-swipe-left');
    setSkippedCards([...skippedCards, currentCard]);
    setTimeout(() => {
      getRandomCard();
      setAnimationClass('');
      setIsAnimating(false);
    }, 300);
  };

  // Initialize swipe hook
  const { handlers, swipeDirection, dragOffset, isSwiping } = useSwipe(handleSwipeLeft, handleSwipeRight, 100);

  // Handle replaying a skipped card
  const handleReplayCard = (card) => {
    setCurrentCard(card);
    setSkippedCards(skippedCards.filter(c => c.id !== card.id));
    setShowSkippedModal(false);
  };

  // Show team transition screen (when switching between teams in a round)
  if (showTeamTransition) {
    const prevTeamScore = teamScores[`team${currentTeam}`]?.rounds[`round${currentRound}`];

    return (
      <div className="App">
        <div className="transition-screen">
          <h1>Team {currentTeam} - Time's Up!</h1>
          {prevTeamScore && (
            <div className="round-score">
              <h2>Team {currentTeam} Score: {prevTeamScore.points}/{prevTeamScore.maxPoints} points</h2>
              <p className="score-percentage">{prevTeamScore.scored}/{prevTeamScore.total} cards • {prevTeamScore.percentage}% of points</p>
            </div>
          )}

          <div className="next-round-info">
            <h2 style={{ color: '#3b82f6' }}>
              🎮 Team {currentTeam + 1}'s Turn
            </h2>
            <p className="round-description">Get ready! Team {currentTeam + 1} is up next.</p>
          </div>

          <button
            className="start-button"
            onClick={startNextTeam}
          >
            Start Team {currentTeam + 1}
          </button>
        </div>
      </div>
    );
  }

  // Show round transition screen
  if (showTransition) {
    const roundRules = getRoundRules(currentRound + 1);
    const prevRoundScore = roundScores[`round${currentRound}`];

    return (
      <div className="App">
        <div className="transition-screen">
          <h1>Round {currentRound} Complete!</h1>
          <div className="round-score">
            <h2>Total Score: {prevRoundScore.totalPoints}/{prevRoundScore.maxPoints} points</h2>
            <p className="score-percentage">{prevRoundScore.percentage}% of points</p>
          </div>

          <div className="team-scores-breakdown">
            <h3>Team Breakdown:</h3>
            {Array.from({ length: numberOfTeams }, (_, i) => i + 1).map(teamNum => {
              const teamData = teamScores[`team${teamNum}`]?.rounds[`round${currentRound}`];
              return teamData ? (
                <div key={teamNum} className="team-score-row">
                  <span className="team-name">Team {teamNum}:</span>
                  <span className="team-points">{teamData.points}/{teamData.maxPoints} pts ({teamData.scored}/{teamData.total} cards)</span>
                </div>
              ) : null;
            })}
          </div>

          <div className="next-round-info">
            <h2 style={{ color: roundRules.color }}>
              {roundRules.icon} {roundRules.title}
            </h2>
            <p className="round-description">{roundRules.description}</p>
            {prevRoundScore.allScoredCards && prevRoundScore.allScoredCards.length > 0 ? (
              <p className="next-round-cards" style={{ marginTop: '15px', color: '#a0a0a0' }}>
                You'll play with the {prevRoundScore.allScoredCards.length} card{prevRoundScore.allScoredCards.length !== 1 ? 's' : ''} scored in Round {currentRound}
              </p>
            ) : (
              <p className="next-round-cards" style={{ marginTop: '15px', color: '#ef4444', fontWeight: 'bold' }}>
                No cards were scored! The game will end.
              </p>
            )}
          </div>

          <button
            className="start-button"
            onClick={startNextRound}
            disabled={!prevRoundScore.allScoredCards || prevRoundScore.allScoredCards.length === 0}
            style={(!prevRoundScore.allScoredCards || prevRoundScore.allScoredCards.length === 0) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            {prevRoundScore.allScoredCards && prevRoundScore.allScoredCards.length > 0 ? `Start Round ${currentRound + 1}` : 'End Game'}
          </button>
        </div>
      </div>
    );
  }

  // Show final score screen
  if (showFinalScore) {
    // Calculate team totals
    const teamTotals = {};
    for (let i = 1; i <= numberOfTeams; i++) {
      const teamKey = `team${i}`;
      const teamData = teamScores[teamKey];
      let totalPoints = 0;
      let maxPoints = 0;

      if (teamData && teamData.rounds) {
        Object.values(teamData.rounds).forEach(roundData => {
          totalPoints += roundData.points || 0;
          maxPoints += roundData.maxPoints || 0;
        });
      }

      teamTotals[teamKey] = {
        points: totalPoints,
        maxPoints: maxPoints,
        percentage: maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0
      };
    }

    // Find winning team
    const sortedTeams = Object.entries(teamTotals).sort((a, b) => b[1].points - a[1].points);
    const winningTeam = sortedTeams[0];


    return (
      <div className="App">
        <div className="final-score-screen">
          <h1>🎉 Game Complete! 🎉</h1>
          <div className="total-score">
            <h2>Winner: Team {winningTeam[0].replace('team', '')}!</h2>
            <p className="score-percentage">{winningTeam[1].points} points ({winningTeam[1].percentage}%)</p>
          </div>

          <div className="round-breakdown">
            <h3>Team Standings:</h3>
            {sortedTeams.map(([teamKey, teamTotal], index) => {
              const teamNum = teamKey.replace('team', '');
              return (
                <div key={teamKey} className="team-final-score" style={{ borderLeft: `4px solid ${index === 0 ? '#22c55e' : '#64748b'}` }}>
                  <span className="team-position">{index + 1}. Team {teamNum}</span>
                  <span className="team-final-points">
                    {teamTotal.points}/{teamTotal.maxPoints} pts ({teamTotal.percentage}%)
                  </span>
                </div>
              );
            })}
          </div>

          <div className="round-breakdown">
            <h3>Round Breakdown:</h3>
            {[1, 2, 3].map(roundNum => {
              const score = roundScores[`round${roundNum}`];
              const rules = getRoundRules(roundNum);
              return score ? (
                <div key={roundNum} className="round-summary" style={{ borderLeft: `4px solid ${rules.color}` }}>
                  <span className="round-icon">{rules.icon}</span>
                  <span className="round-name">Round {roundNum}</span>
                  <span className="round-score-text">
                    {score.totalPoints}/{score.maxPoints} pts ({score.percentage}%)
                  </span>
                </div>
              ) : null;
            })}
          </div>

          <div className="final-buttons">
            <button className="start-button" onClick={() => startGame('monikers')}>
              Play Again
            </button>
            <button className="back-button" onClick={resetGame}>
              Back to Menu
            </button>
            {Object.values(customCards).reduce((sum, cards) => sum + cards.length, 0) > 0 && (
              <button
                className="mode-button"
                onClick={handleExportCards}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  marginTop: '10px'
                }}
              >
                📥 Export Custom Cards
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show card management screen
  if (showCardManagement) {
    return (
      <CardManagement
        numberOfTeams={numberOfTeams}
        customCards={customCards}
        onSaveCards={handleSaveCustomCards}
        onBack={() => setShowCardManagement(false)}
      />
    );
  }

  if (!gameStarted) {
    return (
      <div className="App">
        <div className="welcome-screen">
          <h1>Mini-Miney-Monikers</h1>
          <p className="tagline">Addy-J and Cammy-K Jam</p>

          <div className="content-mode-selector">
            <h3>Select Card Set:</h3>
            <div className="mode-toggle">
              <button
                className={contentMode === 'family' ? 'mode-toggle-btn active' : 'mode-toggle-btn'}
                onClick={() => setContentMode('family')}
              >
                👨‍👩‍👧‍👦 Family Mode
              </button>
              <button
                className={contentMode === 'standard' ? 'mode-toggle-btn active' : 'mode-toggle-btn'}
                onClick={() => setContentMode('standard')}
              >
                🌟 Standard Mode
              </button>
            </div>
            <p className="mode-description">
              {contentMode === 'family'
                ? 'Family-friendly cards perfect for all ages!'
                : 'Current cultural references and noteworthy topics!'}
            </p>
          </div>

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

          <div className="teams-selector">
            <h3>Number of Teams:</h3>
            <select
              value={numberOfTeams}
              onChange={(e) => setNumberOfTeams(parseInt(e.target.value))}
              className="teams-dropdown"
            >
              <option value={2}>2 Teams</option>
              <option value={3}>3 Teams</option>
              <option value={4}>4 Teams</option>
              <option value={5}>5 Teams</option>
              <option value={6}>6 Teams</option>
            </select>
          </div>

          <div className="custom-cards-section" style={{ margin: '20px 0' }}>
            <button
              className="mode-button"
              onClick={() => setShowCardManagement(true)}
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                width: '100%',
                maxWidth: '300px',
                margin: '0 auto',
                display: 'block'
              }}
            >
              📝 Manage Custom Cards
              {Object.values(customCards).reduce((sum, cards) => sum + cards.length, 0) > 0 && (
                <span style={{ marginLeft: '8px', fontSize: '0.9em' }}>
                  ({Object.values(customCards).reduce((sum, cards) => sum + cards.length, 0)} cards)
                </span>
              )}
            </button>
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
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'light' ? '🌙' : '☀️'}
        </button>
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
            {gameMode === 'monikers' && currentCard && (
              <button className="timer-button next-round" onClick={completeTeamTurn}>
                End Turn →
              </button>
            )}
          </div>
          {timeLeft === 0 && (
            <div className="score-display">
              Cards Completed: {cardsCompleted}
            </div>
          )}
        </div>
      </div>

      {gameMode === 'monikers' && roundRules && (
        <div className="round-indicator">
          <div className="compact-round-header" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px 20px',
            backgroundColor: 'rgba(30, 30, 46, 0.95)',
            borderRadius: '12px',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <span style={{
                fontSize: '2rem',
                fontWeight: 'bold',
                color: roundRules.color,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                TEAM {currentTeam}
              </span>
              <span style={{ color: '#64748b', fontSize: '1.5rem' }}>•</span>
              <span className="round-icon" style={{ fontSize: '1.5rem' }}>{roundRules.icon}</span>
              <span className="round-title" style={{ fontSize: '1.1rem', color: '#e0e0e0' }}>{roundRules.title}</span>
              {ramboLevel > 0 && currentRound > 1 && (
                <span style={{
                  padding: '4px 10px',
                  backgroundColor: ramboLevel === 2 ? '#dc2626' : '#ef4444',
                  color: '#ffffff',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}>
                  {ramboLevel === 2 ? '🔥 DOUBLE RAMBO' : '🎯 RAMBO'}
                </span>
              )}
            </div>
          </div>
          <div className="round-description-inline" style={{ fontSize: '0.95rem', marginBottom: '10px' }}>{roundRules.description}</div>
          <div className="round-score-tracker">
            Score: {calculatePoints(scoredCards)}/{calculateMaxPoints(deckForRounds)} pts ({scoredCards.length}/{deckForRounds.length} cards)
            {skippedCards.length > 0 && (
              <button
                className="review-skipped-btn"
                onClick={() => setShowSkippedModal(true)}
              >
                📋 Review Skipped ({skippedCards.length})
              </button>
            )}
          </div>
        </div>
      )}

      {gameMode === 'quick' && gameStarted && (
        <ScoreBoard
          score={scoredCards.length}
          skippedCount={skippedCards.length}
          onReviewSkipped={() => setShowSkippedModal(true)}
        />
      )}

      {currentCard && (
        <div className="card-container">
          <div
            className={`game-card ${animationClass}`}
            style={{
              backgroundColor: getDifficultyColor(currentCard.difficulty),
              borderColor: getDifficultyColor(currentCard.difficulty),
              color: getDifficultyTextColor(currentCard.difficulty),
              transform: gameMode === 'quick' && isSwiping ? `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${dragOffset.x * 0.1}deg)` : '',
              opacity: gameMode === 'quick' && swipeDirection ? 0.7 : 1
            }}
            {...(gameMode === 'quick' ? handlers : {})}
          >
            <div
              className="difficulty-badge"
              style={{
                backgroundColor: currentCard.custom ? '#667eea' : getDifficultyBadgeColor(currentCard.difficulty),
                color: '#ffffff'
              }}
            >
              {currentCard.custom ? 'CUSTOM' : `Level ${currentCard.difficulty}`}
            </div>

            <h1 className="card-name" style={{ color: getDifficultyTextColor(currentCard.difficulty) }}>
              {currentCard.name}
            </h1>

            <div className="definition-section">
              <button
                className="toggle-definition"
                onClick={() => setShowDefinition(!showDefinition)}
                style={{
                  backgroundColor: currentCard.difficulty === 1 ? '#f3f4f6' : 'rgba(255, 255, 255, 0.2)',
                  color: getDifficultyTextColor(currentCard.difficulty),
                  border: `1px solid ${currentCard.difficulty === 1 ? '#d1d5db' : 'rgba(255, 255, 255, 0.3)'}`
                }}
              >
                {showDefinition ? 'Hide Hint' : 'Show Hint'}
              </button>

              {showDefinition && (
                <p className="card-definition" style={{ color: getDifficultyTextColor(currentCard.difficulty) }}>
                  {currentCard.definition}
                </p>
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

      {gameMode === 'monikers' && !currentCard && timeLeft > 0 && currentRound > 1 && (
        <div className="card-container">
          <div
            className="game-card"
            style={{
              backgroundColor: ramboLevel === 1 ? '#dc2626' : '#ef4444',
              borderColor: ramboLevel === 1 ? '#dc2626' : '#ef4444',
              color: '#ffffff',
              cursor: 'pointer'
            }}
            onClick={activateRamboMode}
          >
            <div
              className="difficulty-badge"
              style={{
                backgroundColor: ramboLevel === 1 ? '#7f1d1d' : '#991b1b',
                color: '#ffffff'
              }}
            >
              {ramboLevel === 1 ? 'DOUBLE RAMBO MODE' : 'RAMBO MODE'}
            </div>

            <h1 className="card-name" style={{ color: '#ffffff', fontSize: ramboLevel === 1 ? '2.2rem' : '2.5rem', marginTop: '40px' }}>
              {ramboLevel === 1 ? '🔥 GO DOUBLE RAMBO!' : '🎯 GO RAMBO!'}
            </h1>

            <div className="definition-section">
              <p className="card-definition" style={{ color: '#ffffff', fontSize: '1.1rem', marginTop: '20px' }}>
                {ramboLevel === 1
                  ? 'Skipped cards exhausted! Click to play cards from the original deck that were never scored - the ultimate long shots!'
                  : 'All regular cards have been played! Click to play your skipped cards for redemption opportunities.'}
              </p>
              <p style={{ color: '#fca5a5', fontSize: '0.9rem', marginTop: '15px', fontStyle: 'italic' }}>
                {ramboLevel === 1
                  ? `${originalDeck.filter(card => {
                      const deckIds = deckForRounds.map(c => c.id);
                      return !roundUsedCards.includes(card.id) && !deckIds.includes(card.id);
                    }).length} cards available`
                  : `${skippedCards.filter(card => !roundUsedCards.includes(card.id)).length} skipped cards available`}
              </p>
            </div>
          </div>
          <div className="monikers-controls">
            <button className="score-button" onClick={activateRamboMode} style={{ width: '100%' }}>
              {ramboLevel === 1 ? 'Activate Double Rambo Mode 🔥' : 'Activate Rambo Mode 🎯'}
            </button>
          </div>
        </div>
      )}

      {gameMode === 'monikers' && !currentCard && timeLeft === 0 && (
        <div className="round-complete-message">
          <h2>Round {currentRound} Complete!</h2>
          <p>You scored {calculatePoints(scoredCards)}/{calculateMaxPoints(deckForRounds)} points ({scoredCards.length}/{deckForRounds.length} cards)!</p>
        </div>
      )}

      {showSkippedModal && (
        <SkippedCardsModal
          skippedCards={skippedCards}
          onClose={() => setShowSkippedModal(false)}
          onSelectCard={handleReplayCard}
          getDifficultyColor={getDifficultyColor}
          getDifficultyTextColor={getDifficultyTextColor}
          getDifficultyBadgeColor={getDifficultyBadgeColor}
          getDifficultyStars={getDifficultyStars}
        />
      )}
    </div>
  );
}

export default App;
