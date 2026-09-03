import {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import '@/index.css';

import {Button} from '@/components/primitives/Button';
import {Card} from '@/components/primitives/Card';
import {InputField, TextareaField, ScoreField} from '@/components/primitives/Field';
import {Toast, type ToastItem} from '@/components/primitives/Toast';
import {Dialog} from '@/components/primitives/Dialog';
import {StatusBadge} from '@/components/primitives/StatusBadge';
import {ThemeToggle} from '@/components/primitives/ThemeToggle';
import {RadarVisualization} from '@/components/RadarVisualization';
import {useThemeStore} from '@/store/useThemeStore';
import {Settings} from 'lucide-react';

import type {AnalysisResult} from '@shared/contracts';

const demoRadarData: AnalysisResult['radarData'] = [
  {subject: 'Discipline', A: 45, B: 85, fullMark: 100},
  {subject: 'Consistency', A: 30, B: 90, fullMark: 100},
  {subject: 'Adaptability', A: 40, B: 75, fullMark: 100},
  {subject: 'Resilience', A: 35, B: 80, fullMark: 100},
  {subject: 'Execution', A: 50, B: 95, fullMark: 100},
];

export function ShowcaseApp() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toast, setToast] = useState<ToastItem | null>(null);
  const [score, setScore] = useState<number | string>(7);
  const [textareaVal, setTextareaVal] = useState(
    'I notice myself slipping into reactive multitasking instead of prioritizing one deep project.',
  );

  useEffect(() => useThemeStore.getState().initTheme(), []);

  return (
    <main className="min-h-screen p-8 max-w-6xl mx-auto space-y-12 bg-[var(--color-canvas)] text-[var(--color-text-1)]">
      <header className="flex flex-col gap-5 border-b border-[var(--color-border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            Phase 1 Primitives Showcase
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-2)]">
            Visual verification of dark/light design tokens and component primitives.
          </p>
        </div>
        <ThemeToggle variant="segmented" />
      </header>

      {/* SECTION 1: BUTTONS */}
      <section id="section-buttons" className="space-y-6">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          1. Button Primitives & States
        </h2>

        {/* Variants */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-[var(--color-text-3)] font-mono">
            Variants (Default)
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" id="btn-primary-default">
              Primary Action
            </Button>
            <Button variant="secondary" id="btn-secondary-default">
              Secondary Action
            </Button>
            <Button variant="ghost" id="btn-ghost-default">
              Ghost Action
            </Button>
            <Button variant="danger" id="btn-danger-default">
              Delete Record
            </Button>
            <Button variant="link" id="btn-link-default">
              Inline Navigation
            </Button>
            <Button
              variant="icon"
              aria-label="Settings"
              icon={<Settings size={18} />}
              id="btn-icon-default"
            />
          </div>
        </div>

        {/* States Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-widest text-[var(--color-text-3)] font-mono">
            States (Disabled & Loading)
          </h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" disabled id="btn-primary-disabled">
              Disabled Primary
            </Button>
            <Button variant="secondary" disabled id="btn-secondary-disabled">
              Disabled Secondary
            </Button>
            <Button variant="danger" disabled id="btn-danger-disabled">
              Disabled Danger
            </Button>
            <Button
              variant="primary"
              loading
              loadingText="Securing data..."
              id="btn-primary-loading"
            >
              Primary Loading
            </Button>
            <Button
              variant="secondary"
              loading
              loadingText="Fetching..."
              id="btn-secondary-loading"
            >
              Secondary Loading
            </Button>
            <Button variant="icon" loading aria-label="Loading settings" id="btn-icon-loading" />
          </div>
        </div>
      </section>

      {/* SECTION 2: STATUS BADGES */}
      <section id="section-status-badges" className="space-y-4">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          2. Status Badge Primitives
        </h2>
        <div className="flex flex-wrap items-center gap-4 p-4 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border)]">
          <StatusBadge status="pending" id="badge-pending" />
          <StatusBadge status="completed" id="badge-completed" />
          <StatusBadge status="failed" id="badge-failed" />
        </div>
      </section>

      {/* SECTION 3: CARDS */}
      <section id="section-cards" className="space-y-4">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          3. Card Primitives (5 Variants)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card variant="surface-card" id="card-surface">
            <h4 className="font-display font-bold text-lg mb-2">Surface Card</h4>
            <p className="text-sm text-[var(--color-text-2)]">
              Non-interactive solid container with --color-surface-1 background.
            </p>
          </Card>

          <Card variant="glass-card" id="card-glass">
            <h4 className="font-display font-bold text-lg mb-2">Glass Card</h4>
            <p className="text-sm text-[var(--color-text-2)]">
              Translucent backdrop-blur container for showcases and marketing.
            </p>
          </Card>

          <Card variant="insight-card" id="card-insight">
            <h4 className="font-display font-bold text-lg mb-2">Insight Card</h4>
            <p className="text-sm text-[var(--color-text-2)]">
              Identity gradient border container for key reflection takeaways.
            </p>
          </Card>

          <Card variant="status-card" id="card-status">
            <h4 className="font-display font-bold text-lg mb-2">Status Card</h4>
            <p className="text-sm text-[var(--color-text-2)]">
              Container for pending, empty, and informational state summaries.
            </p>
          </Card>

          <Card variant="danger-card" id="card-danger">
            <h4 className="font-display font-bold text-lg mb-2 text-[var(--color-danger)]">
              Danger Card
            </h4>
            <p className="text-sm text-[var(--color-text-2)]">
              Destructive zone container with subtle danger boundary.
            </p>
          </Card>

          <Card
            variant="surface-card"
            interactive
            id="card-interactive"
            onClick={() =>
              setToast({
                id: String(Date.now()),
                message: 'Interactive card activated.',
                type: 'info',
              })
            }
          >
            <h4 className="font-display font-bold text-lg mb-2 text-[var(--color-accent)]">
              Interactive Card
            </h4>
            <p className="text-sm text-[var(--color-text-2)]">
              Explicitly interactive card with hover lift and focus outline.
            </p>
          </Card>
        </div>
      </section>

      {/* SECTION 4: FORM FIELDS */}
      <section id="section-fields" className="space-y-6">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          4. Field Primitives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <InputField
              id="showcase-email"
              label="Account Email"
              hint="Your identity will remain private to your device"
              placeholder="user@example.com"
              required
            />
            <InputField
              id="showcase-error"
              label="Verification Code"
              hint="Check your authentication authenticator app"
              error="Invalid verification code provided"
              defaultValue="982-X"
            />
          </div>

          <div className="space-y-4">
            <TextareaField
              id="showcase-reflection"
              label="Introspective Prompt"
              hint="Write freely without self-censorship"
              value={textareaVal}
              maxLength={120}
              showCounter
              onChange={(e) => setTextareaVal(e.target.value)}
            />
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[var(--color-surface-1)] border border-[var(--color-border)]">
          <ScoreField
            id="showcase-score"
            label="Intentionality Scale (1-10)"
            hint="Rate how aligned your daily actions were with your intentional trajectory"
            value={score}
            min={1}
            max={10}
            onChange={(val) => setScore(val)}
          />
        </div>
      </section>

      {/* SECTION 5: RADAR VISUALIZATION */}
      <section id="section-radar" className="space-y-4">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          5. Radar Visualization (Cyan = Drifting, Violet = Becoming)
        </h2>
        <div className="p-6 rounded-3xl bg-[var(--color-surface-1)] border border-[var(--color-border)] flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2">
            <RadarVisualization data={demoRadarData} />
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]" />
              <span className="font-display text-sm uppercase tracking-wider font-semibold text-[var(--color-accent)]">
                Drifting Path (Cyan Accent)
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-[var(--color-violet)] shadow-[0_0_8px_var(--color-violet)]" />
              <span className="font-display text-sm uppercase tracking-wider font-semibold text-[var(--color-violet)]">
                Becoming Path (Violet Accent)
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-2)] leading-relaxed">
              Semantics inverted per Product Locked Decision #1: Cyan denotes the current drifting
              trajectory, and Violet denotes the intentional Becoming trajectory.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6: DIALOG & TOAST TRIGGER */}
      <section id="section-feedback" className="space-y-4">
        <h2 className="font-display text-xl font-semibold uppercase tracking-wider text-[var(--color-accent)]">
          6. Dialog & Toast Feedback
        </h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="danger" id="btn-open-dialog" onClick={() => setDialogOpen(true)}>
            Open Destructive Dialog
          </Button>

          <Button
            variant="secondary"
            id="btn-trigger-toast"
            onClick={() =>
              setToast({
                id: String(Date.now()),
                message: 'Analysis exported to text file successfully.',
                type: 'success',
              })
            }
          >
            Trigger Success Toast
          </Button>
        </div>
      </section>

      {/* NATIVE DIALOG COMPONENT */}
      <Dialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Delete Reflection Record"
        description="Are you sure you want to permanently delete this analysis? All habit trajectories will be removed."
        initialFocusSelector="[data-dialog-initial]"
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-xs text-[var(--color-danger)]">
            This action is irreversible. Server deletion will purge your stored record.
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              id="btn-dialog-cancel"
              data-dialog-initial
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              id="btn-dialog-confirm"
              onClick={() => {
                setDialogOpen(false);
                setToast({
                  id: String(Date.now()),
                  message: 'Record successfully deleted.',
                  type: 'error',
                });
              }}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Dialog>

      {/* TOAST COMPONENT */}
      <Toast toast={toast} onDismiss={() => setToast(null)} duration={4000} />
    </main>
  );
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<ShowcaseApp />);
}
