/** @typedef {import("./OverlayElement.mjs").OverlayElement} OverlayElement */
/** @typedef {import("./OverlayElementButtonClickEvent.mjs").OverlayElementButtonClickEvent} OverlayElementButtonClickEvent */
/** @typedef {import("./OverlayElementInputChangeEvent.mjs").OverlayElementInputChangeEvent} OverlayElementInputChangeEvent */
/** @typedef {import("./OverlayElementInputInputEvent.mjs").OverlayElementInputInputEvent} OverlayElementInputInputEvent */

/**
 * @typedef {OverlayElement & {addEventListener: ((type: "button-click", callback: (event: OverlayElementButtonClickEvent) => void, options?: boolean | AddEventListenerOptions) => void) & ((type: "input-change", callback: (event: OverlayElementInputChangeEvent) => void, options?: boolean | AddEventListenerOptions) => void) & ((type: "input-input", callback: (event: OverlayElementInputInputEvent) => void, options?: boolean | AddEventListenerOptions) => void), removeEventListener: ((type: "button-click", callback: (event: OverlayElementButtonClickEvent) => void, options?: boolean | EventListenerOptions) => void) & ((type: "input-change", callback: (event: OverlayElementInputChangeEvent) => void, options?: boolean | EventListenerOptions) => void) & ((type: "input-input", callback: (event: OverlayElementInputInputEvent) => void, options?: boolean | EventListenerOptions) => void)}} OverlayElementWithEvents
 */
