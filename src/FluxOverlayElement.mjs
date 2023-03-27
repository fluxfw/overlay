import { flux_css_api } from "../../flux-css-api/src/FluxCssApi.mjs";

/** @typedef {import("./Button.mjs").Button} Button */

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

export class FluxOverlayElement extends HTMLElement {
    /**
     * @type {ShadowRoot}
     */
    #shadow;

    /**
     * @param {string | null} title
     * @param {string | null} message
     * @param {Button[] | null} buttons
     * @param {boolean | null} loading
     * @returns {FluxOverlayElement}
     */
    static new(title = null, message = null, buttons = null, loading = null) {
        return new this(
            title ?? "",
            message ?? "",
            buttons ?? [],
            loading ?? false
        );
    }

    /**
     * @param {string} title
     * @param {string} message
     * @param {Button[]} buttons
     * @param {boolean} loading
     * @private
     */
    constructor(title, message, buttons, loading) {
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

        const loading_element = document.createElement("div");
        loading_element.classList.add("loading");
        container_element.appendChild(loading_element);

        const buttons_element = document.createElement("div");
        buttons_element.classList.add("buttons");
        container_element.appendChild(buttons_element);

        this.#shadow.appendChild(container_element);

        this.title = title;
        this.message = message;
        this.buttons = buttons;
        this.loading = loading;
    }

    /**
     * @returns {Button[]}
     */
    get buttons() {
        return Array.from(this.#shadow.querySelectorAll(".buttons button")).map(button_element => ({
            disabled: button_element.disabled,
            label: button_element.innerText,
            title: button_element.title,
            value: button_element.value
        }));
    }

    /**
     * @param {Button[]} buttons
     * @returns {void}
     */
    set buttons(buttons) {
        const buttons_element = this.#shadow.querySelector(".buttons");

        Array.from(buttons_element.querySelectorAll("button")).forEach(button_element => {
            button_element.remove();
        });

        for (const button of buttons) {
            const button_element = document.createElement("button");

            button_element.disabled = button.disabled ?? false;
            button_element.innerText = button.label;
            button_element.title = button.title ?? "";
            button_element.type = "button";
            button_element.value = button.value ?? button.label;

            button_element.addEventListener("click", () => {
                this.dispatchEvent(new CustomEvent(FLUX_OVERLAY_BUTTON_CLICK_EVENT, {
                    detail: {
                        value: button_element.value
                    }
                }));
            });

            buttons_element.appendChild(button_element);
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
     * @returns {boolean}
     */
    get loading() {
        return this.#shadow.querySelector(".loading").children.length > 0;
    }

    /**
     * @param {boolean} loading
     * @returns {void}
     */
    set loading(loading) {
        const loading_element = this.#shadow.querySelector(".loading");

        Array.from(loading_element.children).forEach(flux_loading_spinner_element => {
            flux_loading_spinner_element.parentElement.remove();
        });

        if (loading) {
            import("../../flux-loading-spinner/src/FluxLoadingSpinnerElement.mjs").then(({
                FluxLoadingSpinnerElement
            }) => {
                loading_element.appendChild(FluxLoadingSpinnerElement.new());
            }).catch(console.error);
        }
    }

    /**
     * @returns {string}
     */
    get message() {
        return this.#shadow.querySelector(".message").innerText;
    }

    /**
     * @param {string} message
     * @returns {void}
     */
    set message(message) {
        this.#shadow.querySelector(".message").innerText = message;
    }

    /**
     * @returns {string}
     */
    get title() {
        return this.#shadow.querySelector(".title").innerText;
    }

    /**
     * @param {string} title
     * @returns {void}
     */
    set title(title) {
        this.#shadow.querySelector(".title").innerText = title;
    }
}

export const FLUX_OVERLAY_ELEMENT_TAG_NAME = "flux-overlay";

customElements.define(FLUX_OVERLAY_ELEMENT_TAG_NAME, FluxOverlayElement);
