import React from 'react';
import './ScoreBoard.css';

const ScoreBoard = ({ score, skippedCount, onReviewSkipped }) => {
  return (
    <div className="scoreboard">
      <div className="score-item">
        <span className="score-label">Scored</span>
        <span className="score-value scored">{score}</span>
      </div>
      <div className="score-divider">|</div>
      <div className="score-item">
        <span className="score-label">Skipped</span>
        <span className="score-value skipped">{skippedCount}</span>
      </div>
      {skippedCount > 0 && (
        <button className="review-skipped-btn" onClick={onReviewSkipped}>
          Review
        </button>
      )}
    </div>
  );
};

export default ScoreBoard;
