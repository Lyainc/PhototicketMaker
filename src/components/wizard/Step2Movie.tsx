import MovieInfoForm from '@/components/MovieInfoForm';
import type { usePhototicket } from '@/hooks/usePhototicket';

interface Step2MovieProps {
  photo: ReturnType<typeof usePhototicket>;
  onPendingFetchChange: (pending: boolean) => void;
}

export default function Step2Movie({ photo, onPendingFetchChange }: Step2MovieProps) {
  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-mono text-[10px] uppercase tracking-widest text-accent-ink">[02] Film</p>
        <h2 className="text-2xl font-medium tracking-tight text-fg md:text-[28px]">
          영화 정보를 채워볼까요.
        </h2>
        <p className="max-w-[42ch] text-[13px] leading-relaxed text-fg-muted">
          제목 옆 검색 버튼으로 KOBIS에서 자동 채움이 가능해요. 제목 · 관람일 · 극장이 필수예요.
        </p>
      </header>

      <MovieInfoForm
        movieInfo={photo.state.movieInfo}
        onChange={photo.updateMovieInfo}
        onPendingFetchChange={onPendingFetchChange}
      />
    </div>
  );
}
