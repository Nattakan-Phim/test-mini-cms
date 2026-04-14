"""
Unit tests for POST /api/auth/login
Covers: success, wrong password, unknown user, rate limiting.
"""

import pytest


class TestLogin:
    def test_login_success(self, client, admin_user):
        res = client.post("/api/auth/login", json={"username": "admin", "password": "admin1234"})
        assert res.status_code == 200
        data = res.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, admin_user):
        res = client.post("/api/auth/login", json={"username": "admin", "password": "wrongpass"})
        assert res.status_code == 401
        assert "Incorrect" in res.json()["detail"]

    def test_login_unknown_user(self, client):
        res = client.post("/api/auth/login", json={"username": "nobody", "password": "1234"})
        assert res.status_code == 401

    def test_login_missing_fields(self, client):
        res = client.post("/api/auth/login", json={"username": "admin"})
        assert res.status_code == 422  # validation error

    def test_rate_limit_after_5_failures(self, client, admin_user):
        # 5 failed attempts should return 401 each time
        for i in range(5):
            res = client.post("/api/auth/login", json={"username": "admin", "password": "bad"})
            assert res.status_code == 401, f"Attempt {i+1} should be 401"

        # 6th attempt should be blocked with 429
        res = client.post("/api/auth/login", json={"username": "admin", "password": "bad"})
        assert res.status_code == 429
        assert "Too many" in res.json()["detail"]

    def test_rate_limit_resets_on_success(self, client, admin_user):
        # Accumulate 4 failures
        for _ in range(4):
            client.post("/api/auth/login", json={"username": "admin", "password": "bad"})

        # Successful login clears the counter
        res = client.post("/api/auth/login", json={"username": "admin", "password": "admin1234"})
        assert res.status_code == 200

        # Failures should start fresh — next bad attempt is 401, not 429
        res = client.post("/api/auth/login", json={"username": "admin", "password": "bad"})
        assert res.status_code == 401
