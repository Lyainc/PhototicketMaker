import { TARGET_WIDTH, TARGET_HEIGHT, TARGET_RATIO } from './constants';

export interface Area {
  width: number;
  height: number;
  x: number;
  y: number;
}

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

/**
 * 선택된 픽셀 영역을 기반으로 이미지를 크롭하여 Object URL로 반환
 * Memory Optimized: Object URL 사용 (사용 후 revokeObjectURL 필요)
 *
 * @param imageSrc - 원본 이미지의 Object URL
 * @param pixelCrop - react-easy-crop에서 반환된 크롭 픽셀 영역
 * @returns Promise<string> - 크롭된 이미지의 Object URL
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<string> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // 항상 고정된 출력 해상도 (960x1477)
  canvas.width = TARGET_WIDTH;
  canvas.height = TARGET_HEIGHT;

  // 원본 이미지에서 pixelCrop 영역만큼 가져와서 canvas 해상도에 맞게 그림
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    TARGET_WIDTH,
    TARGET_HEIGHT
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(URL.createObjectURL(blob));
      } else {
        reject(new Error('Canvas is empty'));
      }
    }, 'image/jpeg', 0.95);
  });
}
