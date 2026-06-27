import * as React from 'react';

export type IconName = 'chevronDown' | 'check' | 'close' | 'search' | 'empty' | 'loading';
export type IconProps = React.SVGProps<SVGSVGElement> & { name: IconName; label?: string };
const paths: Record<IconName, React.ReactNode> = {
  chevronDown: <path d="m6 9 6 6 6-6" />,
  check: <path d="m5 13 4 4L19 7" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  search: <path d="m21 21-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />,
  empty: <path d="M4 7h16v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Zm4-4h8l2 4H6l2-4Z" />,
  loading: <path d="M21 12a9 9 0 1 1-6.2-8.6" />,
};
export function Icon({ name, label, ...props }: IconProps) {
  return <svg role={label ? 'img' : 'presentation'} aria-label={label} aria-hidden={label ? undefined : true} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>{paths[name]}</svg>;
}
