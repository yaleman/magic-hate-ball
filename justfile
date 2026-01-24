[private]
default:
    just --list

# run all the things
check: js-build
    SKIP=js-build-clean,js-build just pre-commit
    semgre p.

test:
    uv run pre-commit run --all-files pytest

fmt:
    uv run pre-commit run  --all-files ruff-format

lint:
    uv run pre-commit run --all-files ty
    uv run pre-commit run --all-files mypy

# do the javscript checks
js: js-lint js-build

# lint all the js and css
js-lint:
    uv run pre-commit run --all-files biome-check

js-build: js-lint
    pnpm build

# set up the pre-commit environment
pre-commit-setup:
    uv run pre-commit autoupdate
    uv run pre-commit install

# run it locally
run: js-build
    uv run magic-hate-ball

# docker build step
docker-build:
    docker build -t ghcr.io/yaleman/magic-hate-ball:latest .

# build and run the docker container
docker-run: docker-build
    docker run -p 8000:8000 ghcr.io/yaleman/magic-hate-ball:latest

semgrep:
    uv run pre-commit run --all-files semgrep-scan --verbose
