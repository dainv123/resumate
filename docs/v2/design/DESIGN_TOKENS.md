# Design Tokens

## Spacing
Scale: 4/8/12/16/24/32/48/64. Default gap: 16. Section gap: 32.

## Radius
sm=6 (input, button), md=10 (card), lg=14 (dialog, sheet), full for pills.

## Typography
Font: Geist Sans (fallback Inter).
- display: 28px / 32 line / -0.02 tracking / 600
- h1: 20px / 28 / -0.01 / 600
- h2: 16px / 24 / 0 / 600
- h3: 14px / 20 / 0 / 600
- body: 14px / 20 / 0 / 400
- body-sm: 13px / 18 / 0 / 400
- caption: 12px / 16 / 0.01 / 500

## Color (Tailwind CSS vars, light + dark)
shadcn/ui HSL convention (`--token: H S% L%`). Applied via `hsl(var(--token))`.

### Light
```css
--background: 0 0% 100%;
--foreground: 240 10% 3.9%;
--card: 0 0% 100%;
--card-foreground: 240 10% 3.9%;
--muted: 240 4.8% 95.9%;
--muted-foreground: 240 3.8% 46.1%;
--border: 240 5.9% 90%;
--input: 240 5.9% 90%;
--ring: 240 5.9% 10%;
--primary: 240 5.9% 10%;
--primary-foreground: 0 0% 98%;
--secondary: 240 4.8% 95.9%;
--secondary-foreground: 240 5.9% 10%;
--destructive: 0 84.2% 60.2%;
--destructive-foreground: 0 0% 98%;
/* Stage semantic */
--stage-applied: 240 5% 64%;          /* neutral */
--stage-screening: 221 83% 53%;       /* blue */
--stage-interview: 38 92% 50%;        /* amber */
--stage-offer: 142 71% 45%;           /* green */
--stage-closed: 240 3.8% 46.1%;       /* muted */
```

### Dark
```css
--background: 240 10% 3.9%;
--foreground: 0 0% 98%;
--card: 240 10% 3.9%;
--card-foreground: 0 0% 98%;
--muted: 240 3.7% 15.9%;
--muted-foreground: 240 5% 64.9%;
--border: 240 3.7% 15.9%;
--input: 240 3.7% 15.9%;
--ring: 240 4.9% 83.9%;
--primary: 0 0% 98%;
--primary-foreground: 240 5.9% 10%;
--secondary: 240 3.7% 15.9%;
--secondary-foreground: 0 0% 98%;
--destructive: 0 62.8% 30.6%;
--destructive-foreground: 0 0% 98%;
/* Stage semantic */
--stage-applied: 240 5% 64%;
--stage-screening: 217 91% 60%;
--stage-interview: 43 96% 56%;
--stage-offer: 142 69% 58%;
--stage-closed: 240 5% 64.9%;
```

### Token map
- background, foreground
- card, card-foreground
- muted, muted-foreground
- border, input, ring
- primary, primary-foreground
- secondary, secondary-foreground
- destructive, destructive-foreground
- Stage semantic:
  - stage-applied: neutral
  - stage-screening: blue
  - stage-interview: amber
  - stage-offer: green
  - stage-closed: muted

Each value is HSL, one set light + one set dark. Match shadcn/ui convention exactly.

## Icon
Lucide. 16 in buttons, 18 in table rows, 20 in nav, 24 in headers.

## Density
Comfortable default. Compact toggle in Settings (row height 40→32).

## Motion
- fast: 120ms ease-out (hover)
- base: 200ms ease-out (dialog, sheet)
- slow: 300ms ease-out (route transition)
No spring physics. No bouncing.

## Breakpoints
sm=640, md=768, lg=1024, xl=1280, 2xl=1536.
Table full columns at >= xl. Card grid 1→2→3 cols at sm→lg→xl.
