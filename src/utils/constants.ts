/**
 * 프로젝트 전역 상수 정의
 */

// CGV 포토플레이 사양
export const TARGET_WIDTH = 960;
export const TARGET_HEIGHT = 1477;
export const TARGET_RATIO = TARGET_WIDTH / TARGET_HEIGHT; // 0.65:1

// 이미지 품질 설정
export const JPEG_QUALITY = 0.95;

// 극장 체인 목록
export const THEATER_CHAINS = [
  { value: '', label: '선택 안함' },
  { value: 'CGV', label: 'CGV' },
  { value: '롯데시네마', label: '롯데시네마' },
  { value: '메가박스', label: '메가박스' },
  { value: '씨네Q', label: '씨네Q' },
] as const;

// 상영 포맷 목록
export const SCREENING_FORMATS = [
  { value: '', label: '선택 안함' },
  { value: 'IMAX', label: 'IMAX' },
  { value: '4DX', label: '4DX' },
  { value: 'DOLBY CINEMA', label: 'DOLBY CINEMA' },
  { value: 'ScreenX', label: 'ScreenX' },
] as const;

// Canvas 레이아웃 설정
export const CANVAS_LAYOUT = {
  // 하단 오버레이
  overlayHeight: 200,
  overlayOpacity: 0.6,

  // 텍스트 위치
  padding: 40,
  chainY: 70,
  formatY: 120,
  titleY: TARGET_HEIGHT - 140,
  dateY: TARGET_HEIGHT - 90,
  theaterY: TARGET_HEIGHT - 45,

  // 폰트 설정
  fonts: {
    chainSize: 32,
    formatSize: 24,
    titleSize: 48,
    dateSize: 24,
    theaterSize: 20,
  },

  // 색상
  colors: {
    chain: '#ff0000',
    format: '#ffffff',
    title: '#ffffff',
    date: '#ffffff',
    theater: '#cccccc',
    overlay: 'rgba(0, 0, 0, 0.6)',
    formatBg: 'rgba(0, 0, 0, 0.7)',
  },
} as const;
