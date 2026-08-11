# SasyaVedha Features and API Guide

All API URLs are relative to the Flask server and return JSON. Except for health and authentication, requests need `Authorization: Bearer <session token>`.

## Accounts

### `POST /api/auth/signup`

Creates an account and immediately signs the user in. Input: `username`, `email`, and `password` (minimum six characters). Output: `success`, safe `user` details, and `session_token`. Used by the Signup page. Invalid values return 400; an existing username/email returns 409.

Example: `{"username":"Asha","email":"asha@example.com","password":"secret1"}`. A successful response includes `{"success":true,"user":{"id":"…","username":"Asha"},"session_token":"…"}`.

### `POST /api/auth/login`

Signs in using `email` (or `username`) and `password`. It is used by Login and returns the same user and token shape as signup. Missing or incorrect credentials return 401.

### `POST /api/auth/logout` and `GET /api/auth/verify`

Logout ends the current session. Verify checks whether a stored token is still valid and returns the current user. `AuthContext` uses these endpoints; an invalid token returns 401.

## Farming advice

### `POST /api/detect-disease`

Used by Disease Detection. Input: `crop` and optional base64 `image`. Output includes the detected `disease`, `confidence`, severity, pathogen and symptoms, plus separate `description`, `general_measures`, `chemical_treatment`, and `products`. Each product has `name`, `type`, and `use` so the screen can say when and how it should be used. The current classifier is a demonstration response, so results must be confirmed locally. A missing/expired token returns 401.

### `POST /api/predict-yield`

Used by Yield Prediction. Input can include crop, area, rainfall, temperature, soil values, pH, and fertiliser amount. Output provides predicted yield per hectare, total yield, district comparison, feature importance, and a monthly trend. Invalid numeric input returns a client error; missing values use safe defaults.

### `POST /api/irrigation`

Used by Irrigation. Input: crop, soil moisture, temperature, humidity, forecast rain, and field area. Output: urgency, moisture status, water amount, recommended time, evaporation estimate, and schedule. The recommendation is an estimate and should be checked against local conditions.

### `POST /api/fertilizer`

Used by Fertilizer. Input: crop, area, and soil-test values. Output: a nutrient prescription, organic option, application schedule, and estimated cost. It gives general advice only; a local soil test and label directions take priority.

### `GET /api/dashboard`

Used by Dashboard. Returns summary values, fields, alerts, and weather arrays. Dashboard caches the last successful response in the browser for offline display.

### `GET /api/health`

No login needed. Returns `{"success":true,"status":"healthy"}` and is useful for checking whether the backend is running.

## Frontend-only features

Climate Simulation calculates scenario projections in the browser from selected crop, horizon, and climate settings. Farm, team, inventory, settings, and report screens currently save their workspace data in browser storage. Advanced Analytics shows a local data summary; Export Report downloads the current view as JSON. These features do not rely on a server endpoint yet, so clearing browser storage removes their demo data.
