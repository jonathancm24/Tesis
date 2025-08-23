declare module 'bootstrap' {
  export class Modal {
    constructor(element: Element | null, options?: any)
    static getInstance(element: Element): Modal | null
    static getOrCreateInstance(element: Element, options?: any): Modal
    show(): void
    hide(): void
    toggle(): void
  }
}
