from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

from magic_hate_ball import get_app


@pytest.fixture(scope="module")
def app() -> FastAPI:
    return get_app()


def test_homepaget(app: FastAPI) -> None:
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert "Magic Hate Ball!" in response.text


def test_healthcheck(app: FastAPI) -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.text == '"OK"'


def test_static_files(app: FastAPI) -> None:
    client = TestClient(app)

    css_response = client.get("/static/css/styles.css")
    assert css_response.status_code == 200
    assert "text/css" in css_response.headers["content-type"]

    js_response = client.get("/static/js/main.js")
    assert js_response.status_code == 200
    assert "application/javascript" in js_response.headers["content-type"]
