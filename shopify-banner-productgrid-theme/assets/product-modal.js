document.addEventListener("DOMContentLoaded", function () {
  const popup = document.getElementById("product-popup");
  const closeBtn = document.querySelector(".close-btn");
  const variantSelect = document.getElementById("variant-select");
  const addToCartBtn = document.getElementById("add-to-cart-btn");

  // Open modal on product card click
  document.querySelectorAll(".popup-trigger").forEach((button) => {
    button.addEventListener("click", () => {
      const handle = button.dataset.handle;
      const product = window.productData[handle];

      document.getElementById("popup-title").textContent = product.title;
      document.getElementById("popup-price").textContent = product.price;
      document.getElementById("popup-description").textContent = product.description;

      variantSelect.innerHTML = "";
      product.variants.forEach((variant) => {
        const option = document.createElement("option");
        option.value = variant.id;
        option.textContent = `${variant.title} - ${variant.price}`;
        option.dataset.option1 = variant.option1;
        option.dataset.option2 = variant.option2;
        variantSelect.appendChild(option);
      });

      popup.classList.remove("hidden");
    });
  });

  // Close modal
  closeBtn.addEventListener("click", () => {
    popup.classList.add("hidden");
  });

  // Add to Cart with auto-add logic
  addToCartBtn.addEventListener("click", () => {
    const selectedOption = variantSelect.options[variantSelect.selectedIndex];
    const variantId = variantSelect.value;
    const option1 = selectedOption.dataset.option1;
    const option2 = selectedOption.dataset.option2;

    // Add main product
    fetch("/cart/add.js", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: variantId, quantity: 1 }),
    }).then(() => {
      // Auto-add "Soft Winter Jacket" if Black/Medium
      if (option1 === "Black" && option2 === "Medium") {
        // Find Soft Winter Jacket variant (replace handle as needed)
        const softJacket = Object.values(window.productData).find((p) =>
          p.title.toLowerCase().includes("soft winter jacket")
        );
        if (softJacket) {
          // Find default variant (or customize logic)
          const softVariantId = softJacket.variants[0].id;
          fetch("/cart/add.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: softVariantId, quantity: 1 }),
          });
        }
      }
      alert("Added to cart!");
      popup.classList.add("hidden");
    });
  });

  // Optional: Close modal on outside click
  window.addEventListener("click", function (e) {
    if (e.target === popup) popup.classList.add("hidden");
  });
});