# Resumate CSS Architecture

## 📁 File Structure

```
frontend/src/
├── app/
│   └── globals.css          # Main entry point (only imports)
└── styles/
    ├── 00-tokens.css        # Design tokens (variables)
    ├── 01-base.css          # Base styles, reset, typography
    ├── 02-components.css    # Component styles
    ├── 03-responsive.css    # Media queries & responsive
    └── 04-dark-mode.css     # Dark mode theme
```

## 🎯 Architecture Principles

### 1. **Modular** 
- Each file has a single responsibility
- Easy to locate and modify specific styles
- Reduces cognitive load

### 2. **Scalable**
- Add new component styles to `02-components.css`
- Add new tokens to `00-tokens.css`
- Add responsive breakpoints to `03-responsive.css`

### 3. **Maintainable**
- Clear naming conventions
- Documented structure
- Easy to refactor

## 📚 File Descriptions

### `00-tokens.css`
**Purpose**: All CSS custom properties (design tokens)

**Contains**:
- Color system (primary, secondary, neutral, status)
- Typography scale (sizes, line heights, fonts)
- Spacing scale
- Border radius
- Shadows
- Transitions
- Z-index layers
- Container sizes

**Usage**:
```css
.my-component {
  color: var(--color-primary);
  padding: var(--space-4);
}
```

### `01-base.css`
**Purpose**: HTML element styles and accessibility

**Contains**:
- HTML/body/base styles
- Typography (headings, links)
- Accessibility (focus, screen reader, reduced motion)
- Performance optimizations
- Print styles

### `02-components.css`
**Purpose**: Reusable component styles

**Contains**:
- Buttons (`.btn`, `.btn-primary`)
- Cards (`.card`)
- Forms (`.form-input`, `.form-label`)
- Modals (`.modal-overlay`)
- Navigation (`.nav`, `.nav-item`)
- Badges (`.badge-primary`)
- Alerts (`.alert-success`)
- Legacy portfolio components

### `03-responsive.css`
**Purpose**: Responsive design & media queries

**Contains**:
- Desktop (1600px)
- Tablet (1024px)
- Mobile (768px)
- Small mobile (480px)
- Landscape modes

### `04-dark-mode.css`
**Purpose**: Dark theme support

**Contains**:
- System preference detection
- Manual `.dark` class support
- Dark mode color overrides
- Component dark variants

## 🚀 Best Practices

### 1. Use Tailwind Where Possible
Instead of creating custom utility classes, use Tailwind utilities:
```html
<!-- ✅ Good -->
<div class="flex items-center gap-4 p-6">

<!-- ❌ Bad -->
<div class="my-custom-flex-container">
```

### 2. Use CSS Variables
Always use design tokens:
```css
/* ✅ Good */
.my-component {
  color: var(--color-primary);
  padding: var(--space-4);
}

/* ❌ Bad */
.my-component {
  color: #55527c;
  padding: 16px;
}
```

### 3. Component Classes
For reusable component patterns:
```css
/* In 02-components.css */
.my-button {
  /* component styles */
}
```

### 4. Dark Mode Support
Use CSS variables that respond to `.dark` class:
```css
.my-component {
  background-color: var(--color-white);
}

.dark .my-component {
  background-color: var(--surface-primary);
}
```

## 🔧 Adding New Styles

### Add a new token:
```css
/* In 00-tokens.css */
:root {
  --my-custom-spacing: 1rem;
}
```

### Add a new component:
```css
/* In 02-components.css */
.my-new-component {
  /* styles */
}
```

### Add a new breakpoint:
```css
/* In 03-responsive.css */
@media (max-width: 1400px) {
  /* styles */
}
```

## 📊 Before vs After

| Metric | Before | After |
|--------|--------|-------|
| File Size | 2095 lines | ~15 lines main |
| Organization | Monolithic | Modular (5 files) |
| Duplication | High | Low |
| Maintainability | Medium | High |
| Findability | Hard | Easy |

## 🎨 Design System

All design decisions are stored as tokens in `00-tokens.css`. This ensures:
- Consistent spacing, colors, and typography
- Easy theme changes
- Centralized design language

## 📝 Notes

- **Legacy code**: Old portfolio styles (`.portfolio-card`, `.elisc_tm_button`) are kept for backward compatibility
- **Tailwind**: Most utility classes removed in favor of Tailwind
- **Semantic aliases**: Removed redundant aliases like `--main-color` (use `--color-primary`)
