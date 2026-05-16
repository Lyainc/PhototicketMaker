/**
 * 극장 체인별 상영 포맷 매핑.
 *
 * 키: THEATER_CHAINS의 value (영문 식별자, assets.generated의 CHAIN_ASSETS 참조)
 * 값: 해당 체인이 운영하는 SCREENING_FORMATS의 value 배열
 *
 * 빈 배열 또는 키 없음 → 전체 fallback (FormatPicker가 모든 포맷 노출)
 *
 * ※ 사용자가 직접 채우는 데이터입니다. 자동 채우지 마세요.
 */
export const CHAIN_FORMAT_MAP: Readonly<Record<string, readonly string[]>> = {
  cgv: [],
  cineq: [],
  lotte: [],
  megabox: [],
};

export function allowedFormatsForChain(chain: string): readonly string[] | null {
  if (!chain) return null;
  const list = CHAIN_FORMAT_MAP[chain];
  if (!list || list.length === 0) return null;
  return list;
}
