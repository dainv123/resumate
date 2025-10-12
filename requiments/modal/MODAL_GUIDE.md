# Modal Component Guide

## Common Modal Component

Một BaseModal component tái sử dụng được cho toàn bộ ứng dụng.

## Features

✅ **Responsive** - Tự động responsive trên mobile/desktop  
✅ **Animations** - Fade in backdrop, slide up modal  
✅ **ESC to close** - Tự động đóng khi nhấn ESC  
✅ **Click outside** - Đóng khi click ra ngoài (tuỳ chọn)  
✅ **Prevent scroll** - Ngăn body scroll khi modal mở  
✅ **Flexible sizes** - sm, md, lg, xl, 2xl, full  
✅ **Custom styling** - Header, body, footer đều custom được  

## Basic Usage

```tsx
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="My Modal Title"
        footer={
          <Button onClick={() => setIsOpen(false)}>Close</Button>
        }>
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | - | Trạng thái mở/đóng modal |
| `onClose` | `() => void` | - | Callback khi đóng modal |
| `title` | `string` | - | Tiêu đề modal (optional) |
| `children` | `ReactNode` | - | Nội dung modal |
| `footer` | `ReactNode` | - | Footer content (optional) |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "2xl" \| "full"` | `"lg"` | Kích thước modal |
| `closeOnOverlayClick` | `boolean` | `true` | Cho phép đóng khi click overlay |
| `showCloseButton` | `boolean` | `true` | Hiển thị nút close (X) |
| `className` | `string` | - | Custom class cho modal container |
| `headerClassName` | `string` | - | Custom class cho header |
| `bodyClassName` | `string` | - | Custom class cho body |
| `footerClassName` | `string` | - | Custom class cho footer |

## Examples

### 1. Simple Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Simple Modal">
  <p>This is a simple modal</p>
</Modal>
```

### 2. Modal with Custom Footer

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirm Action"
  footer={
    <>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleConfirm}>
        Confirm
      </Button>
    </>
  }>
  <p>Are you sure you want to continue?</p>
</Modal>
```

### 3. Large Modal with Custom Header

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="2xl"
  headerClassName="bg-gradient-to-r from-blue-50 to-indigo-50"
  footer={<Button onClick={onClose}>Close</Button>}>
  {/* Custom header */}
  <div className="flex items-center gap-3 -mt-6 mb-6">
    <FileText className="h-6 w-6 text-blue-600" />
    <div>
      <h3 className="text-lg font-bold">Custom Header</h3>
      <p className="text-sm text-gray-600">With icon and description</p>
    </div>
  </div>

  {/* Content */}
  <div className="space-y-4">
    <p>Your content here...</p>
  </div>
</Modal>
```

### 4. Full Screen Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  size="full"
  title="Full Screen Modal">
  <div className="min-h-screen">
    Full screen content
  </div>
</Modal>
```

### 5. Modal Without Close Button

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Important Message"
  showCloseButton={false}
  closeOnOverlayClick={false}
  footer={
    <Button onClick={handleAcknowledge}>
      I Understand
    </Button>
  }>
  <p>Please read this important message carefully.</p>
</Modal>
```

### 6. Form Modal

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Profile"
  size="lg"
  footer={
    <>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </>
  }>
  <form className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-1">Name</label>
      <input
        type="text"
        className="w-full px-3 py-2 border rounded-lg"
        {...register("name")}
      />
    </div>
    <div>
      <label className="block text-sm font-medium mb-1">Email</label>
      <input
        type="email"
        className="w-full px-3 py-2 border rounded-lg"
        {...register("email")}
      />
    </div>
  </form>
</Modal>
```

## Refactoring Existing Modals

### Before (Old Pattern)

```tsx
export default function MyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between p-6 border-b">
          <h3>Title</h3>
          <button onClick={onClose}>×</button>
        </div>
        <div className="p-6">
          Content
        </div>
        <div className="p-6 border-t">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
```

### After (Using BaseModal)

```tsx
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function MyModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Title"
      footer={<Button onClick={onClose}>Close</Button>}>
      Content
    </Modal>
  );
}
```

## Size Reference

| Size | Max Width | Best For |
|------|-----------|----------|
| `sm` | `max-w-md` (28rem) | Confirmations, alerts |
| `md` | `max-w-lg` (32rem) | Simple forms |
| `lg` | `max-w-2xl` (42rem) | Standard forms, content |
| `xl` | `max-w-4xl` (56rem) | Large forms, detailed views |
| `2xl` | `max-w-7xl` (80rem) | Wide content, data tables |
| `full` | `max-w-full` | Full screen modals |

## Keyboard Shortcuts

- `ESC` - Close modal (if `onClose` provided)
- `Click outside` - Close modal (if `closeOnOverlayClick` is true)

## Accessibility

- ✅ Focus trap (body scroll prevented)
- ✅ ESC key support
- ✅ ARIA labels
- ✅ Semantic HTML

## Animations

- **Backdrop**: 200ms fade in
- **Modal**: 300ms slide up from bottom
- Smooth transitions for better UX

## Notes

- Modal automatically prevents body scroll when open
- Header and footer are optional
- Custom styling supported for all sections
- Works with all screen sizes

