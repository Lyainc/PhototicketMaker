import { useEffect, useState } from 'react';
import type { PhototicketState } from '@/types';

export type Screen = 'editor' | 'done';

const SCREEN_KEY = 'phototicket:screen';
const LEGACY_PHASE_KEY = 'phototicket:phase';
const LEGACY_STEP_KEY = 'phototicket:step';

interface CanExportParams {
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
    if (stored == null) {
      // 레거시 phase(1|2)/step 키는 값과 무관하게 'editor'로 흡수 — 이전 2-step의
      // 어느 지점이었든 단일 에디터가 전부 담는다.
      window.sessionStorage.removeItem(LEGACY_PHASE_KEY);
      window.sessionStorage.removeItem(LEGACY_STEP_KEY);
      window.sessionStorage.setItem(SCREEN_KEY, 'editor');
    }
    // 'done'은 내보내기 직후에만 의미 있는 일시 상태인데 포스터(blob)는 세션에
    // 영속되지 않으므로, 저장값과 무관하게 복원은 항상 'editor' — 내보낼 티켓이
    // 없는 빈 완료 화면 진입을 영속 레이어에서 원천 차단한다.
    return 'editor';
  } catch {
    return 'editor';
  }
}

interface UseScreenOptions {
  state: PhototicketState;
  pendingFetch: boolean;
}

interface UseScreen {
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
  // 마운트 후 effect에서 sessionStorage를 읽어(레거시 키 정리 포함) 갱신 → 하이드레이션 미스매치 방지.
  // ⚠️ useState(() => migrateAndReadScreen()) 레이지 이니셜라이저로 바꾸지 말 것:
  //    초기 렌더가 storage 기반 값을 읽기 시작하면 서버 HTML('editor')과 어긋나 미스매치가 난다
  //    (지금은 복원값이 항상 'editor'지만, 복원값이 다양해지는 순간 그대로 함정이 된다).
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
