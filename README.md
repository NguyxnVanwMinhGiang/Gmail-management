# Email system e2ee
 
A modern web application for managing Gmail accounts with a React frontend and FastAPI backend.

---

## Tech Stack

### Frontend
- React 24.15.0 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- TanStack React Router for routing

### Backend
- FastAPI for REST API
- Python 3.14.4

---

## Prerequisites

- Node.js 24+ or Bun
- Python 3.14.4

---

## Getting Started

### Frontend Setup

#### Using npm:

```bash
cd frontend
npm install
npm run dev
```

#### Using Bun:

```bash
cd frontend
bun install
bun run dev
```

The frontend will be available at `http://127.0.0.1:8080`

### Installing TanStack React Router

#### Using npm:

```bash
cd frontend
npm install @tanstack/react-router
```

#### Using Bun:

```bash
cd frontend
bun add @tanstack/react-router
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

---

## Project Structure

```
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── main.py
└── README.md
```

---

## Features

- Email management interface
- Real-time updates with WebSocket
- Responsive UI with Tailwind CSS
- Type-safe frontend with TypeScript
- RESTful API with FastAPI

---

## License

MIT
