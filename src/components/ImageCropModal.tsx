import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Area } from '@/utils/imageCrop';
import { TARGET_RATIO } from '@/utils/constants';

interface ImageCropModalProps {
  imageSrc: string;
  onClose: () => void;
  onComplete: (croppedAreaPixels: Area) => void;
  isProcessing?: boolean;
}

export default function ImageCropModal({ imageSrc, onClose, onComplete, isProcessing = false }: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = () => {
    if (croppedAreaPixels && !isProcessing) {
      onComplete(croppedAreaPixels);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4 overscroll-contain">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col h-[80vh] max-h-[800px]">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">이미지 크롭</h3>
          <button 
            onClick={onClose} 
            disabled={isProcessing}
            className="text-gray-500 hover:text-gray-700 p-1 disabled:opacity-50"
            aria-label="닫기"
          >
            ✕
          </button>
        </div>
        
        <div className="relative flex-1 bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={TARGET_RATIO}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            objectFit="contain"
          />
        </div>
        
        <div className="p-4 border-t flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <span id="zoom-label" className="text-sm text-gray-500 whitespace-nowrap">확대/축소</span>
            <input
              type="range"
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              aria-labelledby="zoom-label"
              onChange={(e) => setZoom(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600 disabled:opacity-50"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>처리 중...</span>
                </>
              ) : (
                <span>적용하기</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
