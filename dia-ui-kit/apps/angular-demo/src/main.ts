import{Component,CUSTOM_ELEMENTS_SCHEMA}from'@angular/core';import{DiaButtonWrapper,DiaHasAuthorityPipe,provideDiaUi}from'@dia-ui/angular';
export const appConfig={id:'angular-demo',name:'Angular Dia Demo',category:'admin' as const,layout:{navigationMode:'sidebar' as const}};
export const providers=provideDiaUi(appConfig,{roles:['admin']});
@Component({selector:'dia-angular-demo',standalone:true,imports:[DiaButtonWrapper,DiaHasAuthorityPipe],schemas:[CUSTOM_ELEMENTS_SCHEMA],template:`<dia-ng-button label="Angular wrapper"></dia-ng-button>`})export class AngularDemoComponent{}
