import type { ArchVisibility, CameraView } from '@/types';

interface ViewToolbarProps {
  view: CameraView;
  onViewChange: (view: CameraView) => void;
  archVisibility: ArchVisibility;
  onArchVisibilityChange: (arch: ArchVisibility) => void;
}

const VIEWS: { id: CameraView; label: string; hint: string }[] = [
  { id: 'front', label: 'Frontal', hint: 'Vista frontal' },
  { id: 'superior', label: 'Superior', hint: 'Vista de la arcada superior' },
  { id: 'inferior', label: 'Inferior', hint: 'Vista de la arcada inferior' },
  { id: 'left', label: 'Lateral izq.', hint: 'Vista lateral izquierda' },
  { id: 'right', label: 'Lateral der.', hint: 'Vista lateral derecha' },
];

export function ViewToolbar({ view, onViewChange, archVisibility, onArchVisibilityChange }: ViewToolbarProps) {
  const setArch = (arch: ArchVisibility) => {
    onArchVisibilityChange(arch);
    if (arch === 'both') onViewChange('front');
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {VIEWS.map((v) => (
        <button
          key={v.id}
          type="button"
          title={v.hint}
          onClick={() => onViewChange(v.id)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
            view === v.id ? 'bg-clinical-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-clinical-50'
          }`}
        >
          {v.label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onViewChange('reset')}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          view === 'reset' ? 'bg-clinical-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-clinical-50'
        }`}
      >
        Restablecer
      </button>
      <span className="mx-1 h-6 w-px bg-slate-200" />
      {(['upper', 'lower', 'both'] as ArchVisibility[]).map((arch) => (
        <button
          key={arch}
          type="button"
          onClick={() => setArch(arch)}
          className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
            archVisibility === arch ? 'bg-teal-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-teal-50'
          }`}
        >
          {arch === 'both' ? 'Ambas arcadas' : `Solo ${arch === 'upper' ? 'superior' : 'inferior'}`}
        </button>
      ))}
    </div>
  );
}
