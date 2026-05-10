import ImageUploader from '@/components/ImageUploader';
import type { usePhototicket } from '@/hooks/usePhototicket';

interface Step1PosterProps {
  photo: ReturnType<typeof usePhototicket>;
}

export default function Step1Poster({ photo }: Step1PosterProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-mono text-[10px] uppercase tracking-widest text-accent-ink">[01] Poster</p>
        <h2 className="text-2xl font-medium tracking-tight text-fg md:text-[28px]">
          포스터를 올려주세요.
        </h2>
        <p className="max-w-[42ch] text-[13px] leading-relaxed text-fg-muted">
          0.65 : 1 비율로 직접 크롭할 수 있어요. JPEG · PNG · WEBP를 지원해요.
        </p>
      </header>

      <ImageUploader
        onUpload={photo.handleImageUpload}
        isProcessing={photo.isProcessing}
        hasImage={!!photo.state.croppedImageUrl}
      />
    </div>
  );
}
