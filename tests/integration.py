"""Prueba HTTP a través de Nginx, incluyendo persistencia al recrear servicios."""
import json
import os
from pathlib import Path
import sys
import urllib.request
import uuid

base = os.environ.get("FRONTEND_URL", "http://localhost:8080").rstrip("/")
marker_file = Path(os.environ.get("MARKER_FILE", "/tmp/hilo-ci-message.txt"))


def request(path, payload=None):
    data = None if payload is None else json.dumps(payload).encode()
    req = urllib.request.Request(base + path, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=15) as response:
        return json.load(response)


with urllib.request.urlopen(base, timeout=15) as response:
    assert b"<app-root>" in response.read(), "No se sirve Angular"
assert request("/api/status") == {"status": "ok"}
if "--verify-persistence" in sys.argv:
    marker = marker_file.read_text()
else:
    marker = f"Prueba Docker ida y vuelta {uuid.uuid4()}"
    assert request("/api/messages", {"message": marker}) == {"success": True}
    marker_file.write_text(marker)
assert any(item["message"] == marker and isinstance(item["id"], int) for item in request("/api/messages"))
print(f"OK: {base} → frontend → backend → SQLite → frontend; mensaje: {marker}")
