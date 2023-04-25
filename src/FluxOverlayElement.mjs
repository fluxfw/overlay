import { flux_css_api } from "../../flux-css-api/src/FluxCssApi.mjs";

/** @typedef {import("./Button.mjs").Button} Button */
/** @typedef {import("./Input.mjs").Input} Input */
/** @typedef {import("./Result.mjs").Result} Result */

flux_css_api.adopt(
    document,
    await flux_css_api.import(
        `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/FluxOverlayElementVariables.css`
    ),
    true
);

const css = await flux_css_api.import(
    `${import.meta.url.substring(0, import.meta.url.lastIndexOf("/"))}/FluxOverlayElement.css`
);

export const FLUX_OVERLAY_BUTTON_CLICK_EVENT = "flux-overlay-button-click";
export const FLUX_OVERLAY_INPUT_CHANGE_EVENT = "flux-overlay-input-change";
export const FLUX_OVERLAY_INPUT_INPUT_EVENT = "flux-overlay-input-input";

export class FluxOverlayElement extends HTMLElement {
    /**
     * @type {ShadowRoot}
     */
    #shadow;

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {string} ok_button_label
     * @returns {Promise<void>}
     */
    static async alert(title, message, ok_button_label) {
        await this.wait(
            title,
            message,
            null,
            [
                {
                    label: ok_button_label,
                    value: "ok"
                }
            ]
        );
    }

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {string} no_button_label
     * @param {string} yes_button_label
     * @returns {Promise<boolean>}
     */
    static async confirm(title, message, no_button_label, yes_button_label) {
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
            ]
        )).button === "yes";
    }

    /**
     * @returns {Promise<FluxOverlayElement>}
     */
    static async loading() {
        const flux_overlay_element = this.new();

        flux_overlay_element.style.setProperty("--flux-loading-spinner-size", "100px");
        flux_overlay_element.style.setProperty("--flux-loading-spinner-width", "2px");
        flux_overlay_element.style.setProperty("--flux-overlay-container-background-color", "transparent");
        flux_overlay_element.style.setProperty("--flux-overlay-container-border-color", "transparent");

        await flux_overlay_element.showLoading();

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
     * @returns {Promise<string | null>}
     */
    static async prompt(title, message, input_placeholder, input_value, cancel_button_label, ok_button_label) {
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
            ]
        );

        if (result.button !== "ok") {
            return null;
        }

        return result.inputs.input;
    }

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {Input[] | null} inputs
     * @param {Button[] | null} buttons
     * @returns {Promise<Result>}
     */
    static async wait(title = null, message = null, inputs = null, buttons = null) {
        return this.new(
            title,
            message,
            inputs,
            buttons
        )
            .wait();
    }

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {Input[] | null} inputs
     * @param {Button[] | null} buttons
     * @returns {FluxOverlayElement}
     */
    static new(title = null, message = null, inputs = null, buttons = null) {
        return new this(
            title ?? "",
            message ?? "",
            inputs ?? [],
            buttons ?? []
        );
    }

    /**
     * @param {string} title
     * @param {string} message
     * @param {Input[]} inputs
     * @param {Button[]} buttons
     * @private
     */
    constructor(title, message, inputs, buttons) {
        super();

        this.#shadow = this.attachShadow({
            mode: "closed"
        });

        flux_css_api.adopt(
            this.#shadow,
            css
        );

        const container_element = document.createElement("div");
        container_element.classList.add("container");

        const title_element = document.createElement("div");
        title_element.classList.add("title");
        container_element.appendChild(title_element);

        const message_element = document.createElement("div");
        message_element.classList.add("message");
        container_element.appendChild(message_element);

        const inputs_element = document.createElement("form");
        inputs_element.classList.add("inputs");
        inputs_element.addEventListener("submit", e => {
            e.preventDefault();
        });
        container_element.appendChild(inputs_element);

        const loading_element = document.createElement("div");
        loading_element.classList.add("loading");
        container_element.appendChild(loading_element);

        const buttons_element = document.createElement("div");
        buttons_element.classList.add("buttons");
        container_element.appendChild(buttons_element);

        this.#shadow.appendChild(container_element);

        this.title = title;
        this.message = message;
        this.inputs = inputs;
        this.buttons = buttons;
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
                this.dispatchEvent(new CustomEvent(FLUX_OVERLAY_BUTTON_CLICK_EVENT, {
                    detail: {
                        button: button_element.value,
                        inputs: Object.fromEntries(this.inputs.map(input => [
                            input.name,
                            input.value
                        ]))
                    }
                }));
            });

            this.#buttons_element.appendChild(button_element);
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
     * @returns {Input[]}
     */
    get inputs() {
        return this.#input_elements.filter(input_element => input_element.name !== "").map(input_element => ({
            disabled: input_element.disabled,
            "input-mode": input_element.inputMode ?? "",
            label: input_element.previousElementSibling.innerText,
            max: input_element.max ?? "",
            "max-length": input_element.maxLength ?? -1,
            min: input_element.min ?? "",
            "min-length": input_element.minLength ?? -1,
            multiple: input_element.multiple ?? false,
            name: input_element.name,
            options: Array.from(input_element.querySelectorAll("option")).map(option_element => ({
                disabled: option_element.disabled,
                label: option_element.label,
                selected: option_element.selected,
                title: option_element.title,
                value: option_element.value
            })),
            pattern: input_element.pattern ?? "",
            placeholder: input_element.placeholder ?? "",
            "read-only": input_element.readOnly ?? false,
            required: input_element.required,
            step: input_element.step ?? "",
            title: input_element.title,
            type: input_element instanceof HTMLSelectElement ? "select" : input_element.type,
            value: this.#valueFromInputElement(
                input_element
            )
        }));
    }

    /**
     * @param {Input[] | boolean} inputs
     * @returns {void}
     */
    set inputs(inputs) {
        if (typeof inputs === "boolean") {
            for (const input_element of this.#input_elements) {
                input_element.disabled = inputs;
            }
            return;
        }

        this.#input_elements.forEach(input_element => {
            input_element.parentElement.remove();
        });

        for (const input of inputs) {
            const container_element = document.createElement("label");

            const label_element = document.createElement("div");
            label_element.classList.add("label");
            label_element.innerText = input.label ?? "";
            container_element.appendChild(label_element);

            const type = input.type ?? "text";

            const input_element = document.createElement(type === "select" || type === "textarea" ? type : "input");

            input_element.disabled = input.disabled ?? false;

            const input_mode = input["input-mode"] ?? "";
            if (input_mode !== "" && "inputMode" in input_element) {
                input_element.inputMode = input_mode;
            }

            const max = input.max ?? "";
            if (max !== "" && "max" in input_element) {
                input_element.max = max;
            }

            const max_length = input["max-length"] ?? -1;
            if (max_length !== -1 && "maxLength" in input_element) {
                input_element.maxLength = max_length;
            }

            const min = input.min ?? "";
            if (min !== "" && "min" in input_element) {
                input_element.min = min;
            }

            const min_length = input["min-length"] ?? -1;
            if (min_length !== -1 && "minLength" in input_element) {
                input_element.minLength = min_length;
            }

            if ("multiple" in input_element) {
                input_element.multiple = input.multiple ?? false;
            }

            const name = input.name ?? "";
            if (name !== "") {
                input_element.name = name;
            }

            if (type === "select") {
                const options = input.options ?? [];

                for (const option of options) {
                    const option_element = document.createElement("option");

                    option_element.disabled = option.disabled ?? false;

                    option_element.label = option.label;

                    option_element.selected = option.selected ?? false;

                    const title = option.title ?? "";
                    if (title !== "") {
                        option_element.title = title;
                    }

                    option_element.value = option.value;

                    input_element.appendChild(option_element);
                }

                if (input_element.multiple) {
                    input_element.size = options.length;
                }
            }

            const pattern = input.pattern ?? "";
            if (pattern !== "" && "pattern" in input_element) {
                input_element.pattern = pattern;
            }

            const placeholder = input.placeholder ?? "";
            if (placeholder !== "" && "placeholder" in input_element) {
                input_element.placeholder = placeholder;
            }

            if ("readOnly" in input_element) {
                input_element.readOnly = input["read-only"] ?? false;
            }

            input_element.required = input.required ?? false;

            const step = input.step ?? "";
            if (step !== "" && "step" in input_element) {
                input_element.step = step;
            }

            const title = input.title ?? "";
            if (title !== "") {
                input_element.title = title;
            }

            if (input_element instanceof HTMLInputElement) {
                input_element.type = type;
            }

            if (type === "number") {
                const value = input.value ?? null;
                if (value !== null) {
                    input_element.valueAsNumber = value;
                }
            } else {
                if (type === "checkbox") {
                    const value = input.value ?? null;
                    if (value !== null) {
                        input_element.checked = value;
                    }
                } else {
                    const value = input.value ?? "";
                    if (value !== "") {
                        input_element.value = value;
                    }
                }
            }

            input_element.addEventListener("change", () => {
                this.dispatchEvent(new CustomEvent(FLUX_OVERLAY_INPUT_CHANGE_EVENT, {
                    detail: {
                        name: input_element.name,
                        value: this.#valueFromInputElement(
                            input_element
                        )
                    }
                }));
            });

            input_element.addEventListener("input", () => {
                this.dispatchEvent(new CustomEvent(FLUX_OVERLAY_INPUT_INPUT_EVENT, {
                    detail: {
                        name: input_element.name,
                        value: this.#valueFromInputElement(
                            input_element
                        )
                    }
                }));
            });

            container_element.appendChild(input_element);

            this.#inputs_element.appendChild(container_element);
        }
    }

    /**
     * @returns {boolean}
     */
    get loading() {
        return this.#loading_element.children.length > 0;
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
     * @returns {void}
     */
    show() {
        if (this.isConnected) {
            return;
        }

        document.body.appendChild(this);
    }

    /**
     * @param {boolean | null} loading
     * @returns {Promise<void>}
     */
    async showLoading(loading = null) {
        const {
            FLUX_LOADING_SPINNER_ELEMENT_TAG_NAME,
            FluxLoadingSpinnerElement
        } = await import("../../flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs");

        Array.from(this.#loading_element.querySelectorAll(FLUX_LOADING_SPINNER_ELEMENT_TAG_NAME)).forEach(flux_loading_spinner_element => {
            flux_loading_spinner_element.remove();
        });

        if (!(loading ?? true)) {
            return;
        }

        this.#loading_element.appendChild(FluxLoadingSpinnerElement.new());
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
     * @returns {boolean}
     */
    validateInputs(report = null) {
        if (!this.#inputs_element.checkValidity()) {
            if (report ?? true) {
                this.#inputs_element.reportValidity();
            }

            return false;
        }

        return true;
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

        this.addEventListener(FLUX_OVERLAY_BUTTON_CLICK_EVENT, e => {
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
                if (!this.validateInputs()) {
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
     * @returns {(HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement)[]}
     */
    get #input_elements() {
        return Array.from(this.#inputs_element.elements);
    }

    /**
     * @returns {HTMLFormElement}
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

    /**
     * @param {HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement} input_element
     * @returns {string | number | boolean | null}
     */
    #valueFromInputElement(input_element) {
        return input_element.type === "number" ? !Number.isNaN(input_element.valueAsNumber) ? input_element.valueAsNumber : null : input_element.type === "checkbox" ? input_element.checked : input_element.value;
    }
}

export const FLUX_OVERLAY_ELEMENT_TAG_NAME = "flux-overlay";

customElements.define(FLUX_OVERLAY_ELEMENT_TAG_NAME, FluxOverlayElement);
