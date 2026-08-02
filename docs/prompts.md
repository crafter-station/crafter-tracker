# Set de prompts para generar los sprites (gpt-image-2 vía Codex)

> **Antes de generar**: guarda la imagen del crafternauta como `docs/mascot-reference.png`
> (este archivo aún no existe). sprite-forge la usa como referencia canónica de identidad
> para todas las poses; sin ella genera solo desde la descripción en texto.

En Codex desktop: el skill **sprite-forge** (`~/.codex/skills/sprite-forge`) ya conoce este
proyecto. El pedido puede ser tan simple como:

> Use sprite-forge with the crafter-tracker project spec. Generate all pending assets and
> put the finals in ~/Programming/crafter-station/tracker/public/sprites/

sprite-forge genera con `$imagegen` (gpt-image-2), quita el fondo chroma magenta, y pasa todo
por `pixelize.py` (downscale nearest-neighbor + quantize a la paleta). Abajo el detalle por si
quieres generarlos uno por uno o ajustar.

## Paleta del proyecto (pixelize quantiza contra esto)

```
#f5b700,#e09000,#0a0a0a,#f5e9c8,#ffffff,#00ff50,#ff4040,#96e0f7
```

## Bloque de estilo (prefijo de TODOS los prompts)

> 8-bit pixel art, hard pixel edges, no anti-aliasing, no gradients, no outlines thinner
> than 2px, limited flat palette, retro NES video game asset, centered subject filling most
> of the frame, solid uniform #ff00ff magenta background, no shadow on background

## 1. Pins de mapa (4) — destino `public/sprites/pin-<tipo>.png`, grid 32x32

El código ya los busca por nombre exacto y usa fallback CSS mientras no existan.
Al copiarlos, el swap es automático.

- **pin-shipped.png** — `[estilo] tiny map pin badge icon, rounded square with thick black
  pixel border and a small pointer notch at the bottom center, bright green #00ff50 flat
  fill, black astronaut helmet silhouette in the center, video game item icon`
- **pin-cooking.png** — igual pero `red #ff4040 flat fill, black question mark in the center`
- **pin-event.png** — igual pero `gold #f5b700 flat fill, black 4-point star in the center`
- **pin-drop.png** — igual pero `white #ffffff flat fill, black rocket silhouette in the center`
- **pin-crafter.png** — igual pero `light cyan #96e0f7 flat fill, black bold letter C in the center` (pins del core team, crafter.run/team)
- **pin-hack0.png** — igual pero `violet #b18cff flat fill, black number zero in the center` (eventos del calendario Hack0)

## 1b. Filter tabs (4) — destino `public/sprites/filter-<id>.png`, grid 50x40

Réplica del `filter_green/red/white.png` original: badge pixel redondeado, borde negro
grueso, brillo especular arriba-derecha, y una "oreja" rectangular que sobresale del
borde DERECHO al centro. Referencia de forma: `docs/reference-filter-tab.png` (el asset
real de Sony, solo como referencia de silueta — no copiar la araña).

- **filter-shipped.png** — verde #00ff50, silueta de casco de astronauta negra
- **filter-cooking.png** — rojo #ff4040, signo de interrogación negro
- **filter-hack0.png** — violeta #b18cff, número cero negro
- **filter-off.png** — blanco cálido #f5e9c8, casco negro (estado apagado, igual que el original usa blanco)

Prompt: `[estilo] small UI toggle button sprite, rounded square pixel badge with thick
black border, [color] flat fill, tiny white specular highlight near the top right corner,
a small rectangular tab ear sticking out of the right edge at vertical center, [glifo]
centered, retro video game map filter button`

El código ya los busca: cuando existan, reemplazan la forma CSS actual automáticamente
(mismo patrón onError que los pins).

Post: `pixelize.py <archivo> --grid 32x32 --palette "<paleta>"`

## 2. Crafternauta (4 poses) — destino `public/sprites/crafternaut-<pose>.png`, grid 64x96

Prompt base (usar la PRIMERA pose aprobada como imagen de referencia para las otras tres,
con "same character, same palette, same style"):

> [estilo] full-body sprite of a cheerful yellow-gold astronaut robot mascot, round helmet
> with black visor showing two big round white eyes and a small smile, gold spacesuit,
> hexagonal chest badge with the letter C, small antenna on the side of the helmet, chunky
> proportions with big head, [POSE], colors: #f5b700 gold, #e09000 dark gold shading,
> #0a0a0a black, #ffffff white

Poses:
- `idle-a` — standing front-facing, arms relaxed at sides
- `idle-b` — standing front-facing, arms relaxed, antenna light lit, eyes half closed mid-blink
- `wave` — standing front-facing, right arm raised waving
- `look-left` — head turned 45 degrees to its left, body front-facing

Post: `pixelize.py <archivo> --grid 64x96 --palette "<paleta>"`
(idle-a + idle-b alternados a 2fps = la animación de la esquina, estilo NES real)

## 3. Bitácora de misión: villanos del shipping (6) — `public/sprites/villain-<id>.png`, grid 96x96

> [estilo] retro video game villain portrait card of [CONCEPTO], dramatic pose, menacing but
> playful tone, dark navy #0a0a0a interior background, gold #f5b700 rim light accents

- `scope-creep` — amorphous blob monster made of overlapping sticky notes and checkboxes, tentacles grabbing more tasks
- `deadline` — menacing hourglass knight, sand pouring out of cracks in its armor
- `tutorial-hell` — hypnotic swirling portal made of stacked video-player windows with play buttons
- `vibecoder` — smug ghost typing on a floating keyboard, code raining around it that dissolves into smoke
- `merge-conflict` — two-headed dragon fighting itself, heads tangled in git branch lines
- `unknown` — dark silhouette with a giant pixel question mark, static noise texture

Post: `pixelize.py <archivo> --grid 96x96 --palette "<paleta>"`

## NO generar con IA

- ASCII/dots del preloader: script de dithering sobre el PNG real del crafternauta (pendiente en el repo).
- Logo header: es texto real (Bitcount) + bitBorder CSS.
- Marco, ticker, botones: CSS puro.
