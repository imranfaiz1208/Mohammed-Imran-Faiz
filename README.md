# Ecomexperts Shopify Developer Hiring Test

This repository contains the solution for the Ecomexperts Shopify Developer Hiring Test. The project involves creating a custom Shopify page from scratch, featuring two distinct sections: a dynamic banner and an interactive product grid.

## Project Overview

The goal of this test is to demonstrate proficiency in Shopify theme development by building a custom page that matches a provided Figma design. The implementation focuses on creating reusable sections, writing clean and efficient Liquid code, and using modern vanilla JavaScript for all interactive elements.

## Features Implemented

### 1. Custom Banner Section (`custom-banner.liquid`)
- A full-width hero banner with a centered layout.
- **Editable Content:** The main heading and subheading are fully editable through the Shopify Theme Customizer.
- **Animated Buttons:** Two call-to-action buttons with CSS hover animations for a polished user experience.
- **Responsive Design:** The layout is fully responsive and adapts seamlessly to mobile and desktop views.

### 2. Custom Product Grid Section (`custom-grid.liquid`)
- A grid displaying up to six products.
- **Customizable Products:** Products can be easily selected from the Shopify Theme Customizer.
- **Interactive Popup Trigger:** Each product card features a `+` button that opens a detailed product modal.
- **Pre-loaded Data:** Product information is pre-loaded into a JSON script tag for fast and efficient popup rendering, avoiding unnecessary AJAX calls.

### 3. Interactive Product Popup (powered by `custom-page.js`)
- A fully functional modal built with **vanilla JavaScript**.
- **Dynamic Variant Selection:** Displays product options (e.g., Color, Size) dynamically. Color options are rendered as pill-style radio buttons, and sizes are in a dropdown.
- **"Add to Cart" Functionality:** Uses the Shopify Cart API (`/cart/add.js`) to add the selected product variant to the cart.
- **Special Conditional Logic:** If a product variant with "Black" and "Medium" options is added to the cart, the "Soft Winter Jacket" product is automatically added as well.
- **Pixel-Perfect Styling:** The modal's dimensions, layout, and styling are precisely matched to the Figma design specifications.

## How to Use

1.  Add the section files (`custom-banner.liquid`, `custom-grid.liquid`) to the `sections` directory of your theme.
2.  Add the JavaScript file (`custom-page.js`) to the `assets` directory.
3.  Add the page template (`page.ecomexperts-test.json`) to the `templates` directory.
4.  In the Shopify Admin, navigate to **Online Store > Pages**.
5.  Create a new page.
6.  In the "Theme template" section on the right, select **"Ecomexperts Test"**.
7.  Save the page and view it to see the custom sections in action.

## Technologies Used

- **Shopify Liquid:** For server-side rendering and data handling.
- **Vanilla JavaScript (ES6+):** For all client-side interactivity, including the popup modal and API calls.
- **HTML5 & CSS3:** For structure and styling, including CSS Grid/Flexbox for responsive layouts.
- **JSON:** For pre-loading product data efficiently.