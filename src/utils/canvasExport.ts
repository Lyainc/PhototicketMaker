import { JPEG_QUALITY } from './constants';

/**
 * Canvas를 JPEG 파일로 다운로드
 *
 * @param canvas - 다운로드할 Canvas 엘리먼트
 * @param filename - 저장할 파일명 (기본값: 'phototicket.jpg')
 */
export function downloadCanvasAsJPEG(
  canvas: HTMLCanvasElement,
  filename: string = 'phototicket.jpg'
): void {
  const dataURL = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

  fetch(dataURL)
    .then(res => res.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = filename;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    });
}
