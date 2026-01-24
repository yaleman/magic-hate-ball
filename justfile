[private]
default:
    just --list

check:js-build
    SKIP=js-build-clean,js-build just pre-commit

pre-commit:
    uv run pre-commit run --all-files

test:
    uv run pre-commit run --all-files pytest

fmt:
    uv run pre-commit run  --all-files ruff-format

lint:
    uv run pre-commit run --all-files ty
    uv run pre-commit run --all-files mypy

# do the javscript checks
js: js-lint js-build

js-lint:
    uv run pre-commit run --all-files biome-check

js-build: js-lint
    pnpm build

# set up the pre-commit environment
pre-commit-setup:
    uv run pre-commit autoupdate
    uv run pre-commit install

run: js-build
    uv run hypercorn "magic_hate_ball.cli:get_app()" --reload

reload:
    uv run magic-hate-ball --reload
