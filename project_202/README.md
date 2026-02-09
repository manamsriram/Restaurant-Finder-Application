# Restaurant Finder Application 🍽️🌐

[![React](https://img.shields.io/badge/React-18.3-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwindcss)](https://tailwindcss.com/)
[![Python](https://img.shields.io/badge/Python-3.9+-3776AB?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Backend-05998B?logo=fastapi)](https://fastapi.tiangolo.com)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-ORM-744A3F?logo=python)](https://sqlalchemy.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

> **A full-stack, blazing-fast restaurant discovery app built with React, TailwindCSS, Vite (frontend) and FastAPI/SQLAlchemy (backend/Python).**  
> Find, browse, and manage restaurants with a modular codebase, RESTful API, and rapid development experience.

---

## 🔥 Overview

- **React 18 SPA** with component-based UI, fast routing, and instant HMR via Vite.
- **TailwindCSS** for modern, responsive design.
- **FastAPI** REST backend in Python, serving authentication, CRUD, and business logic.
- **SQLAlchemy** for robust data modeling and ORM.
- **Development-first structure:** Modular file/folder organization for scale, testability, and ease of contribution.

---

## 📦 Installation

git clone https://github.com/manamsriram/Restaurant-Finder-Application.git
cd Restaurant-Finder-Application/project_202

Frontend
npm install

Backend
cd routes
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

text

---

## 🖥️ Usage

**Frontend (React/Vite):**
npm run dev # Start development server
npm run build # Production build
npm run preview # Preview build

text

**Backend (FastAPI):**
uvicorn main:app --reload

text

API by default on `localhost:8000`.  
Point frontend API calls to backend server URL.

---

## 📂 Main Features

- Mobile-first restaurant search, filtering, and browsing
- Modular RESTful API for restaurants, users, owners, admins
- JWT authentication and protected backend routes
- Owner/admin dashboards and CRUD
- Organized, extensible folders and code

---

## 🗂️ Directory Structure

<pre>
project_202/
├── routes/
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── owners.py
│   │   ├── restaurants.py
│   │   ├── users.py
│   │   └── __pycache__/
│   ├── __init__.py
│   ├── auth.py
│   ├── db_config.py     # Database setup and connection
│   ├── main.py          # FastAPI server entry-point, includes all routers
│   ├── models.py        # ORM models for DB tables (restaurants, users, etc.)
│   ├── requirements.txt # Backend dependencies (FastAPI, SQLAlchemy)
│   ├── schemas.py       # Pydantic schemas for validation/serialization
├── src/
│   ├── components/      # React UI components
│   ├── pages/           # High-level page views/routes
│   ├── App.css
│   ├── App.jsx          # Top-level React component
│   ├── index.css
│   ├── main.jsx         # React entry file
├── .gitignore
├── README.md
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── requirements.txt     # (May also contain dev/infra dependencies)
├── tailwind.config.js
├── vite.config.js
</pre>

---

### 🔗 Backend/API Services

- **FastAPI structure (`routes/`)**:
    - `main.py`: Registers and launches the API.
    - `db_config.py`: Database connection, ORM config.
    - `models.py`: Table/entity definitions (restaurants, users, etc.).
    - `auth.py`: JWT login/logout, security flows.
    - `routers/`: Modular endpoints — REST API for admin, owners, restaurants, users.
    - `schemas.py`: Data validation with Pydantic; request and response schemas.
    - **Endpoints:** `/restaurants`, `/users`, `/owners`, `/admin` for CRUD, login, registration, search, etc.

- **Authentication:** JWT-based (login, protected routes)
- **Database:** SQL-compatible via SQLAlchemy
- **Requirements:** FastAPI, SQLAlchemy, Pydantic, etc.

---

### 💼 Frontend

- Organized under `src/`:
    - `components/`: Navbar, search bar, restaurant cards, etc.
    - `pages/`: Home, results, login/signup, dashboards for owners/admins.
    - API calls (fetch/Axios) point to backend endpoints for data/actions.

---

### 🔧 Config & Build Tools

- Vite & PostCSS for speedy dev/build
- ESLint config for code quality
- `.gitignore` for proper workspace hygiene

---

## 🗣️ Frontend <-> Backend Integration

- **Frontend** interactively fetches and posts data to backend REST API
- **Backend** serves JSON, handles authentication, data, and permissions
- **Deployment:** Vercel/Netlify (frontend), Docker/cloud/VPS (backend); update API URL in frontend config

---

## 🚦 Example Workflow

1. User searches for a restaurant (frontend makes GET `/restaurants`).
2. Logs in, registers, or bookmarks (frontend POST `/users`/auth endpoints).
3. Owner/admin creates or edits restaurant data (protected backend endpoints).
4. All business logic resides in the backend, UI logic in the frontend.

---

## 🏗️ Roadmap

- Connect to restaurant datasets/APIs
- Add location-based search and map integration
- Implement user reviews/ratings
- CI/CD and containerized deployment

---

## 👤 Authors

Sri Ram Mannam  - [GitHub](https://github.com/manamsriram)
Dao Seckar  - [GitHub](https://github.com/DaoSeckar)
Nkono Andrew Mwase  - [GitHub](https://github.com/NkonoAndrew)
Spencer Davis  - [GitHub](https://github.com/sdavis5)

---
