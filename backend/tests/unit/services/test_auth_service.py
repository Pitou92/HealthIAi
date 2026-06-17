import pytest
from datetime import timedelta
from jose import jwt
from core.config import settings
from services.auth_service import verify_password, get_password_hash, create_access_token

def test_password_hashing():
    password = "supersecretpassword123"
    hashed = get_password_hash(password)
    
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrongpassword", hashed) is False

def test_create_access_token():
    data = {"sub": "123"}
    token = create_access_token(data)
    
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == "123"
    assert "exp" in decoded

def test_create_access_token_with_expiry():
    data = {"sub": "123"}
    expires_delta = timedelta(minutes=15)
    token = create_access_token(data, expires_delta=expires_delta)
    
    decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    assert decoded["sub"] == "123"
    assert "exp" in decoded
