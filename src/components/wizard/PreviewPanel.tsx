import type { ReactNode } from 'react';
import { getLayout } from '@/utils/layouts';
import type { LayoutId } from '@/types';

interface PreviewPanelProps {
  layoutId: LayoutId;
  children: ReactNode;
}

export default function PreviewPanel({ layoutId, children }: PreviewPanelProps) {
  const layout = getLayout(layoutId);
  const isLandscape = layout.orientation === 'landscape';
  return (
    <div className="rounded-card border hairline bg-paper p-4 shadow-card md:p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-mono text-[10px] uppercase tracking-widest text-fg-faint">
          [04] Preview
        </span>
        <span className="text-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {layout.label}
        </span>
      </div>
      <div className={`mx-auto ${isLandscape ? 'w-full' : 'max-w-[420px]'}`}>{children}</div>
    </div>
  );
}
