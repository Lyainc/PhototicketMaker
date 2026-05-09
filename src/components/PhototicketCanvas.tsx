'use client';

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  TARGET_WIDTH,
  TARGET_HEIGHT,
  DESIGN_LAYOUT,
  DESIGN_EFFECTS,
  THEATER_CHAINS,
  SCREENING_FORMATS,
} from '@/utils/constants';
import {
  drawLogo,
  wrapText,
  fillTextWithSpacing,
  drawTCGBorder,
  applyTextureOverlay,
  drawStars,
} from '@/utils/canvasRendering';

const FONT_STACK = '"Pretendard Variable", "Pretendard", system-ui, sans-serif';
const RENDER_SCALE = 2;

interface PhototicketCanvasProps {
  croppedImageUrl: string | null;
  movieTitle: string;
  movieTitleOg?: string;
  actors?: string;
  releaseDate?: string;
  watchDate: string;
  theater: string;
  chain: string;
  format: string;
  texture: string;
  rating: number;
  showRating: boolean;
  posterOpacity: number;
  themeColor: string;
  screen?: string;
  seat?: string;
}

const PhototicketCanvas = forwardRef<HTMLCanvasElement, PhototicketCanvasProps>(function PhototicketCanvas(
  {
    croppedImageUrl,
    movieTitle,
    movieTitleOg,
    actors,
    releaseDate,
    watchDate,
    theater,
    chain,
    format,
    texture,
    rating,
    showRating,
    posterOpacity,
    themeColor,
    screen,
    seat,
  },
  ref
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, () => canvasRef.current!, []);

  useEffect(() => {
    let isCancelled = false;
    const canvas = canvasRef.current;
    if (!canvas || !croppedImageUrl) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = TARGET_WIDTH * RENDER_SCALE;
    canvas.height = TARGET_HEIGHT * RENDER_SCALE;
    ctx.scale(RENDER_SCALE, RENDER_SCALE);

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);

    const posterImg = new Image();
    if (!croppedImageUrl.startsWith('blob:')) {
      posterImg.crossOrigin = 'anonymous';
    }

    posterImg.onload = async () => {
      if (isCancelled) return;

      ctx.filter =
        texture === 'vintage'
          ? 'sepia(60%) contrast(1.1) brightness(0.9)'
          : texture === 'newspaper'
          ? 'grayscale(100%) contrast(1.5) brightness(1.2)'
          : 'none';
      ctx.drawImage(posterImg, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      ctx.filter = 'none';

      if (texture !== 'original') {
        // Visibility scrim — darken poster so type stays legible.
        ctx.globalAlpha = 1 - posterOpacity;
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
        ctx.globalAlpha = 1.0;

        const gradient = ctx.createLinearGradient(0, 0, 0, TARGET_HEIGHT);
        gradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        gradient.addColorStop(0.2, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(0.8, 'rgba(0, 0, 0, 0)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, TARGET_WIDTH, TARGET_HEIGHT);
      }

      if (chain) {
        const chainData = THEATER_CHAINS.find((c) => c.value === chain);
        if (chainData?.file) {
          await drawLogo(
            ctx,
            `/assets/chains_transparent/${chainData.file}`,
            DESIGN_LAYOUT.chainLogo.x,
            DESIGN_LAYOUT.chainLogo.y,
            DESIGN_LAYOUT.chainLogo.maxWidth,
            DESIGN_LAYOUT.chainLogo.maxHeight,
            themeColor,
            'left'
          );
          if (isCancelled) return;
        }
      }

      if (format) {
        const formatData = SCREENING_FORMATS.find((f) => f.value === format);
        if (formatData?.file) {
          const { x, y, badgeHeight } = DESIGN_LAYOUT.formatBadge;
          const maxWidth = 200;
          await drawLogo(
            ctx,
            `/assets/formats_transparent/${formatData.file}`,
            x - maxWidth,
            y,
            maxWidth,
            badgeHeight,
            themeColor,
            'right'
          );
          if (isCancelled) return;
        }
      }

      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';
      ctx.fillStyle = themeColor;
      ctx.shadowColor = DESIGN_EFFECTS.textShadow.color;
      ctx.shadowOffsetX = DESIGN_EFFECTS.textShadow.offsetX;
      ctx.shadowOffsetY = DESIGN_EFFECTS.textShadow.offsetY;
      ctx.shadowBlur = DESIGN_EFFECTS.textShadow.blur;

      const headerLine1 = [watchDate, theater].filter(Boolean);
      const headerLine2 = [screen, seat].filter(Boolean);

      ctx.textAlign = 'right';
      ctx.font = `${DESIGN_LAYOUT.headerMetadata.fontWeight} ${DESIGN_LAYOUT.headerMetadata.fontSize}px ${FONT_STACK}`;
      ctx.globalAlpha = DESIGN_LAYOUT.headerMetadata.opacity;

      let headerY = DESIGN_LAYOUT.headerMetadata.y;
      if (headerLine1.length) {
        ctx.fillText(headerLine1.join('   /   '), DESIGN_LAYOUT.headerMetadata.x, headerY);
        headerY += 30;
      }
      if (headerLine2.length) {
        ctx.fillText(headerLine2.join('   /   '), DESIGN_LAYOUT.headerMetadata.x, headerY);
      }
      ctx.globalAlpha = 1.0;
      ctx.textAlign = 'left';

      let currentY: number = DESIGN_LAYOUT.movieTitleOg.y;

      if (movieTitleOg) {
        ctx.font = `${DESIGN_LAYOUT.movieTitleOg.fontWeight} ${DESIGN_LAYOUT.movieTitleOg.fontSize}px ${FONT_STACK}`;
        ctx.globalAlpha = DESIGN_LAYOUT.movieTitleOg.opacity;
        fillTextWithSpacing(
          ctx,
          movieTitleOg.toUpperCase(),
          DESIGN_LAYOUT.movieTitleOg.x,
          currentY,
          DESIGN_LAYOUT.movieTitleOg.letterSpacing
        );
        ctx.globalAlpha = 1.0;
      }

      currentY = DESIGN_LAYOUT.movieTitle.y;

      if (movieTitle) {
        const titleFontSize = scaleTitleFont(DESIGN_LAYOUT.movieTitle.fontSize, movieTitle.length);
        ctx.font = `${DESIGN_LAYOUT.movieTitle.fontWeight} ${titleFontSize}px ${FONT_STACK}`;
        currentY = wrapText(
          ctx,
          movieTitle,
          DESIGN_LAYOUT.movieTitle.x,
          currentY,
          DESIGN_LAYOUT.movieTitle.maxWidth,
          titleFontSize * DESIGN_LAYOUT.movieTitle.lineHeight
        );
      } else {
        currentY += 60;
      }

      currentY += 10;

      if (showRating) {
        drawStars(
          ctx,
          DESIGN_LAYOUT.rating.x,
          currentY + DESIGN_LAYOUT.rating.size / 2,
          DESIGN_LAYOUT.rating.size,
          DESIGN_LAYOUT.rating.gap,
          rating,
          themeColor
        );
        currentY += 45;
      } else {
        currentY += 15;
      }

      if (actors) {
        ctx.font = `${DESIGN_LAYOUT.actors.fontWeight} ${DESIGN_LAYOUT.actors.fontSize}px ${FONT_STACK}`;
        ctx.globalAlpha = DESIGN_LAYOUT.actors.opacity;
        currentY = wrapText(
          ctx,
          `CAST · ${actors}`,
          DESIGN_LAYOUT.actors.x,
          currentY,
          DESIGN_LAYOUT.actors.maxWidth,
          DESIGN_LAYOUT.actors.fontSize * 1.5
        );
        ctx.globalAlpha = 1.0;
        currentY += 15;
      }

      if (releaseDate) {
        ctx.font = `${DESIGN_LAYOUT.releaseDate.fontWeight} ${DESIGN_LAYOUT.releaseDate.fontSize}px ${FONT_STACK}`;
        ctx.globalAlpha = DESIGN_LAYOUT.releaseDate.opacity;
        fillTextWithSpacing(
          ctx,
          `RELEASED · ${releaseDate}`,
          DESIGN_LAYOUT.releaseDate.x,
          currentY,
          DESIGN_LAYOUT.releaseDate.letterSpacing
        );
        ctx.globalAlpha = 1.0;
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 0;

      ctx.globalAlpha = DESIGN_LAYOUT.divider.opacity;
      ctx.fillRect(
        DESIGN_LAYOUT.divider.x,
        DESIGN_LAYOUT.divider.y,
        DESIGN_LAYOUT.divider.width,
        DESIGN_LAYOUT.divider.thickness
      );
      ctx.globalAlpha = 1.0;

      drawTCGBorder(ctx, themeColor);
      applyTextureOverlay(ctx, texture, TARGET_WIDTH, TARGET_HEIGHT);
    };

    posterImg.src = croppedImageUrl;

    return () => {
      isCancelled = true;
    };
  }, [
    croppedImageUrl,
    movieTitle,
    movieTitleOg,
    actors,
    releaseDate,
    watchDate,
    theater,
    chain,
    format,
    texture,
    rating,
    showRating,
    posterOpacity,
    themeColor,
    screen,
    seat,
  ]);

  return (
    <div className="flex w-full items-center justify-center">
      <canvas
        ref={canvasRef}
        className="block w-auto max-w-full shadow-2xl shadow-black/40"
        style={{ maxHeight: 'min(72vh, 720px)', height: 'auto' }}
      />
    </div>
  );
});

function scaleTitleFont(base: number, length: number): number {
  if (length > 15) return base * 0.85;
  if (length > 10) return base * 0.95;
  return base;
}

export default PhototicketCanvas;
