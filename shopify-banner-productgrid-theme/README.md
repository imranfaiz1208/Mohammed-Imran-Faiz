# Shopify Banner and Product Grid Theme

## Overview
This project is a Shopify theme that includes a customizable Banner Section and a responsive Product Grid Section. The Banner Section allows users to edit the heading, subtext, and button text, while the Product Grid Section displays six product cards with a popup modal for product details.

## Project Structure
```
shopify-banner-productgrid-theme
├── assets
│   ├── banner-section.css        # Styles for the Banner Section
│   ├── product-grid-section.css   # Styles for the Product Grid Section
│   ├── product-modal.js           # Functionality for the product modal
│   └── theme.js                   # Main JavaScript file for the theme
├── blocks
│   └── product-card.liquid        # Structure of the product card
├── config
│   ├── settings_data.json         # Stores current settings for the theme
│   └── settings_schema.json       # Defines schema for theme settings
├── layout
│   └── theme.liquid               # Main layout file for the theme
├── locales
│   └── en.default.json            # Localization strings for the theme
├── sections
│   ├── banner-section.liquid      # Defines the Banner Section
│   └── product-grid-section.liquid # Defines the Product Grid Section
├── snippets
│   └── product-modal.liquid       # HTML structure for the product modal
└── templates
    └── index.json                 # Template structure for the homepage
```

## Setup Instructions
1. **Download the Theme**: Clone or download the theme files to your local machine.
2. **Upload to Shopify**: Go to your Shopify admin panel, navigate to Online Store > Themes, and upload the theme files.
3. **Customize the Theme**: Access the theme editor to customize the Banner Section and select products for the Product Grid Section.
4. **Test the Functionality**: Ensure that the modal popup works correctly and that the layout is responsive across different devices.

## Usage Guidelines
- **Banner Section**: Edit the heading, subtext, and button text in the theme settings to customize the appearance of the banner.
- **Product Grid Section**: Select the products you want to display in the grid. Each product card will have a button that opens a modal with more details.
- **Responsive Design**: The theme is designed to be fully responsive, ensuring a seamless experience on both desktop and mobile devices.

## Contribution
Feel free to contribute to this project by submitting issues or pull requests. Your feedback and suggestions are welcome!