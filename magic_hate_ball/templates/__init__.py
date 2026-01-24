from pathlib import Path

__all__ = ["get_template_path", "INDEX_HTML"]


def get_template_path(filename: str) -> Path:
    result = Path(__file__).parent / filename
    if result.exists():
        return result
    raise FileNotFoundError(f"Template {result} not found.")


INDEX_HTML = get_template_path("index.html").read_text(encoding="utf-8")
