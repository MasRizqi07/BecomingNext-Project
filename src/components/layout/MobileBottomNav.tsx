import {Fingerprint, GitFork, Milestone, Mail, CheckSquare} from 'lucide-react';

interface MobileBottomNavProps {
  activeSection?: string;
  onSelectSection?: (sectionId: string) => void;
}

export function MobileBottomNav({
  activeSection = 'identity',
  onSelectSection,
}: MobileBottomNavProps) {
  const sections = [
    {id: 'identity', label: 'Identity', icon: Fingerprint},
    {id: 'paths', label: 'Paths', icon: GitFork},
    {id: 'timeline', label: 'Timeline', icon: Milestone},
    {id: 'letter', label: 'Letter', icon: Mail},
    {id: 'protocols', label: 'Plan', icon: CheckSquare},
  ];

  return (
    <nav
      aria-label="Mobile section navigation"
      className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-[var(--color-border)] bg-[var(--color-surface-1)]/90 px-3 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden"
    >
      {sections.map((sec) => {
        const Icon = sec.icon;
        const isActive = activeSection === sec.id;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection?.(sec.id)}
            className={`flex flex-col items-center justify-center p-1.5 transition-all ${
              isActive
                ? 'scale-105 font-bold text-[var(--color-accent)]'
                : 'text-[var(--color-text-3)] hover:text-[var(--color-text-1)]'
            }`}
          >
            <Icon size={18} className="mb-1" />
            <span className="font-display text-[9px] uppercase tracking-wider">{sec.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
