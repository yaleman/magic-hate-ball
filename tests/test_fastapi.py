from fastapi import FastAPI
from fastapi.testclient import TestClient
import pytest

from magic_hate_ball import get_app


@pytest.fixture(scope="module")
def app() -> FastAPI:
    return get_app()


def test_homepage(app: FastAPI) -> None:
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert "Magic Hate Ball!" in response.text

    response = client.get("/")
    assert response.status_code == 200
    assert "Magic Hate Ball!" in response.text


def test_healthcheck(app: FastAPI) -> None:
    client = TestClient(app)
    response = client.get("/health")
    assert response.status_code == 200
    assert response.text == '"OK"'


def test_static_files(app: FastAPI) -> None:
    """ensure we're finding the static files correctly"""
    client = TestClient(app)

    css_response = client.get("/static/css/styles.css")
    assert css_response.status_code == 200
    assert "text/css" in css_response.headers["content-type"]
    for file in ["main.js", "draw-scene.js", "init-buffers.js", "programinfo.js"]:
        js_response = client.get(f"/static/js/{file}")
        assert js_response.status_code == 200
        assert "application/javascript" in js_response.headers["content-type"]

    js_response = client.get("/static/js/lolololol")
    assert js_response.status_code == 404
    assert "application/json" in js_response.headers["content-type"]
    assert js_response.json() == {"detail": "File not found"}


def test_answers(app: FastAPI) -> None:
    """test the /answer and /answers endpoints"""
    client = TestClient(app)

    answer_response = client.get("/answer")
    assert answer_response.status_code == 200
    assert "answer" in answer_response.json()
    assert answer_response.json()["answer"] != ""

    assert isinstance(answer_response.json()["answer"], str)

    answers_response = client.get("/answers")
    assert answers_response.status_code == 200
    assert "answers" in answers_response.json()
    assert len(answers_response.json()["answers"]) == 4
