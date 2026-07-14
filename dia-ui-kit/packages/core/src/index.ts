export type DiaAppCategory='marketplace'|'payment'|'logistics'|'equipment'|'cms'|'admin'|'public'|'custom';
export type DiaNavigationMode='sidebar'|'topbar'|'both'|'none';
export type DiaAuthorityMatchMode='any'|'all';
export interface DiaAsset{src:string;alt?:string;width?:number;height?:number;metadata?:Record<string,unknown>}
export interface DiaBadgeConfig{label:string;tone?:'neutral'|'brand'|'success'|'warning'|'danger';value?:number|string}
export interface DiaAuthorityRequirement{match?:DiaAuthorityMatchMode;authorities?:string[];roles?:string[];permissions?:string[]}
export interface DiaUserAuthorizations{authorities?:string[];roles?:string[];permissions?:string[];metadata?:Record<string,unknown>}
export interface DiaMenuItem{id:string;label:string;href?:string;icon?:string;badge?:DiaBadgeConfig;hidden?:boolean;requirement?:DiaAuthorityRequirement;children?:DiaMenuItem[];metadata?:Record<string,unknown>}
export interface DiaThemeConfig{name?:string;mode?:'light'|'dark'|'system';cssVariables?:Record<string,string>;tokens?:Record<string,unknown>}
export interface DiaLayoutConfig{navigationMode?:DiaNavigationMode;maxWidth?:string;sidebarWidth?:string;mobileBottomNavigation?:boolean;responsive?:boolean;density?:'comfortable'|'compact'}
export interface DiaHeaderConfig{title?:string;logo?:DiaAsset;darkLogo?:DiaAsset;favicon?:DiaAsset;sticky?:boolean;actions?:DiaMenuItem[]}
export interface DiaNavigationConfig{mode?:DiaNavigationMode;headerItems?:DiaMenuItem[];sidebarItems?:DiaMenuItem[];bottomItems?:DiaMenuItem[]}
export interface DiaCartConfig{enabled?:boolean;itemCount?:number;behavior?:'drawer'|'page'|'callback';href?:string}
export interface DiaSearchConfig{enabled?:boolean;placeholder?:string;global?:boolean;scope?:string[]}
export interface DiaLocalizationConfig{locale?:string;locales?:string[];currency?:string;currencies?:string[];direction?:'ltr'|'rtl'}
export interface DiaRouteConfig{path:string;label?:string;requirement?:DiaAuthorityRequirement;metadata?:Record<string,unknown>}
export interface DiaAppConfig{id:string;name:string;category:DiaAppCategory;logo?:DiaAsset;darkLogo?:DiaAsset;favicon?:DiaAsset;theme?:DiaThemeConfig;layout?:DiaLayoutConfig;header?:DiaHeaderConfig;navigation?:DiaNavigationConfig;cart?:DiaCartConfig;search?:DiaSearchConfig;localization?:DiaLocalizationConfig;routes?:DiaRouteConfig[];metadata?:Record<string,unknown>}
export interface DiaNavigationAdapter{navigate:(href:string,item?:DiaMenuItem)=>void;isActive?:(href:string,currentPath?:string)=>boolean}
export interface DiaAuthUser{id:string;name?:string;email?:string;avatar?:DiaAsset;authorizations?:DiaUserAuthorizations;metadata?:Record<string,unknown>}
export interface DiaAuthAdapter{getUser:()=>DiaAuthUser|null|Promise<DiaAuthUser|null>;logout?:()=>void|Promise<void>}
const hasAll=(user:string[]|undefined,need:string[]|undefined)=>!need?.length||need.every(v=>user?.includes(v));
const hasAny=(user:string[]|undefined,need:string[]|undefined)=>!need?.length||need.some(v=>user?.includes(v));
export function hasDiaAuthority(user:DiaUserAuthorizations|undefined|null,requirement?:DiaAuthorityRequirement|null):boolean{if(!requirement)return true;const declared=[requirement.authorities,requirement.roles,requirement.permissions].some(v=>v&&v.length);if(!declared)return true;const u=user??{};if(requirement.match==='all')return hasAll(u.authorities,requirement.authorities)&&hasAll(u.roles,requirement.roles)&&hasAll(u.permissions,requirement.permissions);return hasAny(u.authorities,requirement.authorities)||hasAny(u.roles,requirement.roles)||hasAny(u.permissions,requirement.permissions)}
export function filterAuthorizedMenuItems(items:DiaMenuItem[],user?:DiaUserAuthorizations|null):DiaMenuItem[]{return items.flatMap(item=>{if(item.hidden||!hasDiaAuthority(user,item.requirement))return[];const children=item.children?filterAuthorizedMenuItems(item.children,user):undefined;const next={...item,children};if(!next.href&&(!children||children.length===0))return[];return[next];});}
