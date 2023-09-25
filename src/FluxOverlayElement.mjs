import { flux_import_css } from "../../flux-style-sheet-manager/src/FluxImportCss.mjs";

/** @typedef {import("./Button.mjs").Button} Button */
/** @typedef {import("../../flux-form/src/FluxFormElement.mjs").FluxFormElement} FluxFormElement */
/** @typedef {import("../../flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs").FluxLoadingSpinnerElement} FluxLoadingSpinnerElement */
/** @typedef {import("../../flux-form/src/Input.mjs").Input} Input */
/** @typedef {import("../../flux-form/src/InputValue.mjs").InputValue} InputValue */
/** @typedef {import("./Result.mjs").Result} Result */
/** @typedef {import("./StyleSheetManager/StyleSheetManager.mjs").StyleSheetManager} StyleSheetManager */
/** @typedef {import("../../flux-form/src/validateValue.mjs").validateValue} validateValue */

const root_css = await flux_import_css.import(
    `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/FluxOverlayElementRoot.css`
);

const css = await flux_import_css.import(
    `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/FluxOverlayElement.css`
);

export const FLUX_OVERLAY_ELEMENT_EVENT_BUTTON_CLICK = "flux-overlay-button-click";

export const FLUX_OVERLAY_ELEMENT_EVENT_INPUT_CHANGE = "flux-overlay-input-change";

export const FLUX_OVERLAY_ELEMENT_EVENT_INPUT_INPUT = "flux-overlay-input-input";

export const FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX = "--flux-overlay-";

export class FluxOverlayElement extends HTMLElement {
    /**
     * @type {FluxFormElement | null}
     */
    #flux_form_element = null;
    /**
     * @type {FluxLoadingSpinnerElement | null}
     */
    #flux_loading_spinner_element = null;
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
     * @returns {Promise<FluxOverlayElement>}
     */
    static async loading(style_sheet_manager = null) {
        const flux_overlay_element = await this.new(
            null,
            null,
            null,
            style_sheet_manager
        );

        flux_overlay_element.style.setProperty(`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}container-background-color`, "transparent");
        flux_overlay_element.style.setProperty(`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}container-border-color`, "transparent");

        await flux_overlay_element.showLoading(
            null,
            true
        );

        flux_overlay_element.show();

        return flux_overlay_element;
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
        const flux_overlay_element = await this.new(
            title,
            message,
            buttons,
            style_sheet_manager
        );

        await flux_overlay_element.setInputs(
            inputs ?? []
        );

        return flux_overlay_element.wait();
    }

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {Button[] | null} buttons
     * @param {StyleSheetManager | null} style_sheet_manager
     * @returns {Promise<FluxOverlayElement>}
     */
    static async new(title = null, message = null, buttons = null, style_sheet_manager = null) {
        if (style_sheet_manager !== null) {
            await style_sheet_manager.generateVariablesRootStyleSheet(
                this.name,
                {
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}active-button-background-color`]: "foreground-color",
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}active-button-foreground-color`]: "background-color",
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}button-background-color`]: "accent-color",
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}button-focus-outline-color`]: "foreground-color",
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}button-foreground-color`]: "accent-color-foreground-color",
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}container-background-color`]: "background-color",
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}container-border-color`]: "foreground-color",
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}container-foreground-color`]: "foreground-color",
                    [`${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}loading-color`]: "accent-color"
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

        const flux_overlay_element = new this(
            style_sheet_manager
        );

        flux_overlay_element.#shadow = flux_overlay_element.attachShadow({
            mode: "closed"
        });

        await flux_overlay_element.#style_sheet_manager?.addStyleSheetsToShadow(
            flux_overlay_element.#shadow
        );

        flux_overlay_element.#shadow.adoptedStyleSheets.push(css);

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

        flux_overlay_element.#shadow.append(container_element);

        flux_overlay_element.title = title ?? "";
        flux_overlay_element.message = message ?? "";
        flux_overlay_element.buttons = buttons ?? [];

        return flux_overlay_element;
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
        this.tabIndex = "-1";
        this.focus();
        this.removeAttribute("tabIndex");
    }

    /**
     * @param {string} type
     * @param {validateValue} validate_value
     * @returns {Promise<void>}
     */
    async addAdditionalInputValidationType(type, validate_value) {
        await this.#flux_form_element?.addAdditionalValidationType(
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

        if (buttons.length === 2) {
            this.#buttons_element.dataset.confirm = true;
        } else {
            delete this.#buttons_element.dataset.confirm;
        }

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
                this.dispatchEvent(new CustomEvent(FLUX_OVERLAY_ELEMENT_EVENT_BUTTON_CLICK, {
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
     * @returns {string}
     */
    get htmlTitle() {
        return super.title;
    }

    /**
     * @param {string} title
     * @returns {void}
     */
    set htmlTitle(title) {
        super.title = title;
    }

    /**
     * @returns {InputValue[]}
     */
    get input_values() {
        return this.#flux_form_element?.values ?? [];
    }

    /**
     * @returns {Input[]}
     */
    get inputs() {
        return this.#flux_form_element?.inputs ?? [];
    }

    /**
     * @returns {boolean}
     */
    get loading() {
        return this.#flux_loading_spinner_element !== null;
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
            if (this.#flux_form_element === null) {
                const {
                    FLUX_FORM_ELEMENT_EVENT_CHANGE,
                    FLUX_FORM_ELEMENT_EVENT_INPUT,
                    FluxFormElement
                } = await import("../../flux-form/src/FluxFormElement.mjs");

                this.#flux_form_element ??= await FluxFormElement.new(
                    null,
                    this.#style_sheet_manager
                );
                this.#flux_form_element.addEventListener(FLUX_FORM_ELEMENT_EVENT_CHANGE, e => {
                    this.dispatchEvent(new CustomEvent(FLUX_OVERLAY_ELEMENT_EVENT_INPUT_CHANGE, {
                        detail: e.detail
                    }));
                });
                this.#flux_form_element.addEventListener(FLUX_FORM_ELEMENT_EVENT_INPUT, e => {
                    this.dispatchEvent(new CustomEvent(FLUX_OVERLAY_ELEMENT_EVENT_INPUT_INPUT, {
                        detail: e.detail
                    }));
                });
                this.#inputs_element.append(this.#flux_form_element);
            }

            if (typeof inputs === "boolean") {
                await this.#flux_form_element.setDisabled(
                    inputs
                );
            } else {
                await this.#flux_form_element.setInputs(
                    inputs
                );
            }
        } else {
            if (this.#flux_form_element !== null) {
                this.#flux_form_element.remove();
                this.#flux_form_element = null;
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
            if (this.#flux_loading_spinner_element === null) {
                const {
                    FLUX_LOADING_SPINNER_ELEMENT_VARIABLE_PREFIX,
                    FluxLoadingSpinnerElement
                } = await import("../../flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs");

                this.#flux_loading_spinner_element ??= await FluxLoadingSpinnerElement.new(
                    this.#style_sheet_manager
                );

                if (size ?? false) {
                    this.#loading_element.style.setProperty(`${FLUX_LOADING_SPINNER_ELEMENT_VARIABLE_PREFIX}size`, `var(${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}loading-size)`);
                    this.#loading_element.style.setProperty(`${FLUX_LOADING_SPINNER_ELEMENT_VARIABLE_PREFIX}width`, `var(${FLUX_OVERLAY_ELEMENT_VARIABLE_PREFIX}loading-width`);
                }

                this.#loading_element.append(this.#flux_loading_spinner_element);
            }
        } else {
            if (this.#flux_loading_spinner_element !== null) {
                this.#flux_loading_spinner_element.remove();
                this.#flux_loading_spinner_element = null;
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
        return this.#flux_form_element?.validate(
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

        let resolve_promise;

        const promise = new Promise(resolve => {
            resolve_promise = resolve;
        });

        this.addEventListener(FLUX_OVERLAY_ELEMENT_EVENT_BUTTON_CLICK, async e => {
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
                    resolve_promise(this.wait(
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

            resolve_promise(e.detail);
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
     * @returns {HTMLDivElement}
     */
    get #title_element() {
        return this.#shadow.querySelector(".title");
    }
}

export const FLUX_OVERLAY_ELEMENT_TAG_NAME = "flux-overlay";

customElements.define(FLUX_OVERLAY_ELEMENT_TAG_NAME, FluxOverlayElement);
