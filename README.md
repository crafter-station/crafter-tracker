# Crafter Tracker

Mapa 8-bit en vivo de los ships, cooking sessions y eventos de la comunidad
[Crafter Station](https://crafterstation.com). Clon estructural del Spidey Tracker de Sony,
piel gold/black CS.

## Pins

| Tipo | Color | Regla |
|---|---|---|
| SHIPPED | verde | Link verificable (deploy, PR, demo) |
| COOKING | rojo | Solo un handle y una frase. El pin se vuelve verde cuando entregas el link |
| EVENTO | gold | Code Brew, hackathons, Ship or Sink (Luma) |
| DROP | blanco + ondas | Anuncios grandes, max 1-2 activos |

## Stack

Next.js + Bun + Biome + Tailwind + [mapcn](https://www.mapcn.dev) (MapLibre GL, tiles CARTO
dark). Sin motor de juego: el look 8-bit es CSS (`bit-border` con clip-path, scanlines,
fuentes Bitcount + Press Start 2P) y sprites PNG con `image-rendering: pixelated`.

Los sprites se generan con gpt-image-2 vía el skill `sprite-forge` de Codex y el postprocess
determinista `pixelize.py`. Set de prompts: [`docs/prompts.md`](docs/prompts.md). Mientras
`public/sprites/` esté vacío, los pins usan fallback CSS automático.

## Dev

```bash
bun install
bun dev
```

Los pins viven en `data/main.json` (schema en `lib/tracker.ts`).
