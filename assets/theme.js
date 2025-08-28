document.addEventListener('DOMContentLoaded', function() {
    // Initialize the banner section
    const bannerButton = document.querySelector('.banner-button');
    if (bannerButton) {
        bannerButton.addEventListener('click', function() {
            // Handle button click for the banner section
            console.log('Banner button clicked');
        });
    }

    // Initialize product modal functionality
    const productCards = document.querySelectorAll('.product-card');
    const modal = document.querySelector('.product-modal');
    const modalCloseButton = modal.querySelector('.modal-close');

    productCards.forEach(card => {
        card.addEventListener('click', function() {
            const productId = this.dataset.productId;
            // Fetch product details and populate modal
            fetch(`/products/${productId}.js`)
                .then(response => response.json())
                .then(product => {
                    modal.querySelector('.modal-title').textContent = product.title;
                    modal.querySelector('.modal-image').src = product.images[0];
                    modal.querySelector('.modal-description').textContent = product.body_html;
                    modal.querySelector('.modal-price').textContent = Shopify.formatMoney(product.price);
                    modal.classList.add('is-active');
                });
        });
    });

    modalCloseButton.addEventListener('click', function() {
        modal.classList.remove('is-active');
    });

    // Close modal on outside click
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            modal.classList.remove('is-active');
        }
    });
});