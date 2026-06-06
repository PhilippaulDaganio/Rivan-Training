# Architecture Context

## Purpose

This file gives AI assistants the current technical shape of the FS_8 project so future prompts can produce changes that match the existing codebase.

Use this context together with `context/project-overview.md`.

---

## Current Status

FS_8 is an early-stage full-stack e-commerce learning project with a separate Django REST Framework backend and React frontend.

The backend currently exposes product data through a simple function-based DRF endpoint.

The frontend currently renders product pages from local mock data in `frontend/src/data/products.js`. It is not yet wired to the backend API.

Authentication pages exist in the frontend, but backend authentication endpoints are not implemented yet.

---

## Repository Layout

```txt
FS_8/
|-- backend/
|   |-- manage.py
|   |-- db.sqlite3
|   |-- products_fixture.json
|   |-- backend/
|   |   |-- settings.py
|   |   |-- urls.py
|   |   |-- asgi.py
|   |   `-- wsgi.py
|   |-- base/
|   |   |-- models.py
|   |   |-- serializers.py
|   |   |-- views.py
|   |   |-- urls.py
|   |   |-- admin.py
|   |   |-- apps.py
|   |   `-- migrations/
|   `-- static/
|       `-- images/
|           `-- product_images/
|-- frontend/
|   |-- package.json
|   |-- vite.config.js
|   |-- index.html
|   |-- public/
|   `-- src/
|       |-- App.jsx
|       |-- main.jsx
|       |-- index.css
|       |-- data/
|       |   `-- products.js
|       |-- components/
|       |   |-- Header.jsx
|       |   |-- Footer.jsx
|       |   |-- ProductList.jsx
|       |   `-- ShopGuide.jsx
|       `-- pages/
|           |-- Home.jsx
|           |-- Products.jsx
|           |-- ProductDetails.jsx
|           |-- Login.jsx
|           `-- Register.jsx
|-- context/
|   |-- architecture-context.md
|   `-- project-overview.md
`-- Documentation_FST/
```

Generated and dependency folders such as `frontend/node_modules/`, `frontend/dist/`, `venv/`, and Python `__pycache__/` folders should normally be ignored when reasoning about app code.

---

## Backend Architecture

### Stack

- Python
- Django
- Django REST Framework
- PostgreSQL configured in `backend/backend/settings.py`
- Main app: `base`

### Django Apps

`backend/backend/` is the Django project package.

`backend/base/` is the application package that currently owns product models, serializers, views, and URL routing.

### Installed Apps

The project includes the default Django apps plus:

- `base`
- `rest_framework`

### Database Configuration

`backend/backend/settings.py` is currently configured for PostgreSQL using Railway-style connection values.

Important prompting rule: do not assume SQLite is active just because `db.sqlite3` exists. Check `settings.py` before changing database behavior.

Sensitive database values should eventually be moved to environment variables before production use.

### Product Model

The only custom model currently found is `Product` in `backend/base/models.py`.

Current fields:

- `product_name`
- `product_price`
- `brand`
- `description`
- `countInStock`
- `image`
- `createdAt`

The frontend mock data uses different names (`name`, `price`, `image`, `description`), so API integration will need field mapping or serializer/frontend changes.

### Serializer

`ProductSerializer` in `backend/base/serializers.py` is a `ModelSerializer` using:

```python
fields = "__all__"
```

### Views

`backend/base/views.py` currently contains one function-based DRF view:

- `product_list(request)`
- Method: `GET`
- Returns all products serialized with `ProductSerializer`

### URL Routing

Root project routes in `backend/backend/urls.py`:

- `/admin/`
- includes `base.urls` at the root path
- serves media files through `static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)` during development

App routes in `backend/base/urls.py`:

- `GET /products/`

There is currently no `/api/` prefix in the implemented route.

### Media Files

`MEDIA_ROOT = "static/images"`

`MEDIA_URL = "/images/"`

Product image uploads use:

```python
upload_to="product_images/"
```

Existing product image files are stored under:

```txt
backend/static/images/product_images/
```

---

## Frontend Architecture

### Stack

- React 19
- Vite
- Tailwind CSS 4 through `@tailwindcss/vite`
- React Router DOM 7
- ESLint

### Routing

Routes are defined in `frontend/src/App.jsx`.

Current frontend routes:

- `/`
- `/products`
- `/products/:id`
- `/login`
- `/register`

`BrowserRouter` is set up in `frontend/src/main.jsx`.

### Data Source

Product UI currently reads from:

```txt
frontend/src/data/products.js
```

This is temporary mock data. It imports the same local hero image for every product.

Backend integration is a planned next step. When integrating, use the actual backend endpoint currently available at `GET /products/` unless the backend route is changed intentionally.

### Component Structure

Shared UI components:

- `Header.jsx`
- `Footer.jsx`
- `ProductList.jsx`
- `ShopGuide.jsx`

Pages:

- `Home.jsx`
- `Products.jsx`
- `ProductDetails.jsx`
- `Login.jsx`
- `Register.jsx`

### Styling

The frontend uses Tailwind utility classes directly in JSX.

Current visual style is simple, clean, responsive, and beginner-friendly.

Keep styles consistent with existing colors, spacing, and component patterns unless the user asks for a redesign.

---

## Integration Notes

When connecting frontend products to backend data:

- Use the implemented backend route first: `GET /products/`.
- Add CORS support only if the frontend and backend run on different origins and browser requests are blocked.
- Avoid inventing `/api/products/` unless the Django routes are also updated.
- Map backend fields to frontend display fields carefully:
  - `product_name` -> `name`
  - `product_price` -> `price`
  - `image` -> `image`
  - `description` -> `description`
- Backend image URLs may be relative to `MEDIA_URL`; frontend code may need to prepend the backend base URL.

---

## Architecture Rules For Future Prompts

- Keep the architecture beginner-friendly.
- Prefer small, clear changes over broad rewrites.
- Match the existing file names and folder structure.
- Do not rename model fields, routes, or components unless the user asks or the migration plan is included.
- Do not add new libraries unless they solve a real current need.
- Prefer existing React components before creating new ones.
- Keep backend routes and frontend API calls aligned.
- Check actual code before claiming a feature exists.
- Treat `Documentation_FST/` as learning/reference material, not runtime app code.
- Keep generated folders and dependencies out of architecture summaries.
