import pytest
from httpx import AsyncClient, ASGITransport
from main import app
from database import init_db

@pytest.mark.asyncio
async def test_create_and_read_note():
    # Initialize DB (creates tables)
    await init_db()

    # Use ASGITransport to bypass networking and call the app directly
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Create Note
        note_data = {"content": "test note", "category": "test"}
        response = await ac.post("/notes/", json=note_data)
        assert response.status_code == 200
        data = response.json()
        assert data["content"] == "test note"
        assert data["category"] == "test"

        # Read Notes
        response = await ac.get("/notes/")
        assert response.status_code == 200
        notes = response.json()
        assert len(notes) > 0

        # Verify the created note is in the list
        found = False
        for note in notes:
            if note["content"] == "test note":
                found = True
                break
        assert found
