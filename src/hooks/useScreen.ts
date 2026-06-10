import { useEffect, useState } from 'react';
import type { PhototicketState } from '@/types';

export type Screen = 'editor' | 'done';

const SCREEN_KEY = 'phototicket:screen';
const LEGACY_PHASE_KEY = 'phototicket:phase';
const LEGACY_STEP_KEY = 'phototicket:step';

export interface CanExportParams {
  hasPoster: boolean;
  title: string;
  titleOg: string;
  releaseDate: string | undefined;
  pendingFetch: boolean;
}

export function canExport({
  hasPoster,
  title,
  titleOg,
  releaseDate,
  pendingFetch,
}: CanExportParams): boolean {
  if (pendingFetch) return false;
  const release = (releaseDate ?? '').trim();
  return (
    hasPoster &&
    title.trim().length > 0 &&
    titleOg.trim().length > 0 &&
    release.length >= 4
  );
}

function migrateAndReadScreen(): Screen {
  if (typeof window === 'undefined') return 'editor';
  try {
    const stored = window.sessionStorage.getItem(SCREEN_KEY);
    if (stored === 'editor' || stored === 'done') return stored;

    // 레거시 phase(1|2)/step 키는 값과 무관하게 'editor'로 흡수 — 이전 2-step의
    // 어느 지점이었든 단일 에디터가 전부 담는다. 'done'은 내보내기 직후에만 의미가
    // 있어서 레거시 키로부터 복원하지 않는다.
    window.sessionStorage.removeItem(LEGACY_PHASE_KEY);
    window.sessionStorage.removeItem(LEGACY_STEP_KEY);
    window.sessionStorage.setItem(SCREEN_KEY, 'editor');
    return 'editor';
  } catch {
    return 'editor';
  }
}

export interface UseScreenOptions {
  state: PhototicketState;
  pendingFetch: boolean;
}

export interface UseScreen {
  screen: Screen;
  hydrated: boolean;
  goTo: (screen: Screen) => void;
  /** 필수 입력(포스터·제목·원제·개봉연도)이 채워져 완료 화면으로 넘어갈 수 있는지. */
  canExport: boolean;
}

export function useScreen({ state, pendingFetch }: UseScreenOptions): UseScreen {
  const [screen, setScreen] = useState<Screen>('editor');
  const [hydrated, setHydrated] = useState(false);

  // 의도적으로 screen='editor'로 시작해 SSR(window 없음 → 'editor')과 첫 클라 렌더를 일치시킨다.
  // 마운트 후 effect에서 sessionStorage를 읽어 갱신 → 하이드레이션 미스매치 방지.
  // ⚠️ useState(() => migrateAndReadScreen()) 레이지 이니셜라이저로 바꾸지 말 것:
  //    클라 초기 렌더가 저장된 'done'을 읽으면 서버 HTML('editor')과 어긋나 미스매치가 난다.
  // persistence는 아래 effect에서 hydrated 게이트로 막아 두 effect 간 경쟁도 없다.
  useEffect(() => {
    setScreen(migrateAndReadScreen());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.sessionStorage.setItem(SCREEN_KEY, screen);
    } catch {
      /* sessionStorage unavailable */
    }
  }, [screen, hydrated]);

  const exportReady = canExport({
    hasPoster: !!state.croppedImageUrl,
    title: state.movieInfo.title,
    titleOg: state.movieInfo.titleOg,
    releaseDate: state.movieInfo.releaseDate,
    pendingFetch,
  });

  // setScreen은 React가 보장하는 안정 참조 — 래핑 useCallback 불필요.
  const goTo = setScreen;

  return { screen, hydrated, goTo, canExport: exportReady };
}
