## Lisanslar

- Kod: [GNU AGPL v3](./LICENSE)
- İçerik: [CC BY-NC-SA 4.0](./LICENSE.content.md)

# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
just clean-install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
just dev
```

## Production

> Run `just deploy` or `just v` after pushing to the remote in most cases; Cloudflare Pages will handle the rest.

Build the application for production:

```bash
just clean-generate
```

Locally preview production build:

```bash
just preview
```

Deploy to production server:

```bash
just deploy
```

### Semantic Versioning with deployment

Get the current version from package.json:

```bash
just version
```

Bump version:

```bash
just v <major|minor|patch>
```

Tag a pre-release version:

```bash
just v-pre <alpha|beta|rc>
```

## Linting

Lint code:

```bash
just lint
```

Fix linting issues:

```bash
just lint-fix
```

## Scripts

### Compress audio file:

64 kbps, 44.1 kHz, mono mp3

```bash
ffmpeg -i input.wav -ac 1 -ar 44100 -b:a 64k output.mp3
```


### Text-to-Speech (TTS)
```bash
pnpm run tts <path-to-markdown-file>
# Example: pnpm run tts content/tr/person/ibni-kemal.md
```

### Generate LLM Documentation Files
Generate `llms.txt` files for all persons (automatically runs after `pnpm generate`):
```bash
pnpm run generate-llms
```

LLM documentation files are automatically created during the build process:
- Main file: `/llms.txt` - Overview of the project
- Person files: `/person/[slug]/llms.txt` - Individual biographies