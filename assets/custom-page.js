/**
 * @namespace Shopify
 * @property {object} routes
 * @property {string} routes.root
 * @property {object} currency
 * @property {string} currency.active
 */

/**
 * Manages the product grid popup and Add to Cart functionality for the custom page.
 * This class is self-contained and uses modern JavaScript features.
 *
 * @class ProductGrid
 */

/**
 * @typedef {object} ShopifyProductVariant
 * @property {number} id
 * @property {number} product_id
 * @property {string} title
 * @property {number} price
 * @property {boolean} available
 * @property {string} option1
 * @property {string} option2
 * @property {string} option3
 * @property {string[]} options
 * @property {string} featured_image
 */

/**
 * @typedef {object} ProductOption
 * @property {string} name
 * @property {string[]} values
 */

/**
 * @typedef {object} ShopifyProduct
 * @property {ShopifyProductVariant[]} variants
 * @property {boolean} has_only_default_variant
 * @property {ProductOption[]} options_with_values
 * @property {string} title
 * @property {string} description
 * @property {number} price
 * @property {{ alt: string|null }} featured_image
 */
class ProductGrid {
  constructor() {
    this.container = document.querySelector('.product-grid-section');
    if (!this.container) return;

    // Pre-fetched product data from Liquid for performance
    const productDataElement = document.getElementById('GridProductData');
    this.productData = productDataElement ? JSON.parse(productDataElement.textContent) : {};
    this.conditionalProductInfo = document.getElementById('GridConditionalProduct');

    this.popup = this.container.querySelector('#product-popup');
    this.popupBody = this.popup?.querySelector('.product-popup__body');
    this.closeButton = this.popup?.querySelector('.product-popup__close');
    this.popupOverlay = this.popup?.querySelector('.product-popup__overlay');

    if (!this.popup || !this.popupBody || !this.closeButton || !this.popupOverlay) {
      console.error('ProductGrid: One or more essential popup elements are missing.');
      return;
    }

    this.activeTrigger = null; // To store the element that opened the popup for focus return
    this.currencyCode = window.Shopify?.currency?.active || 'USD';

    this.boundTrapFocusKeydown = this.trapFocusKeydownHandler.bind(this);

    this.init();
  }

  /**
   * Initializes all event listeners.
   */
  init() {
    if (!this.container || !this.closeButton || !this.popupOverlay) return;
    // Use event delegation for popup triggers for efficiency
    this.container.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest('.popup-trigger');
      if (trigger instanceof HTMLElement && trigger.dataset.productHandle) {
        this.openPopup(trigger.dataset.productHandle);
      }
    });

    this.closeButton.addEventListener('click', () => this.closePopup());
    this.popupOverlay.addEventListener('click', () => this.closePopup());
    document.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  /**
   * Handles keyboard events for accessibility.
   * @param {KeyboardEvent} event - The keyboard event.
   */
  onKeyDown(event) {
    // Close popup on 'Escape' key press if the popup is open and the event target is not an input field
    if (event.key === 'Escape' && this.popup?.getAttribute('aria-hidden') === 'false') {
      this.closePopup();
    }
  }

  /**
   * Opens the popup and populates it with product data.
   * @param {string} handle - The handle of the product to display.
   */
  openPopup(handle) {
    const product = this.productData[handle];
    if (!product) return;

    // Store the trigger element to return focus to it close
    this.activeTrigger = document.activeElement;

    const variantSelectorHtml = this._buildVariantSelectors(product);

    const popupTitleId = `popup-title-${handle}`;
    const price = new Intl.NumberFormat(document.documentElement.lang, { style: 'currency', currency: this.currencyCode }).format(product.price / 100);

    const popupHtml = `
      <div class="product-popup__media">
        <img src="${product.featured_image}" alt="${product.featured_image?.alt || product.title}" />
      </div>
      <div class="product-popup__content-wrapper">
        <h2 id="${popupTitleId}" class="product-popup__title">${product.title}</h2>
        <p class="product-popup__price">${price}</p>
        <div class="product-popup__description">${product.description}</div>
        <form class="popup-form" data-product-handle="${handle}">
          <input type="hidden" name="id" value="${product.variants[0].id}">
          ${variantSelectorHtml}
          <button type="submit" class="button button--primary">
            <span class="button__text">ADD TO CART</span>
            <div class="loading-overlay__spinner"></div>
          </button>
          <div class="popup-form__error" role="alert" aria-live="polite"></div>
        </form>
      </div>
    `;

    if (this.popupBody) this.popupBody.innerHTML = popupHtml;
    if (this.popup) this.popup.setAttribute('aria-labelledby', popupTitleId);
    if (this.popup) this.popup.classList.add('is-visible');
    if (this.popup) this.popup.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    if (this.popup) this.popup.addEventListener('keydown', this.boundTrapFocusKeydown);

    // Add listener for the newly created form
    const form = this.popup?.querySelector('.popup-form');
    if (form instanceof HTMLFormElement) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        this.addToCart(form);
      });
    }

    const variantSelector = this.popup?.querySelector('.product-variants');
    if (variantSelector) {
      const form = this.popup?.querySelector('.popup-form');
      if (form) {
        form.addEventListener('change', this._onVariantChange.bind(this));
      }
      // Trigger change to set initial state for price and button
      variantSelector.dispatchEvent(new Event('change'));
    } else {
      // For single-variant products, ensure the button state is correct
      const currentForm = this.popup?.querySelector('.popup-form');
      if (currentForm instanceof HTMLFormElement) {
        this.updateButtonState(product.variants[0], currentForm);
      }
    }

    // Trap focus within the popup for accessibility
    const firstFocusable = this.popup?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (firstFocusable instanceof HTMLElement && this.popup) { // Ensure popup exists before focusing
      firstFocusable.focus();
    }
  }

  /**
   * Closes the popup and cleans up.
   */
  closePopup() {
    this.popup?.setAttribute('aria-hidden', 'true');
    this.popup?.classList.remove('is-visible');
    if (this.popup) this.popup.removeAttribute('aria-labelledby');
    if (this.popupBody) this.popupBody.innerHTML = ''; // Clear content to free up memory
    document.body.style.overflow = ''; // Restore scrolling
    // Remove listener to prevent memory leaks
    if (this.popup) this.popup.removeEventListener('keydown', this.boundTrapFocusKeydown);

    // Return focus to the element that opened the popup
    if (this.activeTrigger instanceof HTMLElement) {
      this.activeTrigger.focus();
    }
  }

  /**
   * Handles the keydown event to trap focus within the popup.
   * @param {KeyboardEvent} e The keyboard event.
   */
  trapFocusKeydownHandler(e) {
    if (!this.popup || e.key !== 'Tab' || this.popup.getAttribute('aria-hidden') === 'true') return;

    const focusableElements = Array.from(this.popup.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ));

    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // if shift key is pressed for shift + tab combination
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        if (lastElement instanceof HTMLElement) lastElement.focus();
        e.preventDefault();
      }
    } else if (document.activeElement === lastElement) {
      // if focus is on the last focusable element
      if (firstElement instanceof HTMLElement) firstElement.focus();
      e.preventDefault();
    }
  }

  /**
   * Updates the price and Add to Cart button when a new variant is selected.
   * @param {Event} event The change event from the variant selector.
   */
  _onVariantChange(event) {
    const form = event.currentTarget;
    if (!(form instanceof HTMLFormElement)) return;

    if (!form) return;

    const productHandle = form.dataset.productHandle;
    if (!productHandle) return;

    const product = this.productData[productHandle];
    if (!product) return;

    const formData = new FormData(form);
    const selectedOptions = Array.from(formData.values());

    const selectedVariant = product.variants.find((/** @type {ShopifyProductVariant} */ variant) => {
      return selectedOptions.every((optionValue, index) => {
        return variant.options[index] === optionValue;
      });
    });

    if (!selectedVariant) return;

    // Update price
    this.updatePrice(selectedVariant);

    // Update button state
    this.updateButtonState(selectedVariant, form);

    // Update the hidden variant ID input
    const variantIdInput = form.querySelector('input[name="id"]');
    if (variantIdInput instanceof HTMLInputElement) {
      variantIdInput.value = selectedVariant.id.toString();
    }
  }

  /**
   * Builds HTML for variant selectors based on product options.
   * @param {ShopifyProduct} product - The Shopify product object.
   * @returns {string} The generated HTML for variant selectors.
   */
  _buildVariantSelectors(product) {
    if (!product.options_with_values || product.has_only_default_variant) {
      return '';
    }

    let html = '';
    product.options_with_values.forEach((option) => {
      html += `<div class="product-variants">`;

      // Render as a dropdown
      if (option.name.toLowerCase().includes('size')) {
        html += `<label for="option-${option.name}">Choose your size</label><select id="option-${option.name}" name="${option.name}">`;
        option.values.forEach((value) => {
          html += `<option value="${value}">${value}</option>`;
        });
        html += `</select>`;
      } else { // Render as radio buttons for color
        html += `<label for="option-${option.name}">${option.name}</label>`;
        html += `<fieldset class="variant-radios">`;
        option.values.forEach((value, index) => {
          const checked = index === 0 ? 'checked' : '';
          html += `<div><label for="option-${option.name}-${value}"><input type="radio" id="option-${option.name}-${value}" name="${option.name}" value="${value}" ${checked}><span>${value}</span></label></div>`;
        });
        html += `</fieldset>`;
      }
      html += `</div>`;
    });

    return html;
  }

  /**
   * Updates the price in the popup.
   * @param {ShopifyProductVariant} variant - The selected variant object.
   */
  updatePrice(variant) {
    const priceElement = this.popup?.querySelector('.product-popup__price');
    if (!priceElement || !variant || typeof variant.price === 'undefined') return;
    priceElement.textContent = new Intl.NumberFormat(document.documentElement.lang, {
      style: 'currency',
      currency: this.currencyCode
    }).format(variant.price / 100);
  }

  /**
   * Updates the Add to Cart button's state (enabled/disabled, text).
   * @param {ShopifyProductVariant} variant - The selected variant object.
   * @param {HTMLFormElement} form - The form containing the button.
   */
  updateButtonState(variant, form) {
    const submitButton = form?.querySelector('button[type="submit"]');
    if (!(submitButton instanceof HTMLButtonElement)) return;

    const buttonText = submitButton.querySelector('.button__text');
    if (variant.available) {
      submitButton.disabled = false;
      if (buttonText) buttonText.textContent = 'ADD TO CART';
    } else {
      submitButton.disabled = true;
      if (buttonText) buttonText.textContent = 'Sold Out';
    }
  }

  /**
   * Handles adding items to the cart via the Cart API.
   * @param {HTMLFormElement} form - The form element containing the product variant ID.
   */
  async addToCart(form) {
    const submitButton = form.querySelector('button[type="submit"]');
    const errorContainer = form.querySelector('.popup-form__error');
    if (!(submitButton instanceof HTMLButtonElement) || !errorContainer) return;

    errorContainer.textContent = ''; // Clear previous errors
    this.setLoading(submitButton, true);

    const formData = new FormData(form);
    const variantIdString = formData.get('id');

    if (typeof variantIdString !== 'string' || !variantIdString) {
      errorContainer.textContent = 'Please select a variant.';
      this.setLoading(submitButton, false);
      return;
    }

    const items = [{
      id: variantIdString,
      quantity: 1
    }];

    // --- Special Conditional Logic as per test requirements ---
    const selectedVariantId = parseInt(variantIdString, 10);
    const productHandle = form.dataset.productHandle;
    const product = productHandle ? this.productData[productHandle] : null;

    if (product) {
      const selectedVariant = product.variants.find((/** @type {ShopifyProductVariant} */ v) => v.id === selectedVariantId);
      if (!selectedVariant) {
        // This case is unlikely if data is consistent, but it's a good safeguard.
        errorContainer.textContent = 'Selected variant could not be found.';
        this.setLoading(submitButton, false);
        return;
      }

      const variantOptions = [selectedVariant.option1, selectedVariant.option2, selectedVariant.option3].filter(Boolean);
      const hasBlack = variantOptions.some(opt => opt?.toLowerCase() === 'black');
      const hasMedium = variantOptions.some(opt => opt?.toLowerCase() === 'medium');

      if (hasBlack && hasMedium) {
        const conditionalVariantId = this.conditionalProductInfo?.dataset.variantId;
        if (conditionalVariantId) {
          items.push({
            id: conditionalVariantId,
            quantity: 1
          });
        }
      }
    }
    // --- End Special Logic ---

    try {
      const response = await fetch(`${window.Shopify?.routes?.root || '/'}cart/add.js`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.description || `HTTP error! status: ${response.status}`);
      }

      // --- Success State ---
      this.setLoading(submitButton, false); // Stop spinner
      submitButton.classList.add('is-added');
      const buttonText = submitButton.querySelector('.button__text');
      if (buttonText) buttonText.textContent = 'Added!';

      document.dispatchEvent(new CustomEvent('cart:updated', { bubbles: true }));

      // Close the popup after a short delay to show the success state
      setTimeout(() => this.closePopup(), 1200);

    } catch (error) {
      console.error('Error adding to cart:', error.message);
      errorContainer.textContent = error.message;
    } finally {
      this.setLoading(submitButton, false);
    }
  }

  /**
   * Sets the loading state on a button.
   * @param {HTMLButtonElement} button - The button to update.
   * @param {boolean} isLoading - Whether to show the loading state.
   */
  setLoading(button, isLoading) {
    if (isLoading) {
      button.disabled = true;
      button.classList.add('loading');
    } else {
      button.disabled = false;
      button.classList.remove('loading');
    }
  }
}

// Initialize the script once the DOM is ready.
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ProductGrid());
} else {
  new ProductGrid();
}