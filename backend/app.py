"""API de mensajes compartidos; SQLite persiste en un volumen Docker."""
from contextlib import asynccontextmanager, closing
import os
from pathlib import Path
import sqlite3

from fastapi import FastAPI
from pydantic import BaseModel, ConfigDict, Field


def connect():
    return sqlite3.connect(os.environ.get("DATABASE_PATH", "data/messages.sqlite3"), timeout=10)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(os.environ.get("DATABASE_PATH", "data/messages.sqlite3")).parent.mkdir(parents=True, exist_ok=True)
    with closing(connect()) as db, db:
        db.execute("CREATE TABLE IF NOT EXISTS messages (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL)")
    yield


app = FastAPI(title="HILO · Mensajes", lifespan=lifespan)


class MessageInput(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")
    message: str = Field(min_length=1, max_length=1000)


class Message(BaseModel):
    id: int
    message: str


@app.get("/api/status")
def status():
    with closing(connect()) as db:
        db.execute("SELECT COUNT(*) FROM messages").fetchone()
    return {"status": "ok"}


@app.get("/api/messages", response_model=list[Message])
def messages():
    with closing(connect()) as db:
        rows = db.execute("SELECT id, message FROM messages ORDER BY id").fetchall()
    return [{"id": row[0], "message": row[1]} for row in rows]


@app.post("/api/messages")
def create_message(payload: MessageInput):
    with closing(connect()) as db, db:
        db.execute("INSERT INTO messages (message) VALUES (?)", (payload.message,))
    return {"success": True}
