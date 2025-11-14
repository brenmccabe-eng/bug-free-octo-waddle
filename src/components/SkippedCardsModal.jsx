import React from 'react';
import './SkippedCardsModal.css';

const SkippedCardsModal = ({
  skippedCards,
  onClose,
  onSelectCard,
  getDifficultyColor,
  getDifficultyTextColor,
  getDifficultyBadgeColor,
  getDifficultyStars
}) => {
  if (!skippedCards || skippedCards.length === 0) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Skipped Cards ({skippedCards.length})</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="skipped-cards-list">
          {skippedCards.map((card, index) => (
            <div
              key={`${card.id}-${index}`}
              className="skipped-card-item"
              style={{
                backgroundColor: getDifficultyColor(card.difficulty),
                borderLeftColor: getDifficultyBadgeColor ? getDifficultyBadgeColor(card.difficulty) : getDifficultyColor(card.difficulty),
                color: getDifficultyTextColor ? getDifficultyTextColor(card.difficulty) : '#e0e0e0'
              }}
              onClick={() => onSelectCard(card)}
            >
              <div className="skipped-card-header">
                <h3 style={{ color: getDifficultyTextColor ? getDifficultyTextColor(card.difficulty) : '#e0e0e0' }}>
                  {card.name}
                </h3>
                <span
                  className="skipped-card-difficulty"
                  style={{
                    backgroundColor: getDifficultyBadgeColor ? getDifficultyBadgeColor(card.difficulty) : getDifficultyColor(card.difficulty),
                    color: '#ffffff'
                  }}
                >
                  {getDifficultyStars ? getDifficultyStars(card.difficulty) : `Level ${card.difficulty}`}
                </span>
              </div>
              <p
                className="skipped-card-definition"
                style={{ color: getDifficultyTextColor ? getDifficultyTextColor(card.difficulty) : '#a0a0a0' }}
              >
                {card.definition}
              </p>
              <button
                className="replay-card-btn"
                style={{
                  backgroundColor: card.difficulty === 1 ? '#f3f4f6' : 'rgba(255, 255, 255, 0.2)',
                  color: getDifficultyTextColor ? getDifficultyTextColor(card.difficulty) : '#e0e0e0',
                  border: `1px solid ${card.difficulty === 1 ? '#d1d5db' : 'rgba(255, 255, 255, 0.3)'}`
                }}
              >
                Play this card →
              </button>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button className="modal-close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkippedCardsModal;
