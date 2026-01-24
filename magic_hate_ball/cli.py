import click
import uvicorn

from magic_hate_ball import get_app  # noqa: F401


@click.command()
@click.option("--reload", is_flag=True, help="Enable auto-reload for development.")
def cli(reload: bool) -> None:
    print("Welcome to the Magic Hate Ball!")
    port = 8000
    print(f"Starting on http://127.0.0.1:{port}")
    uvicorn.run(
        "magic_hate_ball:get_app",
        host="0.0.0.0",
        port=port,
        factory=True,
        reload=reload,
    )
