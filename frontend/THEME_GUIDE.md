# Resumate Theme Guide

## 🎨 Theme Variables

Chúng ta sử dụng CSS variables để đảm bảo tính nhất quán trong toàn bộ ứng dụng:

```css
:root {
  --main-color: #55527c;      /* Màu chính */
  --dark-color: #130f49;      /* Màu tối */
  --yellow-color: #ff972d;    /* Màu vàng */
  --blue-color: #a5a6ff;      /* Màu xanh */
  --font-inter: "Inter", sans-serif;
  --font-karla: "Karla", sans-serif;
  --font-kristi: "Kristi", cursive;
}
```

## 🔤 Typography

### Font Families
- **Inter**: Sử dụng cho headings (h1, h2, h3, h4, h5, h6)
- **Karla**: Sử dụng cho body text và các elements khác
- **Kristi**: Sử dụng cho decorative text

### Utility Classes
```css
.font-inter    /* Inter font family */
.font-karla    /* Karla font family */
.font-kristi   /* Kristi font family */
```

## 🎨 Color System

### Text Colors
```css
.text-main     /* Màu chính (#55527c) */
.text-dark     /* Màu tối (#130f49) */
.text-blue     /* Màu xanh (#a5a6ff) */
.text-yellow   /* Màu vàng (#ff972d) */
```

### Background Colors
```css
.bg-main       /* Background màu chính */
.bg-dark       /* Background màu tối */
.bg-blue       /* Background màu xanh */
.bg-yellow     /* Background màu vàng */
```

### Border Colors
```css
.border-main   /* Border màu chính */
.border-dark   /* Border màu tối */
.border-blue   /* Border màu xanh */
.border-yellow /* Border màu vàng */
```

## 🧩 Component Guidelines

### Buttons
```tsx
// Primary button
<Button variant="primary">Click me</Button>

// Outline button
<Button variant="outline">Click me</Button>

// Secondary button
<Button variant="secondary">Click me</Button>
```

### Typography
```tsx
// Headings sử dụng font-inter
<h1 className="font-inter text-dark">Main Heading</h1>

// Body text sử dụng font-karla
<p className="font-karla text-main">Body text</p>
```

### Navigation
```tsx
// Active state
<Link className="bg-blue text-white font-karla">Active Link</Link>

// Inactive state
<Link className="text-main hover:text-dark font-karla">Inactive Link</Link>
```

## 📱 Responsive Design

Theme đã được tối ưu cho responsive design:

```css
/* Mobile */
@media (max-width: 768px) {
  body { font-size: 14px; line-height: 24px; }
  h1 { font-size: 35px; }
  h2 { font-size: 28px; }
  h3 { font-size: 24px; }
}

/* Tablet */
@media (max-width: 1040px) {
  .portfolio-card { padding: 40px 30px; }
}

/* Desktop */
@media (max-width: 1600px) {
  body { font-size: 16px; line-height: 30px; }
  h1 { font-size: 40px; }
  h2 { font-size: 32px; }
  h3 { font-size: 26px; }
}
```

## 🎯 Best Practices

1. **Luôn sử dụng utility classes** thay vì inline styles
2. **Sử dụng font-karla cho body text** và font-inter cho headings
3. **Sử dụng color variables** thay vì hardcode màu
4. **Áp dụng transition effects** cho interactive elements
5. **Đảm bảo contrast ratio** đủ cho accessibility

## 🔧 Customization

Để thay đổi theme, chỉ cần cập nhật CSS variables trong `globals.css`:

```css
:root {
  --main-color: #your-color;
  --dark-color: #your-color;
  --yellow-color: #your-color;
  --blue-color: #your-color;
}
```

Tất cả components sẽ tự động cập nhật theo theme mới!