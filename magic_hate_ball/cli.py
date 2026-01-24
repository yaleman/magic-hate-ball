import click
import asyncio
from hypercorn import Config
from hypercorn.asyncio import serve
from magic_hate_ball import get_app  # noqa: F401


@click.command()
@click.option("--reload", is_flag=True, help="Enable auto-reload for development.")
def cli(reload: bool) -> None:
    port = 8000
    print(f"Starting on http://127.0.0.1:{port}")
    config = Config()
    config.use_reloader = reload
    config.bind = [f"0.0.0.0:{port}", f"127.0.0.1:{port}"]
    server = serve(get_app(), config)  # type: ignore[arg-type] # pyright: ignore[reportArgumentType]
    asyncio.run(server)
