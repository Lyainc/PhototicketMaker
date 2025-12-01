'use client';

import { useEffect, useRef } from 'react';
import { TARGET_WIDTH, TARGET_HEIGHT, CANVAS_LAYOUT } from '@/utils/constants';

interface PhototicketCanvasProps {
  croppedImageUrl: string | null;
  movieTitle: string;
  watchDate: string;
  theater: string;
  chain: string;
  format: string;
}

/**
 * 포토티켓 Canvas 렌더링 컴포넌트
 *
 * Canvas API를 사용하여 포스터 이미지 위에
 * 텍스트와 오버레이를 합성합니다.
 */
export default function PhototicketCanvas({
  croppedImageUrl,
  movieTitle,
  watchDate,
  theater,
  chain,
  format
}: PhototicketCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !croppedImageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 크기 설정
    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    // 배경 검은색
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    // 배경 이미지 로드 및 렌더링
    const img = new Image();
    img.onload = () => {
      // 이미지 그리기
      ctx.drawImage(img, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // 하단 오버레이 (반투명 검은색)
      ctx.fillStyle = CANVAS_LAYOUT.colors.overlay;
      ctx.fillRect(
        0,
        TARGET_HEIGHT - CANVAS_LAYOUT.overlayHeight,
        TARGET_WIDTH,
        CANVAS_LAYOUT.overlayHeight
      );

      // 극장 체인 (상단, 빨간색)
      if (chain) {
        ctx.font = `bold ${CANVAS_LAYOUT.fonts.chainSize}px Arial`;
        ctx.fillStyle = CANVAS_LAYOUT.colors.chain;
        ctx.fillText(chain, CANVAS_LAYOUT.padding, CANVAS_LAYOUT.chainY);
      }

      // 상영 포맷 (상단, 흰색 + 배경)
      if (format) {
        ctx.font = `${CANVAS_LAYOUT.fonts.formatSize}px Arial`;
        const textWidth = ctx.measureText(format).width;

        ctx.fillStyle = CANVAS_LAYOUT.colors.formatBg;
        ctx.fillRect(
          CANVAS_LAYOUT.padding - 5,
          CANVAS_LAYOUT.formatY - 25,
          textWidth + 10,
          35
        );

        ctx.fillStyle = CANVAS_LAYOUT.colors.format;
        ctx.fillText(format, CANVAS_LAYOUT.padding, CANVAS_LAYOUT.formatY);
      }

      // 영화 제목 (하단)
      if (movieTitle) {
        ctx.font = `bold ${CANVAS_LAYOUT.fonts.titleSize}px Arial`;
        ctx.fillStyle = CANVAS_LAYOUT.colors.title;
        ctx.fillText(movieTitle, CANVAS_LAYOUT.padding, CANVAS_LAYOUT.titleY);
      }

      // 관람일 (하단)
      if (watchDate) {
        ctx.font = `${CANVAS_LAYOUT.fonts.dateSize}px Arial`;
        ctx.fillStyle = CANVAS_LAYOUT.colors.date;
        ctx.fillText(watchDate, CANVAS_LAYOUT.padding, CANVAS_LAYOUT.dateY);
      }

      // 극장 위치 (하단)
      if (theater) {
        ctx.font = `${CANVAS_LAYOUT.fonts.theaterSize}px Arial`;
        ctx.fillStyle = CANVAS_LAYOUT.colors.theater;
        ctx.fillText(theater, CANVAS_LAYOUT.padding, CANVAS_LAYOUT.theaterY);
      }

      // Canvas를 window에 노출 (다운로드용)
      window.phototicketCanvas = canvas;
    };

    img.src = croppedImageUrl;

    // Cleanup
    return () => {
      delete window.phototicketCanvas;
    };
  }, [croppedImageUrl, movieTitle, watchDate, theater, chain, format]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 max-w-full h-auto"
        style={{ maxHeight: '600px' }}
      />
    </div>
  );
}
