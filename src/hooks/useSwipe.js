import { useState, useRef } from 'react';

export const useSwipe = (onSwipeLeft, onSwipeRight, threshold = 100) => {
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });
  const [touchEnd, setTouchEnd] = useState({ x: 0, y: 0 });
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const elementRef = useRef(null);

  const minSwipeDistance = threshold;

  const handleTouchStart = (e) => {
    const touch = e.touches ? e.touches[0] : e;
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
    setIsSwiping(true);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;

    const touch = e.touches ? e.touches[0] : e;
    setTouchEnd({ x: touch.clientX, y: touch.clientY });

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    setDragOffset({ x: deltaX, y: deltaY });

    // Determine swipe direction
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;

    const distanceX = touchEnd.x - touchStart.x;
    const distanceY = touchEnd.y - touchStart.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);

    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        onSwipeRight && onSwipeRight();
      } else {
        onSwipeLeft && onSwipeLeft();
      }
    }

    // Reset state
    setIsSwiping(false);
    setSwipeDirection(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handlers = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onMouseDown: handleTouchStart,
    onMouseMove: handleTouchMove,
    onMouseUp: handleTouchEnd,
    onMouseLeave: handleTouchEnd,
  };

  return {
    handlers,
    isSwiping,
    swipeDirection,
    dragOffset,
    elementRef,
  };
};
