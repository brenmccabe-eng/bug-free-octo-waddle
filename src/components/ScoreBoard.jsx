import React from 'react';

const ScoreBoard = ({ score, skippedCount, onReviewSkipped }) => {
  return (
    <div className="scoreboard">
      <div className="score-item scored">
        <span className="score-label">✅ Scored:</span>
        <span className="score-value">{score}</span>
      </div>
      <div className="score-item skipped">
        <span className="score-label">⏭️ Skipped:</span>
        <span className="score-value">{skippedCount}</span>
      </div>
      {skippedCount > 0 && (
        <button 
          className="review-skipped-button"
          onClick={onReviewSkipped}
        >
          Review Skipped
        </button>
      )}
    </div>
  );
};

export default ScoreBoard;
