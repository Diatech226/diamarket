import * as React from 'react';
export type DiaIconRenderer=(props:React.SVGProps<SVGSVGElement>)=>React.ReactNode;const registry=new Map<string,DiaIconRenderer>();
export function registerDiaIcon(name:string,renderer:DiaIconRenderer){registry.set(name,renderer)}
export function getDiaIcon(name:string){return registry.get(name)}
export function DiaIcon({name,size=20,...props}:React.SVGProps<SVGSVGElement>&{name:string;size?:number}){const Icon=registry.get(name);return Icon?<>{Icon({width:size,height:size,'aria-hidden':props['aria-label']?undefined:true,...props})}</>:<svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" {...props}><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg>}
['home','cart','search','user','settings','logout'].forEach(n=>registerDiaIcon(n,p=><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" {...p}><circle cx="12" cy="12" r="9"/><path d="M8 12h8"/></svg>));
