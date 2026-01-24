from pathlib import Path
from dataclasses import dataclass
import random
import sys


from aiocache import cached, Cache  # type: ignore[import-untyped]
from aiocache.serializers import PickleSerializer  # type: ignore[import-untyped]
from fastapi import FastAPI
from fastapi.exceptions import HTTPException
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
    @cached(ttl=3600, cache=Cache.MEMORY, serializer=PickleSerializer())  # type: ignore[untyped-decorator]
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
    @cached(ttl=3600, cache=Cache.MEMORY, serializer=PickleSerializer())  # type: ignore[untyped-decorator]
    async def get_css() -> FileResponse:
        """serve styles.css"""
        return FileResponse(Path(__file__).parent / "static/css/styles.css")

    @app.get("/static/js/{filename:str}")
    @cached(ttl=3600, cache=Cache.MEMORY, serializer=PickleSerializer())  # type: ignore[untyped-decorator]
    async def get_js(filename: str) -> FileResponse:
        """serve main.js"""
        filepath = Path(__file__).parent / f"static/js/{filename}"
        if not filepath.exists():
            raise HTTPException(status_code=404, detail="File not found")
        return FileResponse(
            str(filepath),
            media_type="application/javascript",
        )

    return app
