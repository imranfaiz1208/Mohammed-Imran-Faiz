/**
 * Manages the product grid popup and Add to Cart functionality.
 */
class ProductGrid {
  constructor() {
    this.grid = document.querySelector('.product-grid-section');
    if (!this.grid) return;

    // Pre-fetched product data from Liquid
    this.productData = JSON.parse(document.getElementById('GridProductData').textContent);
    this.conditionalProductInfo = document.getElementById('GridConditionalProduct');

    this.popup = this.grid.querySelector('#product-popup');
    this.popupBody = this.popup.querySelector('.popup-body');
    this.closeButton = this.popup.querySelector('.popup-close');

    this.init();
  }

  init() {
    // Use event delegation for popup triggers
    this.grid.addEventListener('click', (event) => {
      const trigger = event.target.closest('.popup-trigger');
      if (trigger) {
        const productHandle = trigger.dataset.productHandle;
        this.openPopup(productHandle);
      }
    });

    this.closeButton.addEventListener('click', () => this.closePopup());
  }

  openPopup(handle) {
    const product = this.productData[handle];
    if (!product) return;

    // Build the popup's inner HTML dynamically
    let variantsHtml = '';
    // Logic to create variant selectors (e.g., color swatches, size buttons)
    // This part can be complex depending on the desired UI.
    // For simplicity, a dropdown example:
    if (product.variants.length > 1) {
      variantsHtml = `<select name="id" class="product-variants">`;
      product.variants.forEach(variant => {
        variantsHtml += `<option value="${variant.id}">${variant.title}</option>`;
      });
      variantsHtml += `</select>`;
    } else {
      variantsHtml = `<input type="hidden" name="id" value="${product.variants[0].id}">`;
    }

    const popupHtml = `
      <img src="${product.featured_image}" alt="${product.title}" />
      <h2>${product.title}</h2>
      <p>${(product.price / 100).toFixed(2)}</p>
      <div>${product.description}</div>
      <form class="popup-form">
        ${variantsHtml}
        <button type="submit" class="button button--primary">Add to Cart</button>
      </form>
    `;

    this.popupBody.innerHTML = popupHtml;
    this.popup.style.display = 'block';
    this.popup.removeAttribute('aria-hidden');

    // Add listener for the new form
    this.popup.querySelector('.popup-form').addEventListener('submit', (event) => {
      event.preventDefault();
      this.addToCart(event.currentTarget);
    });
  }

  closePopup() {
    this.popup.style.display = 'none';
    this.popup.setAttribute('aria-hidden', 'true');
    this.popupBody.innerHTML = ''; // Clear content
  }

  async addToCart(form) {
    const formData = new FormData(form);
    const items = [{
      id: formData.get('id'),
      quantity: 1
    }];

    // --- Special Conditional Logic ---
    const selectedVariantId = formData.get('id');
    const product = Object.values(this.productData).find(p => p.variants.some(v => v.id == selectedVariantId));
    const selectedVariant = product.variants.find(v => v.id == selectedVariantId);

    // Check if the added variant has options 'Black' and 'Medium'
    const hasBlack = selectedVariant.options.some(opt => opt.toLowerCase() === 'black');
    const hasMedium = selectedVariant.options.some(opt => opt.toLowerCase() === 'medium');

    if (hasBlack && hasMedium) {
      const conditionalVariantId = this.conditionalProductInfo.dataset.variantId;
      if (conditionalVariantId) {
        items.push({
          id: conditionalVariantId,
          quantity: 1
        });
      }
    }
    // --- End Special Logic ---

    try {
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ items })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Optional: give user feedback, update cart icon, etc.
      console.log('Product(s) added to cart');
      this.closePopup();
      // You might want to dispatch an event to update the theme's cart drawer/count
      document.dispatchEvent(new CustomEvent('cart:updated'));

    } catch (error) {
      console.error('Error adding to cart:', error);
      // Optional: show an error message to the user
    }
  }
}

// Initialize the script once the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new ProductGrid();
});
