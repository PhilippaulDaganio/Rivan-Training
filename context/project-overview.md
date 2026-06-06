# Project Overview Context

## Project Summary

FS_8 is a beginner-friendly full-stack e-commerce project.

The goal is to build a clean shopping experience where users can browse products, view product details, and eventually register and log in.

The project is split into two main applications:

- `backend/`: Django REST Framework API
- `frontend/`: React, Vite, and Tailwind CSS user interface

Use `context/architecture-context.md` for deeper technical details.

---

## Current Product State

The project currently has:

- A Django `Product` model
- A DRF serializer for products
- A backend product list endpoint
- A React product listing page
- A React product details page
- Login and register pages in the frontend
- Local mock product data in the frontend
- Product images stored in the backend media/static image folder

The frontend is not yet connected to the backend product endpoint.

---

## Main Goal

Build a simple e-commerce application where users can:

- Browse products
- View product details
- Register an account
- Log in
- See product data from the backend API instead of hardcoded frontend mock data

---

## Tech Stack

### Frontend

- React
- Vite
- JSX
- Tailwind CSS
- React Router DOM

### Backend

- Python
- Django
- Django REST Framework
- PostgreSQL is currently configured in `backend/backend/settings.py`

---

## Current Frontend Pages

### Home Page

Route: `/`

Purpose:

- Introduce the store
- Show the hero section
- Guide users toward browsing products
- Display a small product preview when using shared product components

### Products Page

Route: `/products`

Purpose:

- Show the product collection
- Currently uses local mock data from `frontend/src/data/products.js`
- Should later fetch products from the backend

### Product Details Page

Route: `/products/:id`

Purpose:

- Show details for one product
- Currently finds the product from local mock data using the route ID
- Includes a not-found state when the ID does not match a mock product

### Login Page

Route: `/login`

Purpose:

- Provide a frontend sign-in screen
- Backend login behavior is not implemented yet

### Register Page

Route: `/register`

Purpose:

- Provide a frontend account creation screen
- Backend registration behavior is not implemented yet

---

## Current Backend API

The implemented backend product route is:

```txt
GET /products/
```

It returns serialized `Product` records from the database.

The route is included at the Django root path, not under `/api/`.

Suggested future API routes can be added later, but prompts should not assume they already exist.

---

## Product Data Shape

### Backend Product Fields

The backend `Product` model currently uses:

- `id`
- `product_name`
- `product_price`
- `brand`
- `description`
- `countInStock`
- `image`
- `createdAt`

### Frontend Mock Product Fields

The frontend mock products currently use:

- `id`
- `name`
- `price`
- `image`
- `description`

### Important Mapping

When connecting the frontend to the backend, map or normalize fields:

- `product_name` should display as the product name.
- `product_price` should display as the price.
- `image` may need a backend base URL.
- `countInStock` can support stock messaging later.

---

## Near-Term Development Priorities

1. Keep the frontend responsive and readable.
2. Connect the product list page to `GET /products/`.
3. Connect the product details page to backend product data.
4. Add a backend single-product endpoint if needed.
5. Add CORS configuration if browser requests from Vite to Django are blocked.
6. Implement backend authentication only after the product flow is stable.
7. Move sensitive backend configuration into environment variables before production deployment.

---

## Development Guidelines

- Keep code beginner-friendly.
- Prefer clear, explicit code over clever abstractions.
- Reuse existing components before adding new ones.
- Keep React components small and focused.
- Keep Tailwind classes readable and consistent.
- Do not add unnecessary dependencies.
- Do not rename files or folders unless requested.
- Do not assume routes exist; check Django URL files first.
- Do not hardcode real credentials in frontend code.
- Keep backend and frontend data shapes aligned.
- Treat `Documentation_FST/` as course/reference material, not production app code.

---

## AI Assistant Instructions

When generating or modifying code for this project:

- Read the relevant existing files first.
- Match the current React, Django, and Tailwind patterns.
- Use the actual route `GET /products/` unless you intentionally update Django routing.
- Mention when a route or feature is proposed but not implemented.
- Avoid claiming authentication exists on the backend until it is added.
- Avoid claiming frontend API integration exists until the mock data is replaced.
- Keep changes scoped to the user's request.
- Explain any field mapping between backend and frontend product data.
- Prefer practical next steps over large architecture redesigns.
