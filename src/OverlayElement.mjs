import css from "./OverlayElement.css" with { type: "css" };
import root_css from "./OverlayElementRoot.css" with { type: "css" };

/** @typedef {import("./Button.mjs").Button} Button */
/** @typedef {import("form/src/FormElement.mjs").FormElement} FormElement */
/** @typedef {import("form/src/Input.mjs").Input} Input */
/** @typedef {import("form/src/InputValue.mjs").InputValue} InputValue */
/** @typedef {import("loading-spinner/src/LoadingSpinnerElement.mjs").LoadingSpinnerElement} LoadingSpinnerElement */
/** @typedef {import("./Result.mjs").Result} Result */
/** @typedef {import("./StyleSheetManager/StyleSheetManager.mjs").StyleSheetManager} StyleSheetManager */
/** @typedef {import("form/src/validateValue.mjs").validateValue} validateValue */

export const OVERLAY_ELEMENT_EVENT_BUTTON_CLICK = "overlay-button-click";

export const OVERLAY_ELEMENT_EVENT_INPUT_CHANGE = "overlay-input-change";

export const OVERLAY_ELEMENT_EVENT_INPUT_INPUT = "overlay-input-input";

export const OVERLAY_ELEMENT_VARIABLE_PREFIX = "--overlay-";

export class OverlayElement extends HTMLElement {
    /**
     * @type {FormElement | null}
     */
    #form_element = null;
    /**
     * @type {LoadingSpinnerElement | null}
     */
    #loading_spinner_element = null;
    /**
     * @type {Element | null}
     */
    #parent_element = null;
    /**
     * @type {ShadowRoot}
     */
    #shadow;
    /**
     * @type {StyleSheetManager | null}
     */
    #style_sheet_manager;

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {string} ok_button_label
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<void>}
     */
    static async alert(title, message, ok_button_label, style_sheet_manager = null) {
        await this.wait(
            title,
            message,
            null,
            [
                {
                    label: ok_button_label,
                    value: "ok"
                }
            ],
            style_sheet_manager
        );
    }

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {string} no_button_label
     * @param {string} yes_button_label
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<boolean>}
     */
    static async confirm(title, message, no_button_label, yes_button_label, style_sheet_manager = null) {
        return (await this.wait(
            title,
            message,
            null,
            [
                {
                    label: no_button_label,
                    value: "no"
                },
                {
                    label: yes_button_label,
                    value: "yes"
                }
            ],
            style_sheet_manager
        )).button === "yes";
    }

    /**
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<OverlayElement>}
     */
    static async loading(style_sheet_manager = null) {
        const overlay_element = await this.new(
            null,
            null,
            null,
            style_sheet_manager
        );

        overlay_element.style.setProperty(`${OVERLAY_ELEMENT_VARIABLE_PREFIX}container-background-color`, "transparent");
        overlay_element.style.setProperty(`${OVERLAY_ELEMENT_VARIABLE_PREFIX}container-border-color`, "transparent");

        await overlay_element.showLoading(
            null,
            true
        );

        overlay_element.show();

        return overlay_element;
    }

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {string | null} input_placeholder
     * @param {string | null} input_value
     * @param {string | null} cancel_button_label
     * @param {string} ok_button_label
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<string | null>}
     */
    static async prompt(title, message, input_placeholder, input_value, cancel_button_label, ok_button_label, style_sheet_manager = null) {
        const result = await this.wait(
            title,
            message,
            [
                {
                    "auto-focus": true,
                    name: "input",
                    placeholder: input_placeholder,
                    value: input_value
                }
            ],
            [
                ...(cancel_button_label ?? null) !== null ? [
                    {
                        label: cancel_button_label,
                        value: "cancel"
                    }
                ] : [],
                {
                    label: ok_button_label,
                    value: "ok"
                }
            ],
            style_sheet_manager
        );

        if (result.button !== "ok") {
            return null;
        }

        return result.inputs.find(value => value.name === "input").value;
    }

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {Input[] | null} inputs
     * @param {Button[] | null} buttons
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<Result>}
     */
    static async wait(title = null, message = null, inputs = null, buttons = null, style_sheet_manager = null) {
        const overlay_element = await this.new(
            title,
            message,
            buttons,
            style_sheet_manager
        );

        await overlay_element.setInputs(
            inputs ?? []
        );

        return overlay_element.wait();
    }

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {Button[] | null} buttons
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<OverlayElement>}
     */
    static async new(title = null, message = null, buttons = null, style_sheet_manager = null) {
        if (style_sheet_manager !== null) {
            await style_sheet_manager.generateVariablesRootStyleSheet(
                OVERLAY_ELEMENT_VARIABLE_PREFIX,
                {
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}active-button-background-color`]: "foreground-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}active-button-foreground-color`]: "background-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}button-background-color`]: "accent-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}button-focus-outline-color`]: "foreground-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}button-foreground-color`]: "accent-foreground-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}container-background-color`]: "background-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}container-border-color`]: "foreground-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}container-focus-outline-color`]: "foreground-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}container-foreground-color`]: "foreground-color",
                    [`${OVERLAY_ELEMENT_VARIABLE_PREFIX}loading-color`]: "accent-color"
                },
                true
            );

            await style_sheet_manager.addRootStyleSheet(
                root_css,
                true
            );
        } else {
            if (!document.adoptedStyleSheets.includes(root_css)) {
                document.adoptedStyleSheets.unshift(root_css);
            }
        }

        const overlay_element = new this(
            style_sheet_manager
        );

        overlay_element.#shadow = overlay_element.attachShadow({
            mode: "closed"
        });

        await overlay_element.#style_sheet_manager?.addStyleSheetsToShadow(
            overlay_element.#shadow
        );

        overlay_element.#shadow.adoptedStyleSheets.push(css);

        const container_element = document.createElement("div");
        container_element.classList.add("container");

        const title_element = document.createElement("div");
        title_element.classList.add("title");
        container_element.append(title_element);

        const message_element = document.createElement("div");
        message_element.classList.add("message");
        container_element.append(message_element);

        const inputs_element = document.createElement("div");
        inputs_element.classList.add("inputs");
        container_element.append(inputs_element);

        const loading_element = document.createElement("div");
        loading_element.classList.add("loading");
        container_element.append(loading_element);

        const buttons_element = document.createElement("div");
        buttons_element.classList.add("buttons");
        container_element.append(buttons_element);

        overlay_element.#shadow.append(container_element);

        overlay_element.title = title ?? "";
        overlay_element.message = message ?? "";
        overlay_element.buttons = buttons ?? [];

        return overlay_element;
    }

    /**
     * @param {StyleSheetManager | null} style_sheet_manager
     * @private
     */
    constructor(style_sheet_manager) {
        super();

        this.#style_sheet_manager = style_sheet_manager;
    }

    /**
     * @returns {void}
     */
    connectedCallback() {
        this.#parent_element = this.parentElement;

        const sibling_elements = this.#sibling_elements;

        for (const sibling_element of sibling_elements) {
            if (sibling_element !== sibling_elements[sibling_elements.length - 1]) {
                sibling_element.inert = true;
            } else {
                sibling_element.inert = false;
            }
        }
    }

    /**
     * @returns {void}
     */
    disconnectedCallback() {
        if (this.#parent_element === null) {
            return;
        }

        const sibling_elements = this.#sibling_elements;

        const last_sibling_element = sibling_elements[sibling_elements.length - 1];

        const has_overlay_element = last_sibling_element instanceof this.constructor;

        for (const sibling_element of this.#parent_element.children) {
            if (has_overlay_element && sibling_element !== last_sibling_element) {
                sibling_element.inert = true;
            } else {
                sibling_element.inert = false;
            }
        }

        this.#parent_element = null;
    }

    /**
     * @param {string} type
     * @param {validateValue} validate_value
     * @returns {Promise<void>}
     */
    async addAdditionalInputValidationType(type, validate_value) {
        await this.#form_element?.addAdditionalValidationType(
            type,
            validate_value
        );
    }

    /**
     * @returns {Button[]}
     */
    get buttons() {
        return this.#button_elements.map(button_element => ({
            disabled: button_element.disabled,
            label: button_element.innerText,
            title: button_element.title,
            value: button_element.value
        }));
    }

    /**
     * @param {Button[] | boolean} buttons
     * @returns {void}
     */
    set buttons(buttons) {
        if (typeof buttons === "boolean") {
            for (const button_element of this.#button_elements) {
                button_element.disabled = buttons;
            }
            return;
        }

        this.#button_elements.forEach(button_element => {
            button_element.remove();
        });

        for (const button of buttons) {
            const button_element = document.createElement("button");

            button_element.disabled = button.disabled ?? false;

            button_element.innerText = button.label;

            const title = button.title ?? "";
            if (title !== "") {
                button_element.title = title;
            }

            button_element.type = "button";

            button_element.value = button.value;

            button_element.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent(OVERLAY_ELEMENT_EVENT_BUTTON_CLICK, {
                    detail: {
                        button: button_element.value,
                        inputs: this.input_values
                    }
                }));
            });

            this.#buttons_element.append(button_element);
        }
    }

    /**
     * @returns {boolean}
     */
    get buttons_vertical() {
        return this.#buttons_element.dataset.vertical === "true";
    }

    /**
     * @param {boolean} buttons_vertical
     * @returns {void}
     */
    set buttons_vertical(buttons_vertical) {
        if (buttons_vertical) {
            this.#buttons_element.dataset.vertical = true;
        } else {
            delete this.#buttons_element.dataset.vertical;
        }
    }

    /**
     * @returns {string}
     */
    get html_title() {
        return super.title;
    }

    /**
     * @param {string} html_title
     * @returns {void}
     */
    set html_title(html_title) {
        super.title = html_title;
    }

    /**
     * @returns {InputValue[]}
     */
    get input_values() {
        return this.#form_element?.values ?? [];
    }

    /**
     * @returns {Input[]}
     */
    get inputs() {
        return this.#form_element?.inputs ?? [];
    }

    /**
     * @returns {boolean}
     */
    get loading() {
        return this.#loading_spinner_element !== null;
    }

    /**
     * @returns {string}
     */
    get message() {
        return this.#message_element.innerText;
    }

    /**
     * @param {string} message
     * @returns {void}
     */
    set message(message) {
        this.#message_element.innerText = message;
    }

    /**
     * @param {Input[] | boolean} inputs
     * @returns {Promise<void>}
     */
    async setInputs(inputs) {
        if (typeof inputs === "boolean" || inputs.length > 0) {
            if (this.#form_element === null) {
                const {
                    FORM_ELEMENT_EVENT_CHANGE,
                    FORM_ELEMENT_EVENT_INPUT,
                    FormElement
                } = await import("form/src/FormElement.mjs");

                this.#form_element ??= await FormElement.new(
                    null,
                    this.#style_sheet_manager
                );
                this.#form_element.addEventListener(FORM_ELEMENT_EVENT_CHANGE, e => {
                    this.dispatchEvent(new CustomEvent(OVERLAY_ELEMENT_EVENT_INPUT_CHANGE, {
                        detail: e.detail
                    }));
                });
                this.#form_element.addEventListener(FORM_ELEMENT_EVENT_INPUT, e => {
                    this.dispatchEvent(new CustomEvent(OVERLAY_ELEMENT_EVENT_INPUT_INPUT, {
                        detail: e.detail
                    }));
                });
                this.#inputs_element.append(this.#form_element);
            }

            if (typeof inputs === "boolean") {
                await this.#form_element.setDisabled(
                    inputs
                );
            } else {
                await this.#form_element.setInputs(
                    inputs
                );
            }
        } else {
            if (this.#form_element !== null) {
                this.#form_element.remove();
                this.#form_element = null;
            }
        }
    }

    /**
     * @returns {void}
     */
    show() {
        if (this.isConnected) {
            return;
        }

        document.body.append(this);
    }

    /**
     * @param {boolean | null} loading
     * @param {boolean | null} size
     * @returns {Promise<void>}
     */
    async showLoading(loading = null, size = null) {
        if (loading ?? true) {
            if (this.#loading_spinner_element === null) {
                const {
                    LOADING_SPINNER_ELEMENT_VARIABLE_PREFIX,
                    LoadingSpinnerElement
                } = await import("loading-spinner/src/LoadingSpinnerElement.mjs");

                this.#loading_spinner_element ??= await LoadingSpinnerElement.new(
                    this.#style_sheet_manager
                );

                if (size ?? false) {
                    this.#loading_element.style.setProperty(`${LOADING_SPINNER_ELEMENT_VARIABLE_PREFIX}size`, `var(${OVERLAY_ELEMENT_VARIABLE_PREFIX}loading-size)`);
                    this.#loading_element.style.setProperty(`${LOADING_SPINNER_ELEMENT_VARIABLE_PREFIX}width`, `var(${OVERLAY_ELEMENT_VARIABLE_PREFIX}loading-width`);
                }

                this.#loading_element.append(this.#loading_spinner_element);
            }
        } else {
            if (this.#loading_spinner_element !== null) {
                this.#loading_spinner_element.remove();
                this.#loading_spinner_element = null;
            }
        }
    }

    /**
     * @returns {string}
     */
    get title() {
        return this.#title_element.innerText;
    }

    /**
     * @param {string} title
     * @returns {void}
     */
    set title(title) {
        this.#title_element.innerText = title;
    }

    /**
     * @param {boolean | null} report
     * @returns {Promise<boolean>}
     */
    async validateInputs(report = null) {
        return this.#form_element?.validate(
            report
        ) ?? true;
    }

    /**
     * @param {boolean | null} show
     * @param {string[] | boolean | null} validate_inputs
     * @param {boolean | null} remove
     * @returns {Promise<Result>}
     */
    async wait(show = null, validate_inputs = null, remove = null) {
        if (show ?? true) {
            this.show();
        }

        const {
            promise,
            resolve
        } = Promise.withResolvers();

        this.addEventListener(OVERLAY_ELEMENT_EVENT_BUTTON_CLICK, async e => {
            let _validate_inputs;
            if (validate_inputs === null) {
                const {
                    buttons
                } = this;
                _validate_inputs = (buttons.length > 1 ? buttons.splice(1) : buttons).map(button => button.value);
            } else {
                _validate_inputs = validate_inputs;
            }
            if (Array.isArray(_validate_inputs) ? _validate_inputs.includes(e.detail.button) : _validate_inputs) {
                if (!await this.validateInputs()) {
                    resolve(this.wait(
                        show,
                        validate_inputs,
                        remove
                    ));
                    return;
                }
            }

            if (remove ?? true) {
                this.remove();
            }

            resolve(e.detail);
        }, {
            once: true
        });

        return promise;
    }

    /**
     * @returns {HTMLButtonElement[]}
     */
    get #button_elements() {
        return Array.from(this.#buttons_element.querySelectorAll("button"));
    }

    /**
     * @returns {HTMLFormElement}
     */
    get #buttons_element() {
        return this.#shadow.querySelector(".buttons");
    }

    /**
     * @returns {HTMLDivElement}
     */
    get #inputs_element() {
        return this.#shadow.querySelector(".inputs");
    }

    /**
     * @returns {HTMLDivElement}
     */
    get #loading_element() {
        return this.#shadow.querySelector(".loading");
    }

    /**
     * @returns {HTMLDivElement}
     */
    get #message_element() {
        return this.#shadow.querySelector(".message");
    }

    /**
     * @returns {Element[]}
     */
    get #sibling_elements() {
        return Array.from(this.#parent_element.children).sort((element_1, element_2) => {
            const is_overlay_element_1 = element_1 instanceof this.constructor;
            const is_overlay_element_2 = element_2 instanceof this.constructor;

            if (is_overlay_element_1 > is_overlay_element_2) {
                return 1;
            }
            if (is_overlay_element_1 < is_overlay_element_2) {
                return -1;
            }

            const z_index_1 = is_overlay_element_1 ? getComputedStyle(element_1)["z-index"] : "";
            const z_index_2 = is_overlay_element_2 ? getComputedStyle(element_2)["z-index"] : "";

            if (z_index_1 > z_index_2) {
                return 1;
            }
            if (z_index_1 < z_index_2) {
                return -1;
            }

            return 0;
        });
    }

    /**
     * @returns {HTMLDivElement}
     */
    get #title_element() {
        return this.#shadow.querySelector(".title");
    }
}

export const OVERLAY_ELEMENT_TAG_NAME = "overlay";

customElements.define(OVERLAY_ELEMENT_TAG_NAME, OverlayElement);
