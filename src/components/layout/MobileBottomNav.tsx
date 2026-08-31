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
      className="fixed bottom-0 left-0 z-40 flex w-full items-center justify-around border-t border-white/10 dark:border-white/10 light:border-black/10 bg-[#090A0F]/90 dark:bg-[#090A0F]/90 light:bg-[#FFFFFF]/95 px-3 py-2.5 backdrop-blur-xl lg:hidden"
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
                ? 'text-cyan-300 font-bold scale-105'
                : 'text-white/50 hover:text-white dark:text-white/50 dark:hover:text-white light:text-slate-400 light:hover:text-slate-900'
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
