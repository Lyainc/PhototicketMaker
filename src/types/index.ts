/**
 * 포토티켓 데이터 타입 정의
 */

// CGV 포토플레이 사양
export interface PhototicketDimensions {
  width: number;
  height: number;
  ratio: number;
}

// 영화 정보
export interface MovieInfo {
  title: string;
  watchDate: string; // YYYY. MM. DD.
  theater?: string;
}

// 컴포넌트 선택
export interface TicketComponents {
  chain?: string; // 'CGV' | '롯데시네마' | '메가박스' | '씨네Q'
  format?: string; // 'IMAX' | '4DX' | 'DOLBY CINEMA' | 'ScreenX'
}

// 전체 포토티켓 상태
export interface PhototicketState {
  croppedImageUrl: string | null;
  movieInfo: MovieInfo;
  components: TicketComponents;
}

// Window 타입 확장 (Canvas 노출)
declare global {
  interface Window {
    phototicketCanvas?: HTMLCanvasElement;
  }
}

export {};
