import { Sprocket } from './Sprocket';

interface MobileDockProps {
  ctaLabel: string;
  disabled?: boolean;
  hasImage: boolean;
  previewThumb?: string;
  onPreviewClick?: () => void;
  onCtaClick?: () => void;
}

export function MobileDock({
  ctaLabel,
  disabled = false,
  hasImage,
  previewThumb,
  onPreviewClick,
  onCtaClick,
}: MobileDockProps) {
  const showThumb = hasImage && previewThumb;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        zIndex: 40,
        borderTop: '1px solid var(--border)',
        background: 'var(--surface-translucent)',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onPreviewClick}
          aria-label="미리보기 확대"
          className="group transition-transform active:scale-95"
          style={{
            position: 'relative',
            width: 44,
            height: 56,
            flexShrink: 0,
            borderRadius: 6,
            overflow: 'hidden',
            background: 'var(--surface-elevated)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: onPreviewClick ? 'pointer' : 'default',
          }}
        >
          {showThumb ? (
            <img
              src={previewThumb}
              alt="티켓 미리보기"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--fg-faint)" strokeWidth="1.5" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M3 9h18M9 3v18" />
            </svg>
          )}
          {/* 탭 어포던스 — 누르면 확대 아이콘 오버레이 페이드인 */}
          {showThumb && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-active:opacity-100"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="m21 21-4.3-4.3M11 8v6M8 11h6" />
              </svg>
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={disabled ? undefined : onCtaClick}
          disabled={disabled}
          style={{
            flex: 1,
            height: 44,
            borderRadius: 8,
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            fontWeight: 600,
            fontSize: 14,
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            background: 'var(--accent)',
            color: '#fff',
            transition: 'background 150ms, opacity 150ms',
          }}
        >
          <Sprocket size={14} />
          <span>{ctaLabel}</span>
        </button>
      </div>
    </div>
  );
}
