declare module 'vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component

  // Types for Vue API
  export interface InjectionKey<T> extends Symbol {}
  export type Plugin<Options = any> = {
    install: (app: any, ...options: any[]) => any;
  } | ((app: any, ...options: any[]) => any)
  export const inject: any
  export const provide: any
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
} 