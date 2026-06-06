# Frontend Architecture Context

## Overview

This document describes the frontend structure, available pages, reusable components, and page patterns for the shop application.

The project uses React with JSX components and Tailwind-style utility classes.

The application has 5 user-facing pages:

1. Home Page
2. Products Page
3. Product Details Page
4. Login Page
5. Register Page

---

## Folder structure

Use this structure in `frontend/src`:

- `src/App.jsx` — application entry component
- `src/main.jsx` — React bootstrap file
- `src/pages/` — page-level components
  - `Home.jsx`
  - `Products.jsx`
  - `ProductDetails.jsx`
  - `Login.jsx`
  - `Register.jsx`
- `src/Components/` — shared UI components
  - `Header.jsx`
  - `Footer.jsx`
  - `ShopGuide.jsx`
  - `ProductList.jsx`

---

## Project Goal

Build a simple e-commerce frontend.

The UI should be clean, responsive, and easy to navigate.

The app should allow users to:

- View the home page
- Browse products
- Open a product details page
- Log in
- Register a new account

---

## Page structure

Each page should follow a consistent layout:

1. Header
2. Main content
3. Footer

If the app does not use routing yet, `App.jsx` can render the default page along with `Header`.

### Page responsibilities

- `Home.jsx`: hero section, shop guide, featured products, footer
- `Products.jsx`: title, product list, footer
- `ProductDetails.jsx`: product image, details, add-to-cart action, footer
- `Login.jsx`: sign-in form, login button, register link, footer
- `Register.jsx`: signup form, confirm password input, login link, footer

---

## Available Components

Use the shared components below before creating new ones.

### `Components/Header.jsx`

Used at the top of each page.

Responsibilities:

- Display site logo or name
- Show navigation links
- Link to sections or pages: Home, Products, Details, Login, Register
- Be responsive and keep navigation accessible

---

### `Components/Footer.jsx`

Used at the bottom of each page.

Responsibilities:

- Display footer text
- Show copyright information
- Optionally show useful links or legal copy

---

### `Components/ShopGuide.jsx`

Used on the Home Page.

Responsibilities:

- Explain how users can shop on the site
- Show simple shopping steps or benefits
- Guide users toward browsing products

---

### `Components/ProductList.jsx`

Used on the Home Page and Products Page.

Responsibilities:

- Render a list of products
- Show product image, name, price, and short description
- Include an action button such as Add to cart or View details

---

## Suggested page APIs

When you need to pass data:

- `Home` may render `ShopGuide` and `ProductList`
- `Products` may render `ProductList`
- `ProductDetails` may accept a product object or `productId` prop later

Keep components small, reusable, and focused.

---

## Suggested Routes

If routing is added later, use these routes:

- `/` for Home Page
- `/products` for Products Page
- `/products/:id` for Product Details Page
- `/login` for Login Page
- `/register` for Register Page

---

## Styling Guidelines

The UI should be:

- Clean
- Responsive
- Easy to read
- Consistent across pages

Use simple spacing, readable typography, and clear buttons.

The design should work on both desktop and mobile screens.

---

## Development Rules

- Use JSX syntax
- Use functional React components
- Use clear component names
- Keep components small and readable
- Reuse existing components before creating new ones
- Avoid adding unnecessary libraries
- Do not duplicate existing component functionality


Do not hardcode repeated UI if it can be handled by reusable components.

---

## Data Rules

Product data can be mocked if no backend is available.

Each product should include:

- `id`
- `name`
- `price`
- `image`
- `description`

Use the product `id` for the Product Details Page route.

---

## AI Assistant Instructions

When generating code for this project:

- Follow the existing page and component structure
- Use the available components when possible
- Keep code simple and maintainable
- Do not invent unnecessary files
- Do not rename existing components unless requested
- Make sure imports match the listed component paths
- Keep routing consistent with the suggested routes
- Keep UI consistent across all pages



