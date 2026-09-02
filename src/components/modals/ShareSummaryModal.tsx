import {Copy, Share2, ShieldCheck, Check} from 'lucide-react';
import {useState} from 'react';

import type {AnalysisResult} from '@shared/contracts';
import {Dialog} from '@/components/primitives/Dialog';

interface ShareSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AnalysisResult;
  onCopied?: () => void;
}

export function ShareSummaryModal({isOpen, onClose, analysis, onCopied}: ShareSummaryModalProps) {
  const [copied, setCopied] = useState(false);

  const summaryText = `Becoming Reflection Summary\nArchetype: ${analysis.identity.archetype}\n\n"${analysis.identity.description}"\n\nPotential Score: ${analysis.identityCard.potentialScore}/100 • AI Readiness: ${analysis.identityCard.aiReadiness}/100`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      onCopied?.();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Becoming — ${analysis.identity.archetype}`,
          text: summaryText,
        });
      } catch {
        // User cancelled share
      }
    } else {
      await handleCopy();
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      maxWidthClass="max-w-[540px]"
      labelledBy="share-summary-dialog-title"
      describedBy="share-summary-dialog-description"
    >
      <div>
        <h2
          id="share-summary-dialog-title"
          className="font-display text-xl font-bold text-white sm:text-2xl"
        >
          Share Reflection Summary
        </h2>
        <p id="share-summary-dialog-description" className="mt-1.5 text-xs text-slate-400">
          Share your high-level archetype guidance without exposing private answers.
        </p>

        {/* 16:9 Preview Card */}
        <div className="relative mt-6 aspect-video overflow-hidden rounded-2xl border border-white/15 bg-gradient-to-br from-[#090A0F] via-[#020205] to-[#12131F] p-6 shadow-inner flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-white">
                Becoming
              </span>
            </div>
            <span className="font-display text-[10px] uppercase tracking-wider text-cyan-300">
              Archetype Card
            </span>
          </div>

          <div className="my-auto space-y-2">
            <span className="font-display text-xs font-semibold uppercase tracking-widest text-cyan-400">
              {analysis.identity.archetype}
            </span>
            <p className="line-clamp-2 font-serif text-sm italic text-slate-200">
              "{analysis.identity.description}"
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-slate-400 font-display uppercase tracking-wider">
            <span>Score: {analysis.identityCard.potentialScore}/100</span>
            <span>Readiness: {analysis.identityCard.aiReadiness}/100</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void handleCopy()}
            className="secondary-button flex-1"
          >
            {copied ? <Check size={15} className="text-emerald-400" /> : <Copy size={15} />}
            <span>{copied ? 'Summary Copied' : 'Copy Summary'}</span>
          </button>

          {typeof navigator !== 'undefined' && 'share' in navigator ? (
            <button
              type="button"
              onClick={() => void handleNativeShare()}
              className="primary-button flex-1"
            >
              <Share2 size={15} />
              <span>Share Sheet</span>
            </button>
          ) : null}
        </div>

        {/* Privacy Note */}
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400">
          <ShieldCheck size={13} className="text-cyan-400/80" />
          <span>Only the public summary is shared. Your 8 reflections remain private.</span>
        </p>
      </div>
    </Dialog>
  );
}
