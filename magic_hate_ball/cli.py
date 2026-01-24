import click
import asyncio
from hypercorn import Config
from hypercorn.asyncio import serve
from magic_hate_ball import get_app  # noqa: F401


@click.command()
def cli() -> None:
    port = 8000
    config = Config()
    config.bind = [f"0.0.0.0:{port}"]
    print(f"Starting on {[f'http://{address}' for address in config.bind]}")
    server = serve(get_app(), config)  # type: ignore[arg-type] # pyright: ignore[reportArgumentType]
    asyncio.run(server)
