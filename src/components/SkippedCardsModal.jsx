import React from 'react';
import './SkippedCardsModal.css';

const SkippedCardsModal = ({ skippedCards, onClose, onSelectCard, getDifficultyColor, getDifficultyStars }) => {
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
              style={{ borderLeftColor: getDifficultyColor(card.difficulty) }}
              onClick={() => onSelectCard(card)}
            >
              <div className="skipped-card-header">
                <h3>{card.name}</h3>
                <span
                  className="skipped-card-difficulty"
                  style={{ backgroundColor: getDifficultyColor(card.difficulty) }}
                >
                  {getDifficultyStars(card.difficulty)}
                </span>
              </div>
              <p className="skipped-card-definition">{card.definition}</p>
              <button className="replay-card-btn">
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
