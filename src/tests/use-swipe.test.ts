import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useSwipe } from '../hooks/use-swipe';

describe('useSwipe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен вызывать onSwipeLeft при свайпе влево', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    
    renderHook(() => useSwipe({ 
      onSwipeLeft, 
      onSwipeRight,
      threshold: 50 
    }));

    // Симулируем touch события
    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 200, clientY: 100 } as any],
    });
    
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 100, clientY: 100 } as any],
    });
    
    const touchEndEvent = new TouchEvent('touchend');

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchMoveEvent);
    document.dispatchEvent(touchEndEvent);

    expect(onSwipeLeft).toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('должен вызывать onSwipeRight при свайпе вправо', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    
    renderHook(() => useSwipe({ 
      onSwipeLeft, 
      onSwipeRight,
      threshold: 50 
    }));

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as any],
    });
    
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 200, clientY: 100 } as any],
    });
    
    const touchEndEvent = new TouchEvent('touchend');

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchMoveEvent);
    document.dispatchEvent(touchEndEvent);

    expect(onSwipeRight).toHaveBeenCalled();
    expect(onSwipeLeft).not.toHaveBeenCalled();
  });

  it('не должен вызывать обработчики при свайпе меньше порога', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    
    renderHook(() => useSwipe({ 
      onSwipeLeft, 
      onSwipeRight,
      threshold: 50 
    }));

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 100, clientY: 100 } as any],
    });
    
    const touchMoveEvent = new TouchEvent('touchmove', {
      touches: [{ clientX: 130, clientY: 100 } as any], // Меньше порога 50
    });
    
    const touchEndEvent = new TouchEvent('touchend');

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchMoveEvent);
    document.dispatchEvent(touchEndEvent);

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });

  it('не должен реагировать когда enabled = false', () => {
    const onSwipeLeft = vi.fn();
    const onSwipeRight = vi.fn();
    
    renderHook(() => useSwipe({ 
      onSwipeLeft, 
      onSwipeRight,
      threshold: 50,
      enabled: false
    }));

    const touchStartEvent = new TouchEvent('touchstart', {
      touches: [{ clientX: 200, clientY: 100 } as any],
    });
    
    const touchEndEvent = new TouchEvent('touchend');

    document.dispatchEvent(touchStartEvent);
    document.dispatchEvent(touchEndEvent);

    expect(onSwipeLeft).not.toHaveBeenCalled();
    expect(onSwipeRight).not.toHaveBeenCalled();
  });
});
