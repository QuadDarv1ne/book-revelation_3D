"use client";

import { useEffect, useCallback, useRef } from "react";
import { useToast } from "@/components/ui/Toast";

const REMINDER_DELAY = 2 * 60 * 60 * 1000; // 2 hours
const NOTIFICATION_STORAGE_KEY = "daily-quote-reminder";

interface ReminderState {
  lastShown: number;
  date: string;
}

export function useDailyReminder() {
  const { showToast } = useToast();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAndShowReminder = useCallback(() => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem(NOTIFICATION_STORAGE_KEY);

    if (stored) {
      try {
        const state: ReminderState = JSON.parse(stored);
        if (state.date === today) {
          // Already shown today
          return;
        }
      } catch {
        // Invalid storage, ignore
      }
    }

    // Show reminder
    showToast("Цитата дня ждет вас! Прочитайте мудрость стоиков.", "info");

    // Save state
    localStorage.setItem(
      NOTIFICATION_STORAGE_KEY,
      JSON.stringify({
        lastShown: Date.now(),
        date: today,
      })
    );
  }, [showToast]);

  const scheduleReminder = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      checkAndShowReminder();
    }, REMINDER_DELAY);
  }, [checkAndShowReminder]);

  const showReminderNow = useCallback(() => {
    checkAndShowReminder();
  }, [checkAndShowReminder]);

  useEffect(() => {
    scheduleReminder();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scheduleReminder]);

  return { showReminderNow };
}
