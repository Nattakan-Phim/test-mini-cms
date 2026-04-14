"""
Unit tests for admin article endpoints (all require JWT):
  GET    /api/admin/articles
  POST   /api/admin/articles
  GET    /api/admin/articles/{id}
  PUT    /api/admin/articles/{id}
  DELETE /api/admin/articles/{id}
"""


class TestAdminGuard:
    """All admin endpoints must reject unauthenticated requests."""

    def test_list_requires_auth(self, client):
        assert client.get("/api/admin/articles").status_code == 401

    def test_create_requires_auth(self, client):
        assert client.post("/api/admin/articles", json={}).status_code == 401

    def test_get_requires_auth(self, client, published_article):
        assert client.get(f"/api/admin/articles/{published_article.id}").status_code == 401

    def test_update_requires_auth(self, client, published_article):
        assert client.put(f"/api/admin/articles/{published_article.id}", json={}).status_code == 401

    def test_delete_requires_auth(self, client, published_article):
        assert client.delete(f"/api/admin/articles/{published_article.id}").status_code == 401

    def test_invalid_token_rejected(self, client):
        res = client.get("/api/admin/articles", headers={"Authorization": "Bearer invalid.token"})
        assert res.status_code == 401


class TestAdminListArticles:
    def test_returns_all_statuses(self, client, auth_headers, published_article, draft_article):
        res = client.get("/api/admin/articles", headers=auth_headers)
        assert res.status_code == 200
        ids = [a["id"] for a in res.json()]
        assert published_article.id in ids
        assert draft_article.id in ids

    def test_response_includes_content(self, client, auth_headers, published_article):
        res = client.get("/api/admin/articles", headers=auth_headers)
        assert res.status_code == 200
        article = next(a for a in res.json() if a["id"] == published_article.id)
        assert "content" in article
        assert "status" in article


class TestAdminCreateArticle:
    def test_create_draft(self, client, auth_headers):
        payload = {"title": "New Draft", "content": "Body text", "status": "draft"}
        res = client.post("/api/admin/articles", json=payload, headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert data["title"] == "New Draft"
        assert data["status"] == "draft"
        assert data["id"] is not None

    def test_create_published(self, client, auth_headers):
        payload = {"title": "Go Live", "content": "Content here", "status": "published"}
        res = client.post("/api/admin/articles", json=payload, headers=auth_headers)
        assert res.status_code == 201
        assert res.json()["status"] == "published"

    def test_create_with_summary(self, client, auth_headers):
        payload = {"title": "With Summary", "summary": "Short desc", "content": "Body", "status": "draft"}
        res = client.post("/api/admin/articles", json=payload, headers=auth_headers)
        assert res.status_code == 201
        assert res.json()["summary"] == "Short desc"

    def test_create_missing_title(self, client, auth_headers):
        res = client.post("/api/admin/articles", json={"content": "Body", "status": "draft"}, headers=auth_headers)
        assert res.status_code == 422

    def test_create_missing_content(self, client, auth_headers):
        res = client.post("/api/admin/articles", json={"title": "Title", "status": "draft"}, headers=auth_headers)
        assert res.status_code == 422

    def test_create_empty_title_rejected(self, client, auth_headers):
        res = client.post("/api/admin/articles", json={"title": "  ", "content": "Body", "status": "draft"}, headers=auth_headers)
        assert res.status_code == 422

    def test_create_invalid_status(self, client, auth_headers):
        res = client.post("/api/admin/articles", json={"title": "T", "content": "C", "status": "invalid"}, headers=auth_headers)
        assert res.status_code == 422


class TestAdminGetArticle:
    def test_get_published(self, client, auth_headers, published_article):
        res = client.get(f"/api/admin/articles/{published_article.id}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == published_article.id

    def test_get_draft(self, client, auth_headers, draft_article):
        res = client.get(f"/api/admin/articles/{draft_article.id}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["status"] == "draft"

    def test_get_nonexistent(self, client, auth_headers):
        res = client.get("/api/admin/articles/99999", headers=auth_headers)
        assert res.status_code == 404


class TestAdminUpdateArticle:
    def test_update_title(self, client, auth_headers, draft_article):
        res = client.put(
            f"/api/admin/articles/{draft_article.id}",
            json={"title": "Updated Title"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        assert res.json()["title"] == "Updated Title"

    def test_publish_draft(self, client, auth_headers, draft_article):
        res = client.put(
            f"/api/admin/articles/{draft_article.id}",
            json={"status": "published"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        assert res.json()["status"] == "published"

    def test_partial_update_preserves_other_fields(self, client, auth_headers, published_article):
        original_content = published_article.content
        res = client.put(
            f"/api/admin/articles/{published_article.id}",
            json={"title": "New Title Only"},
            headers=auth_headers,
        )
        assert res.status_code == 200
        assert res.json()["content"] == original_content

    def test_update_nonexistent(self, client, auth_headers):
        res = client.put("/api/admin/articles/99999", json={"title": "X"}, headers=auth_headers)
        assert res.status_code == 404

    def test_update_empty_title_rejected(self, client, auth_headers, draft_article):
        res = client.put(
            f"/api/admin/articles/{draft_article.id}",
            json={"title": "   "},
            headers=auth_headers,
        )
        assert res.status_code == 422


class TestAdminDeleteArticle:
    def test_delete_article(self, client, auth_headers, draft_article):
        res = client.delete(f"/api/admin/articles/{draft_article.id}", headers=auth_headers)
        assert res.status_code == 204

        # Confirm it's gone
        res = client.get(f"/api/admin/articles/{draft_article.id}", headers=auth_headers)
        assert res.status_code == 404

    def test_delete_nonexistent(self, client, auth_headers):
        res = client.delete("/api/admin/articles/99999", headers=auth_headers)
        assert res.status_code == 404

    def test_deleted_article_not_in_list(self, client, auth_headers, published_article):
        client.delete(f"/api/admin/articles/{published_article.id}", headers=auth_headers)
        res = client.get("/api/admin/articles", headers=auth_headers)
        ids = [a["id"] for a in res.json()]
        assert published_article.id not in ids
