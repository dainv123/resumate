# Phase 2 — Design system spec (rev 6.1)

## Brand & primary intent

| Token | Value | Role |
|-------|--------|------|
| `--foreground` / `--primary` | `#130F49` | Text + **primary buttons** (navy) |
| `--primary-foreground` | `#FFFFFF` | On primary |
| `--muted-foreground` | `#55527C` | Secondary text |
| `--accent` | `#FF972D` | Urgency / interviewing **indicator only** — không dùng làm chữ trên trắng |
| `--accent-foreground` | `#7A3F00` | Text trên accent wash (~7:1) |
| `--background` | `#F7F7FA` | App bg |
| `--card` | `#FFFFFF` | Surfaces |
| `--border` | `#E4E4EC` | Borders |
| `--destructive` | `#DC2626` | Danger |
| `--ring` | `#A5A6FF` | Focus ring (visible on navy primary) |
| `--radius` | `0.5rem` | |

**DECISIONS:** Primary button = navy, không orange — (1) accent fail WCAG làm body text trên trắng (~2.1:1), (2) tone serious tool, (3) orange reserved interviewing/urgency.

### StatusBadge `interviewing`

```
bg: accent/15
text: accent-foreground (#7A3F00)
border: accent/30
```

Không `text-accent` (#FF972D) trên nền trắng.

Karla/landing fonts: dashboard dùng **Inter** 15–16px. Kristi chỉ portfolio public.

## Typography / spacing

title 20/28 · subtitle 14/20 · body 15/22 · body-sm 13/18 · label 13/18 · caption 12/16  
Spacing 4·8·12·16·24·32·48 · Page pad mobile 16 / desktop 24–32

## Chrome

AppShell (Sidebar + Sheet) · PageHeader (1 primary) · EmptyState · DataList · StatusBadge · ConfirmDialog (AlertDialog)  
Sticky stack: [03a §11](./03a-status-primary-redirects.md)  
Mobile header: `[←] Title [⋯]`  
Practice: fullscreen top bar Back · progress · Exit  

## Pattern → shadcn

sidebar, sheet, button, breadcrumb, table, tabs, form controls, alert-dialog, sonner, skeleton, dropdown-menu, avatar, badge, separator, tooltip  

Kit cũ giữ đến hết import.

## Rules

1 primary / màn · Empty 1 câu + 1 CTA · Focus ring shadcn · Touch ≥40px · EN/VI labels ngắn  
Plan badge trong user menu: `Name · Free|Pro`  
AI done: toast **và** notification bell (PR5)
