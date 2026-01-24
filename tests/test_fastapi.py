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


def test_answers(app: FastAPI) -> None:
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
