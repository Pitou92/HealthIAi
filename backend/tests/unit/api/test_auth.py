import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from main import app
from core.sql_db import get_db
from models.sql_models import User
from services.auth_service import get_password_hash

client = TestClient(app)

# Mocked database session
@pytest.fixture
def mock_db_session():
    session = AsyncMock()
    return session

def override_get_db():
    session = AsyncMock()
    # On mock le result de execute().scalars().first()
    mock_result = MagicMock()
    mock_result.scalars.return_value.first.return_value = None
    session.execute.return_value = mock_result
    yield session

# On remplace la dépendance
app.dependency_overrides[get_db] = override_get_db

def test_register_new_user():
    # Avec le mock tel quel, l'utilisateur n'existe pas (first() renvoie None)
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_register_existing_user():
    # On modifie le mock pour simuler un utilisateur existant
    async def override_get_db_existing():
        session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = User(id=1, email="test@example.com")
        session.execute.return_value = mock_result
        yield session
        
    app.dependency_overrides[get_db] = override_get_db_existing
    
    response = client.post(
        "/auth/register",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"

def test_login_success():
    async def override_get_db_login_success():
        session = AsyncMock()
        mock_result = MagicMock()
        # Mock de l'utilisateur avec un hash valide
        user = User(id=1, email="test@example.com", hashed_password=get_password_hash("password123"))
        mock_result.scalars.return_value.first.return_value = user
        session.execute.return_value = mock_result
        yield session
        
    app.dependency_overrides[get_db] = override_get_db_login_success
    
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password():
    async def override_get_db_login_wrong_pwd():
        session = AsyncMock()
        mock_result = MagicMock()
        user = User(id=1, email="test@example.com", hashed_password=get_password_hash("password123"))
        mock_result.scalars.return_value.first.return_value = user
        session.execute.return_value = mock_result
        yield session
        
    app.dependency_overrides[get_db] = override_get_db_login_wrong_pwd
    
    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"

def test_login_non_existent_user():
    async def override_get_db_login_not_found():
        session = AsyncMock()
        mock_result = MagicMock()
        mock_result.scalars.return_value.first.return_value = None
        session.execute.return_value = mock_result
        yield session
        
    app.dependency_overrides[get_db] = override_get_db_login_not_found
    
    response = client.post(
        "/auth/login",
        json={"email": "notfound@example.com", "password": "password123"}
    )
    assert response.status_code == 401
