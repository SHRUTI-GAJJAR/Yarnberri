# Yarnberri Frontend

Yarnberri is a handcrafted crochet and gifting storefront. This frontend is built with React, Vite, Bootstrap, Tailwind CSS, and the existing Yarnberri backend API.

## Tech stack
- React
- Vite
- JavaScript
- Bootstrap
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React
- React Icons
- Motion
- React Hook Form

## Installation

```bash
npm install
```

## Environment variables
Create a `.env` file based on `.env.example`:

```bash
VITE_API_URL=http://localhost:5000/api
```

## Development

```bash
npm run dev
```

## Production build

```bash
npm run build
```

## API URL
The frontend uses the backend API at:

```bash
http://localhost:5000/api
```

## Important rules
- Do not modify backend APIs or business logic.
- Use the existing backend contracts.
- Keep authentication, cart, and admin flows aligned with the backend.
- No mock product data or fake API routes in the final frontend implementation.

## Relationship with backend
This frontend is designed to talk to the existing backend under `../backend`. The backend already provides product, auth, cart, address, profile, and order routes. The frontend foundation is intended to connect to these routes without changing them.

## Project structure

```text
frontend/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── pages/
│   ├── services/
│   ├── styles/
│   ├── routes/
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── vite.config.js
└── README.md
```
