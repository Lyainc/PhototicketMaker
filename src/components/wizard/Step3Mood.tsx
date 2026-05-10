import ComponentSelector from '@/components/ComponentSelector';
import type { usePhototicket } from '@/hooks/usePhototicket';

interface Step3MoodProps {
  photo: ReturnType<typeof usePhototicket>;
}

export default function Step3Mood({ photo }: Step3MoodProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-mono text-[10px] uppercase tracking-widest text-accent-ink">[03] Mood</p>
        <h2 className="text-2xl font-medium tracking-tight text-fg md:text-[28px]">
          무드와 마감을 골라요.
        </h2>
        <p className="max-w-[42ch] text-[13px] leading-relaxed text-fg-muted">
          4가지 레이아웃 중 하나를 선택하고, 색상 · 텍스처 · 체인을 미세 조정할 수 있어요.
        </p>
      </header>

      <ComponentSelector
        components={photo.state.components}
        recommendedColors={photo.state.recommendedColors}
        onChange={photo.updateComponents}
      />
    </div>
  );
}
