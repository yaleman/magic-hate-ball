# Repository Guidelines

- You're not done until `just check` finishes without throwing errors.
- If you're asked to do something, don't leave stubs around, implement the request in full.
- If it seems like a lot of work or a vague request, ask for clarification.

## Project Structure & Module Organization

- `magic_hate_ball/` contains the FastAPI app, CLI entrypoint, templates, and static assets.
- Frontend sources live in `js/`, compiled output is written to `magic_hate_ball/static/js/`.
- Styles are in `magic_hate_ball/static/css/`.
- Tests are in `tests/`.

## Build, Test, and Development Commands

- `just run`: Build frontend assets and run the app with Hypercorn reload.
- `just js-build`: Build frontend assets via `pnpm build`.
- `just test`: Run `pytest`.
- `just fmt`: Check formatting with `ruff format --check`.
- `just lint`: Run `ty` and `mypy --strict` on `magic_hate_ball` and `tests`.
- `just pre-commit`: Install, update, and run all pre-commit hooks.

## Coding Style & Naming Conventions

- Python formatting uses Ruff (`ruff format --check`).
- Static typing is enforced with `mypy --strict` and `ty`.
- JavaScript/TypeScript builds use `swc` and `esbuild`; keep TS sources in `js/`.
- CSS linting uses Biome (`pnpm lint`).

## Testing Guidelines

- Tests run with `pytest`. Place new tests in `tests/` and name files like `test_*.py`.
- Favor FastAPI integration tests similar to `tests/test_fastapi.py`.

## Commit & Pull Request Guidelines

- Use short, imperative summaries (e.g., "Add response pool").
- PRs should describe behavior changes, link relevant issues, and include screenshots for UI changes.

## Security & Configuration Tips

- Python requires 3.14+ per `pyproject.toml`.
- Use `uv` for Python tooling (`uv run ...`), and `pnpm` for frontend dependencies.
