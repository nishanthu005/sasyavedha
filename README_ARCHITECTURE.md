# SasyaVedha Architecture

SasyaVedha is a React and Flask application for farm decision support. The frontend is a single-page application (SPA); the backend provides JSON APIs and stores accounts and sessions in SQLite.

## Project structure

```
frontend/                 React application
  src/pages/              Feature screens
  src/components/         Shared UI pieces
  src/context/            App state, translations, and HTTP client
backend/                  Flask application
  app.py                  App factory and startup entry point
  auth_routes.py          Login, signup, logout, and session validation
  farm_routes.py          Dashboard and advisory APIs
  disease_data.py         Curated disease guidance and product-use notes
  database.py             SQLite users, password hashes, and sessions
```

## Frontend architecture

`App.js` chooses the login/signup view or the authenticated workspace. It owns the active page and supplies it to either sidebar. Pages are feature-focused and use shared contexts for language, location, user state, and authentication. `context/api.js` is the one Axios client: it adds the saved bearer token and clears a failed session after a 401 response.

There is no URL router at present. Sidebar page IDs select components inside the SPA, so navigation does not reload the browser.

## Backend architecture

`backend/app.py` is intentionally small. It creates Flask, enables CORS, initializes SQLite, and registers route blueprints. `auth_routes.py` owns account/session concerns; `farm_routes.py` owns advisory responses. `disease_data.py` separates curated knowledge from request handling, making it straightforward to replace the demonstration classifier with a real model later.

## Data flow and request lifecycle

1. A user signs in; Flask creates a database-backed session token.
2. The frontend stores the token in local storage through `AuthContext`.
3. A feature page calls a function in `context/api.js`.
4. Axios sends the token in `Authorization: Bearer …`.
5. `login_required` validates the session and exposes the user to the route.
6. The route validates input, computes or retrieves a result, and returns JSON.
7. The page renders loading, result, or error state.

Dashboard data is also cached in browser local storage so the dashboard can show the last successful snapshot if the network is unavailable.

## State and authentication

React Context manages authentication, language, location, and user preferences. Page-specific form and loading state stays in the owning page. Passwords are handled by `database.py`; clients receive a session token, never a password. Signing out invalidates the server session and clears browser state.

## Design decisions

- The Flask blueprint split keeps HTTP setup, authentication, and farming logic independent.
- Disease records include explanation, non-chemical measures, chemical guidance, and product-use notes so the UI does not have to assemble unsafe free text.
- Advisory values are demonstrative. Product labels, local registration, weather, crop stage, and an agricultural advisor must be checked before field use.
