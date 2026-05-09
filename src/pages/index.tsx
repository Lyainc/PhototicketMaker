import { useRef, useEffect, useMemo, useCallback } from 'react';
import PhototicketCanvas from '@/components/PhototicketCanvas';
import ImageUploader from '@/components/ImageUploader';
import MovieInfoForm from '@/components/MovieInfoForm';
import ComponentSelector from '@/components/ComponentSelector';
import { usePhototicket } from '@/hooks/usePhototicket';
import { downloadCanvasAsJPEG } from '@/utils/canvasExport';
import { extractColors } from '@/utils/colorExtraction';

export default function Home() {
  const {
    state,
    debouncedState,
    isProcessing,
    handleImageUpload,
    updateMovieInfo,
    updateComponents,
    setRecommendedColors,
  } = usePhototicket();

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!state.croppedImageUrl) return;
    let cancelled = false;
    extractColors(state.croppedImageUrl, 2).then((colors) => {
      if (!cancelled) setRecommendedColors(colors);
    });
    return () => {
      cancelled = true;
    };
  }, [state.croppedImageUrl, setRecommendedColors]);

  const handleDownload = useCallback(() => {
    if (!canvasRef.current || !state.croppedImageUrl) return;
    const filename = `phototicket_${state.movieInfo.title || 'untitled'}.jpg`;
    downloadCanvasAsJPEG(canvasRef.current, filename);
  }, [state.croppedImageUrl, state.movieInfo.title]);

  const issueDate = useMemo(
    () =>
      new Date()
        .toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
        .toUpperCase(),
    []
  );

  const ready = !!state.croppedImageUrl;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Ambient gold halo */}
      <div
        aria-hidden
        className="pointer-events-none fixed -top-40 left-1/2 -z-10 h-[600px] w-[1200px] -translate-x-1/2 rounded-full opacity-[0.07] blur-3xl"
        style={{ background: 'radial-gradient(closest-side, #E5B469, transparent)' }}
      />

      {/* Masthead */}
      <header className="border-b border-white/[0.06]">
        <div className="mx-auto flex max-w-[1400px] items-end justify-between px-5 py-5 md:px-10 md:py-8">
          <div className="flex items-center gap-3 md:gap-5">
            <div
              aria-hidden
              className="hidden h-7 w-7 shrink-0 rotate-45 border border-gold/70 md:block"
            />
            <div>
              <p className="text-mono text-[10px] uppercase tracking-widest text-bone-400">
                Issue No. 03 · {issueDate}
              </p>
              <h1 className="text-display mt-1 text-2xl font-light italic leading-none tracking-tightest text-paper md:text-[34px]">
                Phototicket <span className="not-italic font-normal">Maker</span>
              </h1>
            </div>
          </div>
          <div className="hidden items-center gap-6 text-mono text-[11px] uppercase tracking-widest text-bone-400 md:flex">
            <span>EDITORIAL · v0.3</span>
            <span className="h-1 w-1 rounded-full bg-bone-400/60" />
            <span>{ready ? <span className="text-gold">● LIVE</span> : 'STANDBY'}</span>
          </div>
        </div>
      </header>

      {/* Main grid */}
      <div className="mx-auto max-w-[1400px] px-5 pb-32 pt-8 md:px-10 md:pb-16 md:pt-12 lg:pt-16">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,540px)] lg:gap-16">
          {/* Form column */}
          <div className="order-2 space-y-12 lg:order-1 lg:space-y-16">
            <Intro />

            <ImageUploader
              onUpload={handleImageUpload}
              isProcessing={isProcessing}
              hasImage={ready}
            />

            <MovieInfoForm
              movieInfo={state.movieInfo}
              onChange={updateMovieInfo}
            />

            <ComponentSelector
              components={state.components}
              recommendedColors={state.recommendedColors}
              onChange={updateComponents}
            />

            {/* Desktop save action */}
            <div className="hidden lg:block">
              <SaveButton onClick={handleDownload} disabled={!ready} />
            </div>

            <Colophon />
          </div>

          {/* Preview column */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-10">
              <PreviewFrame
                ready={ready}
                live={ready}
                title={debouncedState.movieInfo.title}
              >
                {ready ? (
                  <PhototicketCanvas
                    ref={canvasRef}
                    croppedImageUrl={state.croppedImageUrl}
                    movieTitle={debouncedState.movieInfo.title}
                    movieTitleOg={debouncedState.movieInfo.titleOg}
                    actors={debouncedState.movieInfo.actors}
                    releaseDate={debouncedState.movieInfo.releaseDate}
                    watchDate={debouncedState.movieInfo.watchDate}
                    theater={debouncedState.movieInfo.theater}
                    screen={debouncedState.movieInfo.screen}
                    seat={debouncedState.movieInfo.seat}
                    rating={debouncedState.movieInfo.rating}
                    showRating={debouncedState.movieInfo.showRating}
                    chain={debouncedState.components.chain}
                    format={debouncedState.components.format}
                    texture={debouncedState.components.texture}
                    posterOpacity={debouncedState.components.posterOpacity}
                    themeColor={debouncedState.components.themeColor}
                  />
                ) : (
                  <EmptyPreview />
                )}
              </PreviewFrame>

              {/* Mobile save action — inline */}
              <div className="mt-6 lg:hidden">
                <SaveButton onClick={handleDownload} disabled={!ready} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile floating action — visible only when ready */}
      {ready && (
        <div className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),16px)] pt-3 lg:hidden">
          <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-ink via-ink/95 to-transparent" />
          <button
            onClick={handleDownload}
            className="group flex w-full items-center justify-between gap-4 border border-gold/40 bg-ink-100 px-5 py-4 text-mono text-[11px] uppercase tracking-widest text-paper transition-all active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Save Ticket
            </span>
            <span className="text-gold">→ JPEG</span>
          </button>
        </div>
      )}
    </div>
  );
}

/* ------------------------------ Sub-components ------------------------------ */

function Intro() {
  return (
    <section className="space-y-3 pb-2">
      <p className="text-mono text-[10px] uppercase tracking-widest text-bone-400">
        Vol.01 / FEATURE
      </p>
      <h2 className="text-display text-3xl font-light italic leading-[1.05] tracking-tightest text-paper md:text-[44px]">
        영화의 한 장면을<br />
        <span className="not-italic">손에 쥐는 방식.</span>
      </h2>
      <p className="max-w-[42ch] pt-2 text-sm leading-relaxed text-bone-400 md:text-[15px]">
        포스터를 올리고 정보를 채우면 CGV Photoplay 규격의 프리미엄 티켓이 생성돼요.
        업로드 즉시 미리보기에 반영되거든요.
      </p>
    </section>
  );
}

function PreviewFrame({
  children,
  ready,
  live,
  title,
}: {
  children: React.ReactNode;
  ready: boolean;
  live: boolean;
  title: string;
}) {
  return (
    <div className="relative">
      {/* Top meta */}
      <div className="mb-4 flex items-center justify-between text-mono text-[10px] uppercase tracking-widest text-bone-400">
        <span>PREVIEW · 960×1477</span>
        <span className="flex items-center gap-2">
          {live && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-gold" />}
          {live ? 'LIVE' : 'IDLE'}
        </span>
      </div>

      {/* Frame */}
      <div className="relative border border-white/[0.06] bg-ink-100 p-4 md:p-6">
        {/* Corner markers */}
        <Corner pos="top-left" />
        <Corner pos="top-right" />
        <Corner pos="bottom-left" />
        <Corner pos="bottom-right" />

        <div className="relative">{children}</div>
      </div>

      {/* Bottom meta */}
      <div className="mt-4 flex items-center justify-between text-mono text-[10px] uppercase tracking-widest text-bone-400">
        <span className="truncate pr-4">
          {ready && title ? `// ${title}` : '// awaiting upload'}
        </span>
        <span>FILE_001.jpg</span>
      </div>
    </div>
  );
}

function Corner({ pos }: { pos: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' }) {
  const map: Record<string, string> = {
    'top-left': '-top-px -left-px border-t border-l',
    'top-right': '-top-px -right-px border-t border-r',
    'bottom-left': '-bottom-px -left-px border-b border-l',
    'bottom-right': '-bottom-px -right-px border-b border-r',
  };
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute h-3 w-3 border-gold/60 ${map[pos]}`}
    />
  );
}

function EmptyPreview() {
  return (
    <div className="flex aspect-[0.65/1] w-full max-w-[420px] mx-auto flex-col items-center justify-center gap-4 border border-dashed border-white/[0.08] bg-ink-200/40 px-6 text-center">
      <div className="text-mono text-[10px] uppercase tracking-widest text-bone-500">
        [ AWAITING POSTER ]
      </div>
      <p className="max-w-[24ch] text-sm leading-relaxed text-bone-400">
        포스터를 업로드하면 이곳에 티켓이 실시간으로 조판돼요.
      </p>
      <div className="mt-4 flex items-center gap-2 text-mono text-[10px] uppercase tracking-widest text-bone-500">
        <span className="h-px w-6 bg-bone-500/40" />
        <span>0.65 : 1</span>
        <span className="h-px w-6 bg-bone-500/40" />
      </div>
    </div>
  );
}

function SaveButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group relative flex w-full items-center justify-between border border-gold/40 bg-transparent px-6 py-5 text-left transition-all hover:border-gold hover:bg-gold/[0.04] disabled:cursor-not-allowed disabled:border-white/[0.08] disabled:opacity-40"
    >
      <span>
        <span className="block text-mono text-[10px] uppercase tracking-widest text-bone-400 group-hover:text-gold">
          Export · JPEG
        </span>
        <span className="text-display mt-1 block text-2xl font-light italic tracking-tight text-paper">
          Save Ticket
        </span>
      </span>
      <span className="text-mono text-xs tracking-widest text-gold transition-transform group-hover:translate-x-1">
        960 × 1477  ↓
      </span>
    </button>
  );
}

function Colophon() {
  return (
    <footer className="border-t border-white/[0.06] pt-8 text-mono text-[10px] uppercase tracking-widest text-bone-500">
      <div className="grid grid-cols-2 gap-y-2 md:grid-cols-4">
        <span>Issue 03 · Editorial</span>
        <span>Spec · 0.65:1</span>
        <span>Engine · Canvas2D</span>
        <span>© Phototicket</span>
      </div>
    </footer>
  );
}
