import { getLayout } from '@/utils/layouts';
import type { usePhototicket } from '@/hooks/usePhototicket';

interface Step4ExportProps {
  photo: ReturnType<typeof usePhototicket>;
  onDownload: () => void;
  isExporting: boolean;
}

export default function Step4Export({ photo, onDownload, isExporting }: Step4ExportProps) {
  const layout = getLayout(photo.state.components.layout);
  const ready = !!photo.state.croppedImageUrl;

  return (
    <div className="space-y-6">
      <header className="space-y-1.5">
        <p className="text-mono text-[10px] uppercase tracking-widest text-accent-ink">[04] Export</p>
        <h2 className="text-2xl font-medium tracking-tight text-fg md:text-[28px]">
          저장하면 끝이에요.
        </h2>
        <p className="max-w-[42ch] text-[13px] leading-relaxed text-fg-muted">
          {layout.label} · {layout.width}×{layout.height}px JPEG로 내보낼게요.
        </p>
      </header>

      <div className="rounded-card border hairline bg-paper p-5 shadow-card">
        <dl className="grid grid-cols-2 gap-4 text-[13px] text-fg">
          <div>
            <dt className="text-mono text-[10px] uppercase tracking-widest text-fg-faint">Title</dt>
            <dd className="mt-1 truncate">{photo.state.movieInfo.title || '—'}</dd>
          </div>
          <div>
            <dt className="text-mono text-[10px] uppercase tracking-widest text-fg-faint">Watched</dt>
            <dd className="mt-1 truncate">{photo.state.movieInfo.watchDate || '—'}</dd>
          </div>
          <div>
            <dt className="text-mono text-[10px] uppercase tracking-widest text-fg-faint">Theater</dt>
            <dd className="mt-1 truncate">{photo.state.movieInfo.theater || '—'}</dd>
          </div>
          <div>
            <dt className="text-mono text-[10px] uppercase tracking-widest text-fg-faint">Mood</dt>
            <dd className="mt-1 truncate">{layout.label}</dd>
          </div>
        </dl>
      </div>

      <button
        type="button"
        onClick={onDownload}
        disabled={!ready || isExporting}
        data-touch="44"
        className="text-mono inline-flex min-h-btn w-full items-center justify-center gap-2 rounded-field bg-accent px-6 text-[11px] uppercase tracking-widest text-paper transition-colors hover:bg-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isExporting ? 'Capturing…' : 'Download JPEG ↓'}
      </button>
    </div>
  );
}
