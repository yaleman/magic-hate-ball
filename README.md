# magic-hate-ball

Simple app to show a Magic 8 Ball with stupid answers. Probably making jokes about AI.

## Running it

```shell
$ uv run magic-hate-ball
# or
$ uvx --from 'git+https://github.com/yaleman/magic-hate-ball' magic-hate-ball
```

## Docker

Build the image:

```sh
docker build -t magic-hate-ball .
```

Run the container:

```sh
docker run --rm -p 8000:8000 magic-hate-ball
```
