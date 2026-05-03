'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { TARGET_WIDTH, TARGET_HEIGHT, DESIGN_LAYOUT, DESIGN_EFFECTS, THEATER_CHAINS, SCREENING_FORMATS } from '@/utils/constants';
import { drawLogo, roundRect, wrapText, fillTextWithSpacing, drawBarcode, drawTCGBorder, applyTextureOverlay, drawStars } from '@/utils/canvasRendering';

interface PhototicketCanvasProps {
  croppedImageUrl: string | null;
  movieTitle: string;
  watchDate: string;
  theater: string;
  chain: string;
  format: string;
  texture: string;
  screen?: string;
  seat?: string;
}

/**
 * 이미지 하단부 평균 밝기를 분석하여 텍스트 색상을 결정합니다.
 */
function getContrastColor(ctx: CanvasRenderingContext2D): 'white' | 'black' {
  const checkAreaHeight = 400; 
  const imageData = ctx.getImageData(0, TARGET_HEIGHT - checkAreaHeight, TARGET_WIDTH, checkAreaHeight);
  const data = imageData.data;
  let r, g, b, avg;
  let colorSum = 0;

  for (let x = 0, len = data.length; x < len; x += 4) {
    r = data[x];
    g = data[x + 1];
    b = data[x + 2];

    avg = Math.floor((r + g + b) / 3);
    colorSum += avg;
  }

  const brightness = colorSum / (data.length / 4);
  return brightness > 190 ? 'black' : 'white';
}

/**
 * 포토티켓 Canvas 렌더링 컴포넌트
 */
const PhototicketCanvas = forwardRef<HTMLCanvasElement, PhototicketCanvasProps>(({
  croppedImageUrl,
  movieTitle,
  watchDate,
  theater,
  chain,
  format,
  texture,
  screen,
  seat
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => canvasRef.current!);

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !croppedImageUrl) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = TARGET_WIDTH;
    canvas.height = TARGET_HEIGHT;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    const posterImg = new Image();
    
    if (!croppedImageUrl.startsWith('blob:')) {
      posterImg.crossOrigin = 'anonymous';
    }

    posterImg.onload = async () => {
      if (isCancelled) return;

      // 0. 초기 필터 (빈티지, 흑백 신문 등)
      ctx.filter = 'none';
      if (texture === 'vintage') {
        ctx.filter = 'sepia(60%) contrast(1.1) brightness(0.9)';
      } else if (texture === 'newspaper') {
        ctx.filter = 'grayscale(100%) contrast(1.5) brightness(1.2)';
      }

      // 1. 포스터 렌더링
      ctx.drawImage(posterImg, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      ctx.filter = 'none'; // 필터 초기화

      // 2. 밝기 분석 및 색상 결정
      const contrastMode = getContrastColor(ctx);
      const isDark = contrastMode === 'white';

      // 3. 시네마틱 그라디언트 오버레이
      const gradient = ctx.createLinearGradient(0, 0, 0, TARGET_HEIGHT);
      const stops = isDark ? DESIGN_EFFECTS.gradients.topDark.stops : DESIGN_EFFECTS.gradients.topLight.stops;
      stops.forEach(stop => {
        gradient.addColorStop(stop.offset, stop.color);
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      // 4. 로고 렌더링 (체인)
      if (chain) {
        const chainData = THEATER_CHAINS.find(c => c.value === chain);
        if (chainData && chainData.file) {
          await drawLogo(ctx, `/assets/chains/${chainData.file}`, DESIGN_LAYOUT.chainLogo.x, DESIGN_LAYOUT.chainLogo.y, DESIGN_LAYOUT.chainLogo.maxWidth, DESIGN_LAYOUT.chainLogo.maxHeight);
          if (isCancelled) return;
        }
      }

      // 5. 상영 포맷 배지
      if (format) {
        const formatData = SCREENING_FORMATS.find(f => f.value === format);
        if (formatData && formatData.file) {
          const { x, y, padding, borderRadius, maxWidth, maxHeight } = DESIGN_LAYOUT.formatBadge;
          const badgeWidth = maxWidth + padding * 2;
          const badgeHeight = maxHeight + padding * 2;

          ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)';
          roundRect(ctx, x, y, badgeWidth, badgeHeight, borderRadius);
          ctx.fill();

          await drawLogo(ctx, `/assets/formats/${formatData.file}`, x + padding, y + padding, maxWidth, maxHeight);
          if (isCancelled) return;
        }
      }

      // === 하단 프리미엄 정보 패널 ===
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      const textColor = isDark ? '#FFFFFF' : '#111111';
      const shadowColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.5)';
      const dividerColor = isDark ? `rgba(255, 255, 255, ${DESIGN_LAYOUT.divider.opacity})` : `rgba(0, 0, 0, ${DESIGN_LAYOUT.divider.opacity})`;
      
      // 6. 넘버링 & 별점 (수집용 티켓 감성)
      ctx.font = `${DESIGN_LAYOUT.numbering.fontWeight} ${DESIGN_LAYOUT.numbering.fontSize}px "Pretendard", system-ui, sans-serif`;
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
      fillTextWithSpacing(ctx, `${DESIGN_LAYOUT.numbering.prefix} 001`, DESIGN_LAYOUT.numbering.x, DESIGN_LAYOUT.numbering.y, DESIGN_LAYOUT.numbering.letterSpacing);
      
      drawStars(ctx, DESIGN_LAYOUT.rating.x, DESIGN_LAYOUT.rating.y + (DESIGN_LAYOUT.rating.size / 2), DESIGN_LAYOUT.rating.size, DESIGN_LAYOUT.rating.gap, isDark);

      // 7. 영화 제목
      if (movieTitle) {
        ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 2; ctx.shadowBlur = 6; ctx.shadowColor = shadowColor;
        ctx.font = `${DESIGN_LAYOUT.movieTitle.fontWeight} ${DESIGN_LAYOUT.movieTitle.fontSize}px "Pretendard", system-ui, sans-serif`;
        ctx.fillStyle = textColor;
        wrapText(ctx, movieTitle, DESIGN_LAYOUT.movieTitle.x, DESIGN_LAYOUT.movieTitle.y, DESIGN_LAYOUT.movieTitle.maxWidth, DESIGN_LAYOUT.movieTitle.fontSize * DESIGN_LAYOUT.movieTitle.lineHeight);
      }

      ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0; ctx.shadowBlur = 0; 

      // 8. 구분선 (Divider)
      ctx.fillStyle = dividerColor;
      ctx.fillRect(DESIGN_LAYOUT.divider.x, DESIGN_LAYOUT.divider.y, DESIGN_LAYOUT.divider.width, DESIGN_LAYOUT.divider.thickness);

      // 9. 메타데이터 (날짜, 극장, 상영관, 좌석)
      const metaY = DESIGN_LAYOUT.metadata.y;
      const lh = DESIGN_LAYOUT.metadata.lineHeight;

      let primaryText = [];
      if (watchDate) primaryText.push(watchDate);
      if (theater) primaryText.push(theater);
      
      if (primaryText.length > 0) {
        ctx.font = `${DESIGN_LAYOUT.metadata.primary.fontWeight} ${DESIGN_LAYOUT.metadata.primary.fontSize}px "Pretendard", system-ui, sans-serif`;
        ctx.fillStyle = textColor;
        fillTextWithSpacing(ctx, primaryText.join('   |   '), DESIGN_LAYOUT.metadata.x, metaY, DESIGN_LAYOUT.metadata.primary.letterSpacing);
      }

      let secondaryText = [];
      if (screen) secondaryText.push(screen);
      if (seat) secondaryText.push(seat);

      if (secondaryText.length > 0) {
        ctx.font = `${DESIGN_LAYOUT.metadata.secondary.fontWeight} ${DESIGN_LAYOUT.metadata.secondary.fontSize}px "Pretendard", system-ui, sans-serif`;
        ctx.globalAlpha = DESIGN_LAYOUT.metadata.secondary.opacity;
        fillTextWithSpacing(ctx, secondaryText.join('   |   '), DESIGN_LAYOUT.metadata.x, metaY + lh, DESIGN_LAYOUT.metadata.secondary.letterSpacing);
        ctx.globalAlpha = 1.0; 
      }

      // 10. 장식용 바코드
      drawBarcode(ctx, DESIGN_LAYOUT.barcode.x, DESIGN_LAYOUT.barcode.y, DESIGN_LAYOUT.barcode.width, DESIGN_LAYOUT.barcode.height, isDark);

      // 11. TCG 프레임 (Inner Border)
      drawTCGBorder(ctx, isDark);

      // 12. 텍스처 (후가공) 오버레이 적용
      applyTextureOverlay(ctx, texture, TARGET_WIDTH, TARGET_HEIGHT);
    };

    posterImg.src = croppedImageUrl;

    return () => {
      isCancelled = true;
    };
  }, [croppedImageUrl, movieTitle, watchDate, theater, chain, format, texture, screen, seat]);

  return (
    <div className="flex justify-center">
      <canvas
        ref={canvasRef}
        className="border border-gray-300 max-w-full h-auto"
        style={{ maxHeight: '600px' }}
      />
    </div>
  );
});

PhototicketCanvas.displayName = 'PhototicketCanvas';

export default PhototicketCanvas;
