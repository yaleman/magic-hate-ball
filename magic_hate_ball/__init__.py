from pathlib import Path
from dataclasses import dataclass
import random
import sys

from fastapi import FastAPI
from fastapi.responses import HTMLResponse, FileResponse

from .responses import RESPONSES
import magic_hate_ball.templates as templates


@dataclass
class Answer:
    """answer response from the API"""

    answer: str


@dataclass
class Answers:
    """answers response from the API"""

    answers: list[str]


def get_app() -> FastAPI:
    print("Welcome to the Magic Hate Ball!", file=sys.stderr)
    app = FastAPI()

    @app.get("/")
    async def index() -> HTMLResponse:
        """main page"""
        return HTMLResponse(content=templates.INDEX_HTML, status_code=200)

    @app.get("/answer")
    async def get_answer() -> Answer:
        """get a random answer"""
        return Answer(answer=random.choice(RESPONSES))

    @app.get("/answers")
    async def get_answers() -> Answers:
        """get some random answers"""
        return Answers(answers=random.choices(RESPONSES, k=4))

    @app.get("/health")
    async def health_check() -> str:
        """health check endpoint"""
        return "OK"

    @app.get("/static/css/styles.css")
    async def get_css() -> FileResponse:
        """serve styles.css"""
        return FileResponse(Path(__file__).parent / "static/css/styles.css")

    @app.get("/static/js/main.js")
    async def get_js() -> FileResponse:
        """serve main.js"""
        return FileResponse(
            Path(__file__).parent / "static/js/main.js",
            media_type="application/javascript",
        )

    return app
