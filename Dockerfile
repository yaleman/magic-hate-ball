FROM node:24-slim AS js-builder

WORKDIR /app

COPY package.json pnpm-lock.yaml build-js.js ./
COPY js ./js
COPY magic_hate_ball/static ./magic_hate_ball/static

RUN corepack enable \
    && pnpm install --frozen-lockfile \
    && pnpm build

FROM python:3.14-rc-slim AS app

ENV PYTHONUNBUFFERED=1
WORKDIR /app

COPY pyproject.toml README.md ./
COPY magic_hate_ball ./magic_hate_ball
COPY --from=js-builder /app/magic_hate_ball/static/js ./magic_hate_ball/static/js

RUN pip install --no-cache-dir .
RUN adduser --disabled-password --gecos "" nonroot


USER nonroot
CMD ["magic-hate-ball"]
