import { TARGET_WIDTH, TARGET_HEIGHT, DESIGN_LAYOUT } from './constants';

export async function drawLogo(ctx: CanvasRenderingContext2D, src: string, x: number, y: number, maxWidth: number, maxHeight: number): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      resolve();
    };
    img.onerror = () => {
      console.warn(`Failed to load logo: ${src}`);
      resolve();
    };
    img.src = src;
  });
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;

  for (let n = 0; n < words.length; n++) {
    const word = words[n];
    
    if (ctx.measureText(word).width > maxWidth) {
      if (line.trim() !== '') {
        ctx.fillText(line.trim(), x, currentY);
        line = '';
        currentY += lineHeight;
      }
      
      let subLine = '';
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        if (ctx.measureText(subLine + char).width > maxWidth) {
          ctx.fillText(subLine, x, currentY);
          subLine = char;
          currentY += lineHeight;
        } else {
          subLine += char;
        }
      }
      line = subLine + ' ';
    } else {
      const testLine = line + word + (n < words.length - 1 ? ' ' : '');
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = word + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
  }
  
  if (line.trim().length > 0) {
    ctx.fillText(line.trim(), x, currentY);
  }
}

export function fillTextWithSpacing(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number
) {
  let currentX = x;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    ctx.fillText(char, currentX, y);
    currentX += ctx.measureText(char).width + spacing;
  }
}

export function drawBarcode(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  isDark: boolean
) {
  ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)';
  const bars = [2, 1, 3, 1, 1, 4, 2, 1, 1, 2, 3, 1, 2, 2, 1, 3, 1, 2];
  let currentX = x;
  
  for (let i = 0; i < bars.length; i++) {
    const barWidth = bars[i] * 2.5; 
    const gap = (i % 2 === 0) ? 4 : 8; 
    
    if (currentX + barWidth > x + width) break;
    
    ctx.fillRect(currentX, y, barWidth, height);
    currentX += barWidth + gap;
  }
}

export function drawTCGBorder(ctx: CanvasRenderingContext2D, isDark: boolean) {
  const { margin, thickness, radius } = DESIGN_LAYOUT.border;
  const width = TARGET_WIDTH - margin * 2;
  const height = TARGET_HEIGHT - margin * 2;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(margin + radius, margin);
  ctx.lineTo(margin + width - radius, margin);
  ctx.quadraticCurveTo(margin + width, margin, margin + width, margin + radius);
  ctx.lineTo(margin + width, margin + height - radius);
  ctx.quadraticCurveTo(margin + width, margin + height, margin + width - radius, margin + height);
  ctx.lineTo(margin + radius, margin + height);
  ctx.quadraticCurveTo(margin, margin + height, margin, margin + height - radius);
  ctx.lineTo(margin, margin + radius);
  ctx.quadraticCurveTo(margin, margin, margin + radius, margin);
  ctx.closePath();

  ctx.lineWidth = thickness;
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
  ctx.shadowColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 8;
  
  ctx.stroke();
  ctx.restore();
}

export function applyTextureOverlay(ctx: CanvasRenderingContext2D, texture: string, width: number, height: number) {
  if (!texture || texture === 'none' || texture === 'vintage' || texture === 'newspaper') return;

  ctx.save();
  
  if (texture === 'hologram') {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.15)');
    gradient.addColorStop(0.2, 'rgba(255, 165, 0, 0.15)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 0, 0.15)');
    gradient.addColorStop(0.6, 'rgba(0, 128, 0, 0.15)');
    gradient.addColorStop(0.8, 'rgba(0, 0, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(238, 130, 238, 0.15)');
    
    ctx.globalCompositeOperation = 'color-dodge';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  } 
  else if (texture === 'metal') {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.4, 'rgba(200, 200, 200, 0.1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(0.6, 'rgba(150, 150, 150, 0.1)');
    gradient.addColorStop(1, 'rgba(50, 50, 50, 0.3)');
    
    ctx.globalCompositeOperation = 'hard-light';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  else if (texture === 'artpaper') {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgba(230, 225, 215, 0.3)';
    ctx.fillRect(0, 0, width, height);
  }
  else if (texture === 'scodix') {
    const gradient = ctx.createLinearGradient(0, height/2, width, height/2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

export function drawStars(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, gap: number, isDark: boolean) {
  ctx.save();
  ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  
  let currentX = x;
  const outerRadius = size / 2;
  const innerRadius = size / 4;
  
  for(let i=0; i<5; i++) {
    let rot = Math.PI / 2 * 3;
    let cx = currentX + outerRadius;
    let cy = y;
    let step = Math.PI / 5;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let j = 0; j < 5; j++) {
      let px = cx + Math.cos(rot) * outerRadius;
      let py = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(px, py);
      rot += step;

      px = cx + Math.cos(rot) * innerRadius;
      py = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(px, py);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.stroke();
    
    currentX += size + gap;
  }
  ctx.restore();
}
