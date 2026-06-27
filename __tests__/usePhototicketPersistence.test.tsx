import { afterEach, describe, expect, test } from 'bun:test';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { usePhototicket } from '../src/hooks/usePhototicket';

const KEY = 'filme:phototicket:v1';

afterEach(() => {
  // hook을 언마운트해 저장 effect의 디바운스 타이머(clearTimeout)를 정리한다 — 안 그러면
  // 이전 테스트의 잔여 타이머가 다음 테스트 창에서 localStorage에 써 격리가 깨진다.
  cleanup();
  window.localStorage.clear();
});

describe('#178 usePhototicket localStorage 영속화', () => {
  test('movieInfo/components/fieldVisibility 변경이 저장된다(포스터 제외)', async () => {
    const { result } = renderHook(() => usePhototicket());
    act(() => {
      result.current.updateMovieInfo({ title: '기생충' });
      result.current.updateComponents({ themeColor: '#8E4E69' });
    });
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(KEY) || '{}');
      expect(saved.movieInfo?.title).toBe('기생충');
      expect(saved.components?.themeColor).toBe('#8E4E69');
      // 포스터(croppedImageUrl)·recommendedColors는 직렬화 대상이 아니다.
      expect(saved.croppedImageUrl).toBeUndefined();
      expect(saved.recommendedColors).toBeUndefined();
    });
  });

  test('마운트 시 저장분을 복원한다', async () => {
    window.localStorage.setItem(KEY, JSON.stringify({
      movieInfo: { title: '복원된제목' },
      components: { texture: 'vintage' },
      fieldVisibility: { actors: true },
    }));
    const { result } = renderHook(() => usePhototicket());
    await waitFor(() => {
      // 얕은 병합 — 저장에 없는 필드는 INITIAL 기본값 유지.
      expect(result.current.state.movieInfo.title).toBe('복원된제목');
      expect(result.current.state.components.texture).toBe('vintage');
      expect(result.current.state.components.layout).toBe('minimal');
      expect(result.current.state.fieldVisibility.actors).toBe(true);
    });
    // 복원분이 INITIAL로 덮어써지지 않고 그대로 다시 저장된다(skipFirstSaveRef 불변식).
    await waitFor(() => {
      const stored = JSON.parse(window.localStorage.getItem(KEY) || '{}');
      expect(stored.movieInfo?.title).toBe('복원된제목');
    });
  });

  test('마운트만으로는 저장 안 함 — 첫 커밋 skip이 INITIAL 클로버를 막는다', async () => {
    renderHook(() => usePhototicket()); // 저장분 없음
    // 첫 커밋에서 save를 건너뛰므로(skipFirstSaveRef) 사용자 입력 전엔 아무것도 안 쓴다.
    await new Promise((r) => setTimeout(r, 500)); // 디바운스(400ms) 경과해도
    expect(window.localStorage.getItem(KEY)).toBeNull();
  });

  test('업로드 로고 blob: URL은 저장 시 비운다(chain·format 둘 다)', async () => {
    const { result } = renderHook(() => usePhototicket());
    act(() => {
      result.current.updateComponents({
        chain: 'blob:abc', chainLabel: 'CGV',
        format: 'blob:def', formatLabel: 'IMAX',
      });
    });
    await waitFor(() => {
      const saved = JSON.parse(window.localStorage.getItem(KEY) || '{}');
      expect(saved.components?.chain).toBe('');
      expect(saved.components?.format).toBe('');
      expect(saved.components?.chainLabel).toBe('CGV'); // 라벨은 유지
      expect(saved.components?.formatLabel).toBe('IMAX');
    });
  });

  test('손상된 저장 데이터는 무시하고 INITIAL로 시작', async () => {
    window.localStorage.setItem(KEY, 'not-json{');
    const { result } = renderHook(() => usePhototicket());
    // throw 없이 기본값으로 마운트.
    expect(result.current.state.movieInfo.title).toBe('');
  });
});
