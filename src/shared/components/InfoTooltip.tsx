import React, { memo, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { cn } from '../utils/cn';
import type { FieldGuidance } from '../types/fieldGuidance.types';

export interface InfoTooltipProps {
  /** Guidance content, usually a stable entry from a centralized registry. */
  guidance: FieldGuidance;
  /** Label of the field the icon belongs to; used for the accessible name. */
  fieldLabel?: string;
  /** Extra classes for the trigger button (layout tweaks only). */
  className?: string;
}

const PANEL_WIDTH = 340;
const PANEL_GAP = 8;
const VIEWPORT_MARGIN = 8;
/** Minimum room above the trigger before the panel is flipped below it. */
const FLIP_THRESHOLD = 180;

interface TooltipLayout {
  open: boolean;
  /** Opened by click/tap, so pointer-leave must not close it. */
  pinned: boolean;
  left: number;
  width: number;
  top?: number;
  bottom?: number;
  maxHeight: number;
}

/**
 * Field information icon + tooltip.
 *
 * - Hover (mouse), click/tap, keyboard Enter/Space open it; Escape, blur or an
 *   outside tap closes it.
 * - The panel is portalled with fixed coordinates computed when it opens, so it is
 *   never clipped by cards, scroll containers or viewport edges.
 * - The full guidance is always exposed to assistive tech through `aria-describedby`,
 *   even while the panel is closed.
 * - No effects, timers or global listeners: an invisible overlay handles outside taps,
 *   and only the icon that is open holds state.
 */
export const InfoTooltip: React.FC<InfoTooltipProps> = memo(
  ({ guidance, fieldLabel, className }) => {
    const descriptionId = useId();
    const triggerRef = useRef<HTMLButtonElement>(null);
    const closeTimerRef = useRef<number | null>(null);
    const [layout, setLayout] = useState<TooltipLayout | null>(null);

    const open = layout?.open ?? false;

    const cancelScheduledClose = () => {
      if (closeTimerRef.current !== null) {
        window.clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };

    const scheduleClose = () => {
      cancelScheduledClose();
      closeTimerRef.current = window.setTimeout(() => {
        close();
      }, 200);
    };

    const close = () => {
      cancelScheduledClose();
      setLayout(null);
    };

    const openAt = (pinned: boolean) => {
      cancelScheduledClose();
      const trigger = triggerRef.current;
      if (!trigger) return;

      const rect = trigger.getBoundingClientRect();
      const width = Math.min(PANEL_WIDTH, window.innerWidth - VIEWPORT_MARGIN * 2);
      const centered = rect.left + rect.width / 2 - width / 2;
      const left = Math.min(
        Math.max(centered, VIEWPORT_MARGIN),
        window.innerWidth - width - VIEWPORT_MARGIN
      );

      const spaceAbove = rect.top;
      const placeAbove = spaceAbove >= FLIP_THRESHOLD;

      setLayout({
        open: true,
        pinned,
        left,
        width,
        top: placeAbove ? undefined : rect.bottom + PANEL_GAP,
        bottom: placeAbove ? window.innerHeight - rect.top + PANEL_GAP : undefined,
        maxHeight: Math.max(
          120,
          (placeAbove ? spaceAbove : window.innerHeight - rect.bottom) - PANEL_GAP * 3
        ),
      });
    };

    const handlePointerEnter = (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== 'mouse') return;
      cancelScheduledClose();
      if (!open) {
        openAt(false);
      }
    };

    const handlePointerLeave = (event: React.PointerEvent<HTMLButtonElement>) => {
      if (event.pointerType !== 'mouse' || layout?.pinned) return;
      scheduleClose();
    };

    const handleClick = () => {
      cancelScheduledClose();
      // A hover preview becomes pinned on click; a pinned tooltip closes on the next click.
      if (layout?.pinned) {
        close();
        return;
      }
      openAt(true);
    };

    // Enter and Space are handled by the native button click, so only Escape needs wiring here.
    const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'Escape' && open) {
        event.stopPropagation();
        close();
      }
    };

    const screenReaderText = [
      guidance.description,
      guidance.purpose ? `Why: ${guidance.purpose}` : null,
      guidance.expectedFormat ? `Format: ${guidance.expectedFormat}` : null,
      guidance.example ? `Example: ${guidance.example}` : null,
      guidance.documentRequirement ? `Document: ${guidance.documentRequirement}` : null,
      guidance.acceptedFormats?.length
        ? `Accepted: ${guidance.acceptedFormats.join(', ')}`
        : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <>
        <button
          ref={triggerRef}
          type="button"
          onClick={handleClick}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onKeyDown={handleKeyDown}
          aria-label={`Field information: ${fieldLabel ?? guidance.title ?? 'this field'}`}
          aria-describedby={descriptionId}
          aria-expanded={open}
          className={cn('info-tooltip-trigger', className)}
        >
          <Info className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
        </button>

        <span id={descriptionId} className="sr-only">
          {screenReaderText}
        </span>

        {layout?.open &&
          createPortal(
            <>
              {layout.pinned && (
                <div
                  className="fixed inset-0 z-[79]"
                  aria-hidden="true"
                  onPointerDown={close}
                />
              )}
              <div
                role="tooltip"
                aria-hidden="true"
                className="info-tooltip-panel"
                onPointerEnter={() => {
                  if (!layout.pinned) {
                    cancelScheduledClose();
                  }
                }}
                onPointerLeave={(event: React.PointerEvent<HTMLDivElement>) => {
                  if (event.pointerType === 'mouse' && !layout.pinned) {
                    scheduleClose();
                  }
                }}
                onWheel={(e) => {
                  e.stopPropagation();
                }}
                onTouchMove={(e) => {
                  e.stopPropagation();
                }}
                style={{
                  left: layout.left,
                  width: layout.width,
                  top: layout.top,
                  bottom: layout.bottom,
                  maxHeight: layout.maxHeight,
                  pointerEvents: 'auto',
                }}
              >
                <p className="info-tooltip-title">
                  {guidance.title ?? fieldLabel ?? 'Field guidance'}
                </p>
                <p className="info-tooltip-description">{guidance.description}</p>

                {guidance.purpose && (
                  <div className="info-tooltip-section">
                    <span className="info-tooltip-label">Why we ask</span>
                    <span className="info-tooltip-value">{guidance.purpose}</span>
                  </div>
                )}

                {guidance.expectedFormat && (
                  <div className="info-tooltip-section">
                    <span className="info-tooltip-label">Format</span>
                    <span className="info-tooltip-value">{guidance.expectedFormat}</span>
                  </div>
                )}

                {guidance.example && (
                  <div className="info-tooltip-section">
                    <span className="info-tooltip-label">Example</span>
                    <span className="info-tooltip-example">{guidance.example}</span>
                  </div>
                )}

                {guidance.documentRequirement && (
                  <div className="info-tooltip-section">
                    <span className="info-tooltip-label">Document</span>
                    <span className="info-tooltip-value">{guidance.documentRequirement}</span>
                  </div>
                )}

                {guidance.acceptedFormats && guidance.acceptedFormats.length > 0 && (
                  <div className="info-tooltip-formats">
                    {guidance.acceptedFormats.map((format) => (
                      <span key={format} className="info-tooltip-chip">
                        {format}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </>,
            document.body
          )}
      </>
    );
  }
);

InfoTooltip.displayName = 'InfoTooltip';
