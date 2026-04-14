"""
Unit tests for public article endpoints:
  GET  /api/articles
  GET  /api/articles/{id}
  POST /api/articles/{id}/like
"""


class TestListPublishedArticles:
    def test_returns_only_published(self, client, published_article, draft_article):
        res = client.get("/api/articles")
        assert res.status_code == 200
        ids = [a["id"] for a in res.json()]
        assert published_article.id in ids
        assert draft_article.id not in ids

    def test_empty_when_no_articles(self, client):
        res = client.get("/api/articles")
        assert res.status_code == 200
        assert res.json() == []

    def test_response_shape(self, client, published_article):
        res = client.get("/api/articles")
        assert res.status_code == 200
        article = res.json()[0]
        for field in ("id", "title", "summary", "view_count", "like_count", "created_at"):
            assert field in article
        # content must NOT be exposed in listing
        assert "content" not in article


class TestGetArticle:
    def test_get_published_article(self, client, published_article):
        res = client.get(f"/api/articles/{published_article.id}")
        assert res.status_code == 200
        data = res.json()
        assert data["id"] == published_article.id
        assert data["title"] == published_article.title
        assert "content" in data

    def test_increments_view_count(self, client, published_article):
        initial = published_article.view_count
        client.get(f"/api/articles/{published_article.id}")
        res = client.get(f"/api/articles/{published_article.id}")
        assert res.json()["view_count"] == initial + 2

    def test_draft_returns_404(self, client, draft_article):
        res = client.get(f"/api/articles/{draft_article.id}")
        assert res.status_code == 404

    def test_nonexistent_returns_404(self, client):
        res = client.get("/api/articles/99999")
        assert res.status_code == 404


class TestLikeArticle:
    def test_like_increments_count(self, client, published_article):
        initial = published_article.like_count
        res = client.post(f"/api/articles/{published_article.id}/like")
        assert res.status_code == 200
        assert res.json()["like_count"] == initial + 1

    def test_like_draft_returns_404(self, client, draft_article):
        res = client.post(f"/api/articles/{draft_article.id}/like")
        assert res.status_code == 404

    def test_like_nonexistent_returns_404(self, client):
        res = client.post("/api/articles/99999/like")
        assert res.status_code == 404
