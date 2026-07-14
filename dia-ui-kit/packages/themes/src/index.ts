import type{DiaThemeConfig}from'@dia-ui/core';
export const diaDefaultTheme:DiaThemeConfig={name:'dia',mode:'system',cssVariables:{'--dia-color-brand':'#2563eb'}};
export const diaMarketTheme:DiaThemeConfig={name:'diamarket',cssVariables:{'--dia-color-brand':'#059669'}};
export const diaPayTheme:DiaThemeConfig={name:'diapay',cssVariables:{'--dia-color-brand':'#4f46e5'}};
export const diaExpressTheme:DiaThemeConfig={name:'diaexpress',cssVariables:{'--dia-color-brand':'#ea580c'}};
export const delTheme:DiaThemeConfig={name:'del',cssVariables:{'--dia-color-brand':'#ca8a04'}};
export const diaThemes=[diaDefaultTheme,diaMarketTheme,diaPayTheme,diaExpressTheme,delTheme];
