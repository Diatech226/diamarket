import React from 'react';
import { cn } from '../../utils/cn';

export function Stepper({ steps, currentIndex = 0, className }) {
  return (
    <nav aria-label="Progression" className={cn('flex flex-col gap-3', className)}>
      <ol className="flex snap-x gap-2 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-2 md:grid md:grid-cols-5 md:gap-3 md:overflow-visible md:p-3">
        {steps.map((step, index) => {
          const status = step.status || (index < currentIndex ? 'done' : index === currentIndex ? 'current' : 'upcoming');
          const isDone = status === 'done';
          const isCurrent = status === 'current';
          return (
            <li
              key={step.label}
              className={cn(
                'min-w-[170px] snap-start rounded-xl border px-3 py-2 md:min-w-0',
                isCurrent ? 'border-sky-300 bg-sky-50/60' : 'border-slate-200'
              )}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <div className="flex items-center gap-2.5">
              <div
                className={cn(
                  'flex h-8 w-8 flex-none items-center justify-center rounded-full border text-xs font-semibold transition',
                  isDone && 'border-green-500 bg-green-500 text-white',
                  isCurrent && 'border-sky-500 text-sky-600',
                  !isDone && !isCurrent && 'border-slate-200 text-slate-400'
                )}
              >
                {isDone ? '✓' : index + 1}
              </div>
              <div className="flex flex-col">
                <span className={cn('text-sm font-semibold', isCurrent ? 'text-sky-700' : 'text-slate-700')}>
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-xs text-slate-500">{step.description}</span>
                )}
              </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
