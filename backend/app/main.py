from fastapi import FastAPI
from app.core.database import Base, engine
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.api.admin.router import api_router_admin
from app.middlewares.auth_middleware import AuthMiddleware


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Secure Mail API",
    version="1.0.0"
)
origins = [
    "http://127.0.0.1:3000",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

app.include_router(api_router, prefix="/api/v1")
app.include_router(api_router_admin, prefix="/api/admin")

@app.get("/")
def root():
    return {
        "message": "Secure Mail API is running"
    }

# Run the application using: uvicorn app.main:app --reload --port 8000