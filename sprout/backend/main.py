import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from database import init_db
from routers import ideas, engineers, wonderwall, radar, translation

load_dotenv()

app = FastAPI(
    title="SPROUT API",
    description="Connecting children's ideas with engineers worldwide.",
    version="0.1.0",
)

origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ideas.router)
app.include_router(engineers.router)
app.include_router(wonderwall.router)
app.include_router(radar.router)
app.include_router(translation.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/health")
def health():
    return {"status": "ok", "service": "sprout-api"}
