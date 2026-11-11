import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient
from app import app


class ApiTest(unittest.TestCase):
    def test_roundtrip_validation_and_persistence(self):
        with tempfile.TemporaryDirectory() as directory, patch.dict(os.environ, {"DATABASE_PATH": str(Path(directory) / "messages.sqlite3")}):
            with TestClient(app) as client:
                self.assertEqual(client.get("/api/status").json(), {"status": "ok"})
                self.assertEqual(client.get("/api/messages").json(), [])
                for value in ("", "   ", "x" * 1001, 123, None):
                    self.assertEqual(client.post("/api/messages", json={"message": value}).status_code, 422)
                self.assertEqual(client.post("/api/messages", json={}).status_code, 422)
                response = client.post("/api/messages", json={"message": " mensaje de prueba ñ ' "})
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.json(), {"success": True})
                self.assertEqual(client.get("/api/messages").json(), [{"id": 1, "message": "mensaje de prueba ñ '"}])
            with TestClient(app) as client:
                self.assertEqual(len(client.get("/api/messages").json()), 1)


if __name__ == "__main__":
    unittest.main()
