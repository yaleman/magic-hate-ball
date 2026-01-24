[private]
default:
    just --list

check: fmt lint test pre-commit

test:
    uv run pytest

fmt:
    uv run ruff format --check

lint:
    uv run ty check
    uv run mypy --strict magic_hate_ball tests


js-build:
    pnpm build

pre-commit:
    uv run pre-commit install
    uv run pre-commit autoupdate
    uv run pre-commit run --all-files

run: js-build
    uv run hypercorn "magic_hate_ball.cli:get_app()" --reload

reload:
    uv run magic-hate-ball --reload
