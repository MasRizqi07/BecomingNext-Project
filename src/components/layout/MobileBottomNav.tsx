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
    {id: 'plan', label: 'Plan', icon: CheckSquare},
  ];

  return (
    <nav
      aria-label="Mobile section navigation"
      className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-white/10 bg-[var(--color-surface-1)]/90 px-3 py-2.5 backdrop-blur-xl light:border-black/10 lg:hidden"
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
                ? 'scale-105 font-bold text-cyan-300 light:text-cyan-800'
                : 'text-white/50 hover:text-white light:text-slate-500 light:hover:text-slate-950'
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
