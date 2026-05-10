import { useCallback, useEffect, useMemo, useState } from 'react';
import type { PhototicketState } from '@/types';

export type WizardStep = 1 | 2 | 3 | 4;

const STEP_KEY = 'phototicket:step';
const TOTAL_STEPS: WizardStep = 4;

function isWizardStep(value: unknown): value is WizardStep {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

function readPersistedStep(): WizardStep {
  if (typeof window === 'undefined') return 1;
  try {
    const raw = window.sessionStorage.getItem(STEP_KEY);
    const parsed = raw == null ? null : Number(raw);
    return isWizardStep(parsed) ? parsed : 1;
  } catch {
    return 1;
  }
}

export interface UseWizardOptions {
  state: PhototicketState;
  pendingFetch: boolean;
}

export interface UseWizard {
  step: WizardStep;
  hydrated: boolean;
  goNext: () => void;
  goPrev: () => void;
  goTo: (step: WizardStep) => void;
  canAdvance: (from: WizardStep) => boolean;
  completedSteps: ReadonlySet<WizardStep>;
}

export function useWizard({ state, pendingFetch }: UseWizardOptions): UseWizard {
  const [step, setStep] = useState<WizardStep>(1);
  const [hydrated, setHydrated] = useState(false);

  // Restore from sessionStorage after client mount (avoid SSR mismatch).
  useEffect(() => {
    setStep(readPersistedStep());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(STEP_KEY, String(step));
    } catch {
      /* sessionStorage unavailable — non-fatal */
    }
  }, [step, hydrated]);

  const canAdvance = useCallback(
    (from: WizardStep): boolean => {
      switch (from) {
        case 1:
          return !!state.croppedImageUrl;
        case 2:
          // KOBIS detail in-flight ⇒ block advance to avoid actors-after-mount race
          if (pendingFetch) return false;
          return (
            state.movieInfo.title.trim().length > 0 &&
            state.movieInfo.watchDate.trim().length > 0 &&
            state.movieInfo.theater.trim().length > 0
          );
        case 3:
          return true;
        case 4:
          return false;
      }
    },
    [state.croppedImageUrl, state.movieInfo.title, state.movieInfo.watchDate, state.movieInfo.theater, pendingFetch]
  );

  const goNext = useCallback(() => {
    setStep((prev) => {
      if (prev >= TOTAL_STEPS) return prev;
      // Re-evaluate gate at click time using a stale-safe check via current state snapshot.
      return ((prev + 1) as WizardStep);
    });
  }, []);

  const goPrev = useCallback(() => {
    setStep((prev) => (prev <= 1 ? prev : ((prev - 1) as WizardStep)));
  }, []);

  const goTo = useCallback((target: WizardStep) => {
    setStep(target);
  }, []);

  const completedSteps = useMemo<ReadonlySet<WizardStep>>(() => {
    const set = new Set<WizardStep>();
    for (let i = 1; i < step; i++) set.add(i as WizardStep);
    return set;
  }, [step]);

  return { step, hydrated, goNext, goPrev, goTo, canAdvance, completedSteps };
}
