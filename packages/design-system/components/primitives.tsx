import * as React from 'react';
import { colors } from '../colors';
import { typography } from '../typography';
import { spacing } from '../spacing';
import { radius } from '../radius';
import { shadows } from '../shadows';
import { animations } from '../animations';
import { Icon } from '../icons';

const c = colors.light;
const focus = { outline: `2px solid ${c.InputFocus}`, outlineOffset: 2 };
const baseText = { ...typography.Body, color: c.Text };
type DivProps = React.HTMLAttributes<HTMLDivElement>;

export function Button({ variant = 'primary', style, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary'|'secondary'|'ghost'|'danger' }) {
  const palette = variant === 'danger' ? { background: c.Danger, color: c.Surface, borderColor: c.Danger } : variant === 'secondary' ? { background: c.PrimarySoft, color: c.Primary, borderColor: c.Border } : variant === 'ghost' ? { background: 'transparent', color: c.Primary, borderColor: 'transparent' } : { background: c.Primary, color: c.Surface, borderColor: c.Primary };
  return <button {...props} style={{ ...typography.Label, minHeight: 44, padding: `${spacing[12]} ${spacing[16]}`, borderRadius: radius.lg, border: '1px solid', cursor: 'pointer', ...palette, ...style }} />;
}
export function Card({ style, ...props }: DivProps) { return <div {...props} style={{ background: c.Card, border: `1px solid ${c.Border}`, borderRadius: radius.xl, boxShadow: shadows.card, padding: spacing[24], ...baseText, ...style }} />; }
export function Badge({ tone='neutral', style, ...props }: DivProps & { tone?: 'neutral'|'success'|'warning'|'danger'|'accent' }) { const color = tone === 'success' ? c.Success : tone === 'warning' ? c.Warning : tone === 'danger' ? c.Danger : tone === 'accent' ? c.Accent : c.TextMuted; return <span {...props} style={{ ...typography.Caption, display:'inline-flex', alignItems:'center', minHeight:24, padding:`${spacing[4]} ${spacing[8]}`, borderRadius:radius.pill, color, background:c.PrimarySoft, ...style }} />; }
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...props} style={{ ...baseText, minHeight:44, width:'100%', padding:`${spacing[12]} ${spacing[16]}`, background:c.Input, border:`1px solid ${c.Border}`, borderRadius:radius.lg, ...props.style }} />; }
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} style={{ ...baseText, width:'100%', padding:spacing[16], background:c.Input, border:`1px solid ${c.Border}`, borderRadius:radius.lg, ...props.style }} />; }
export function Checkbox(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input type="checkbox" {...props} style={{ width:20, height:20, accentColor:c.Primary, ...props.style }} />; }
export function Switch(props: React.InputHTMLAttributes<HTMLInputElement>) { return <input type="checkbox" role="switch" {...props} style={{ width:44, height:24, accentColor:c.Primary, ...props.style }} />; }
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...props} style={{ ...baseText, minHeight:44, width:'100%', padding:`${spacing[12]} ${spacing[16]}`, background:c.Input, border:`1px solid ${c.Border}`, borderRadius:radius.lg, ...props.style }} />; }
export function Modal({ open=true, title, children, ...props }: DivProps & { open?: boolean; title?: string }) { if (!open) return null; return <div role="dialog" aria-modal="true" aria-label={title} style={{ position:'fixed', inset:0, background:c.Overlay, display:'grid', placeItems:'center', padding:spacing[24] }}><Card {...props} style={{ maxWidth:640, width:'100%', boxShadow:shadows.modal, animation:animations.modal, ...props.style }}>{title ? <h2 style={typography.Title}>{title}</h2> : null}{children}</Card></div>; }
export function Table(props: React.TableHTMLAttributes<HTMLTableElement>) { return <table {...props} style={{ width:'100%', borderCollapse:'collapse', ...baseText, ...props.style }} />; }
export function Avatar({ name='', src, style, ...props }: React.ImgHTMLAttributes<HTMLImageElement> & { name?: string }) { return src ? <img alt={props.alt ?? name} src={src} {...props} style={{ width:40, height:40, borderRadius:radius.full, objectFit:'cover', ...style }} /> : <span aria-label={name} style={{ display:'inline-grid', placeItems:'center', width:40, height:40, borderRadius:radius.full, background:c.PrimarySoft, color:c.Primary, ...typography.Label, ...style }}>{name.slice(0,2).toUpperCase()}</span>; }
export function Dropdown({ label='Options', children }: { label?: string; children: React.ReactNode }) { return <details><summary style={{ ...typography.Label, cursor:'pointer', color:c.Primary }}>{label}</summary><Card style={{ boxShadow:shadows.dropdown, marginTop:spacing[8] }}>{children}</Card></details>; }
export function Tabs({ tabs }: { tabs: { id:string; label:string; content: React.ReactNode }[] }) { return <div><div role="tablist" style={{ display:'flex', gap:spacing[8], borderBottom:`1px solid ${c.Divider}` }}>{tabs.map((t, i)=><Button key={t.id} role="tab" aria-selected={i===0} variant={i===0?'primary':'ghost'}>{t.label}</Button>)}</div><div role="tabpanel" style={{ paddingTop:spacing[16] }}>{tabs[0]?.content}</div></div>; }
export function EmptyState({ title='Aucun résultat', description, action }: { title?: string; description?: string; action?: React.ReactNode }) { return <Card style={{ textAlign:'center' }}><Icon name="empty" style={{ width:48, height:48, color:c.TextMuted }}/><h3 style={typography.Title}>{title}</h3>{description ? <p style={{ ...typography.Body, color:c.TextMuted }}>{description}</p> : null}{action}</Card>; }
export function Loading({ label='Chargement' }: { label?: string }) { return <div role="status" aria-live="polite" style={{ display:'inline-flex', alignItems:'center', gap:spacing[8], color:c.TextMuted, ...typography.Label }}><Icon name="loading" style={{ width:20, height:20, animation:animations.skeleton }}/>{label}</div>; }
export function LoadingState(props: { label?: string }) { return <Loading {...props} />; }
export function Skeleton({ style, ...props }: DivProps) { return <div {...props} style={{ minHeight:16, borderRadius:radius.md, background:c.Skeleton, animation:animations.skeleton, ...style }} />; }
export function StatCard({ label, value, trend }: { label:string; value:React.ReactNode; trend?:React.ReactNode }) { return <Card><div style={{ ...typography.Caption, color:c.TextMuted }}>{label}</div><div style={typography.Headline}>{value}</div>{trend ? <div style={{ ...typography.Caption, color:c.Success }}>{trend}</div> : null}</Card>; }
export const Drawer = Card;
export const Tooltip = Badge;
export const Pagination = Card;
export const DataGrid = Table;
export const Toast = Badge;
export const Alert = Card;
export const Breadcrumb = Card;
export const SearchBar = Input;
export const focusStyle = focus;
