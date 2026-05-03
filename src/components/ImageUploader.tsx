import { useRef, useState, useEffect } from 'react';
import ImageCropModal from './ImageCropModal';
import { getCroppedImg, Area } from '@/utils/imageCrop';

interface ImageUploaderProps {
  onUpload: (croppedImageUrl: string) => void;
  isProcessing: boolean;
}

export default function ImageUploader({ onUpload, isProcessing }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 이전에 선택된 이미지가 있다면 메모리 해제하여 누수 방지
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
      }
      const objectUrl = URL.createObjectURL(file);
      setSelectedImageSrc(objectUrl);
      
      // 같은 파일을 연달아 선택할 수 있도록 input value 초기화 (onChange 트리거용)
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropComplete = async (croppedAreaPixels: Area) => {
    if (!selectedImageSrc) return;
    
    setIsCropping(true);
    try {
      const croppedUrl = await getCroppedImg(selectedImageSrc, croppedAreaPixels);
      onUpload(croppedUrl);
      
      // Cleanup
      URL.revokeObjectURL(selectedImageSrc);
      setSelectedImageSrc(null);
    } catch (error) {
      console.error('크롭 실패:', error);
      alert('이미지 크롭에 실패했습니다.');
    } finally {
      setIsCropping(false);
    }
  };

  const handleCropCancel = () => {
    if (selectedImageSrc) {
      URL.revokeObjectURL(selectedImageSrc);
    }
    setSelectedImageSrc(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
      }
    };
  }, [selectedImageSrc]);

  return (
    <section className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">1. 포스터 업로드</h2>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        onChange={handleChange}
        disabled={isProcessing || isCropping}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 cursor-pointer"
      />
      {(isProcessing || isCropping) && (
        <p className="text-sm text-blue-600 mt-2 animate-pulse">이미지 처리 중...</p>
      )}

      {selectedImageSrc && (
        <ImageCropModal
          imageSrc={selectedImageSrc}
          onClose={handleCropCancel}
          onComplete={handleCropComplete}
          isProcessing={isCropping}
        />
      )}
    </section>
  );
}
