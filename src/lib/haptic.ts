/**
 * Haptic feedback utility
 */

export type HapticPattern = number | number[];

export function triggerHaptic(pattern: HapticPattern): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export const HapticPatterns = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [50, 50, 50] as number[],
  error: [100, 50, 100] as number[],
  click: 5,
};
