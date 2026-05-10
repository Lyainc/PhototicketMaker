import { getLayout } from '@/utils/layouts';
import type { LayoutId } from '@/types';
import type { WizardStep } from '@/hooks/useWizard';

interface PreviewMiniProps {
  layoutId: LayoutId;
  ready: boolean;
  step: WizardStep;
}

const STEP_HINT: Record<WizardStep, string> = {
  1: '포스터를 업로드하면 미리보기가 채워져요.',
  2: '영화 정보를 채우면 티켓에 반영돼요.',
  3: '무드와 마감을 골라보세요.',
  4: '최종 미리보기와 다운로드.',
};

export default function PreviewMini({ layoutId, ready, step }: PreviewMiniProps) {
  const layout = getLayout(layoutId);
  return (
    <div className="rounded-card border hairline bg-paper p-4 shadow-card">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-mono text-[10px] uppercase tracking-widest text-fg-faint">
          Preview
        </span>
        <span className="text-mono text-[10px] uppercase tracking-widest text-fg-muted">
          {layout.label}
        </span>
      </div>
      <div
        className={`relative mx-auto overflow-hidden rounded-field bg-bg ${
          layout.orientation === 'landscape' ? 'aspect-[1477/960] w-full' : 'aspect-[960/1477] max-w-[220px]'
        }`}
        aria-hidden
      >
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          <span className="text-mono text-[10px] uppercase tracking-widest text-fg-faint">
            {ready ? 'Step 4 to view' : 'Awaiting poster'}
          </span>
        </div>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-fg-muted">{STEP_HINT[step]}</p>
    </div>
  );
}
