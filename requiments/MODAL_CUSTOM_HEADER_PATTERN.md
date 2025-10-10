# Modal Custom Header Pattern

## ✅ Cập nhật hoàn thành

Modal component giờ hỗ trợ **custom header với React.ReactNode**!

---

## 📝 Pattern: Custom Header trong Modal

### Before (Old way):
```tsx
<Modal isOpen={isOpen} onClose={onClose}>
  {/* Header hack với negative margin */}
  <div className="flex items-center -mt-6 mb-6">
    <Icon className="h-6 w-6" />
    <div>
      <h3>Title</h3>
      <p>Subtitle</p>
    </div>
  </div>
  
  {/* Content */}
  <div>...</div>
</Modal>
```

❌ **Problems:**
- Negative margin hack (-mt-6)
- Header in body (không semantic)
- Không reusable
- Spacing inconsistent

---

### After (New way):
```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  headerClassName="bg-gradient-to-r from-green-50 to-blue-50"
  title={
    <div className="flex items-center">
      <Icon className="h-6 w-6 text-green-600 mr-3" />
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Title
        </h3>
        <p className="text-sm text-gray-600">Subtitle</p>
      </div>
    </div>
  }
>
  {/* Content - no hacks needed */}
  <div>...</div>
</Modal>
```

✅ **Benefits:**
- Semantic HTML structure
- No margin hacks
- Custom gradient backgrounds
- Reusable pattern
- Better accessibility

---

## 🎨 Modal Component Updates

### 1. Interface Updated
```typescript
export interface ModalProps {
  title?: string | React.ReactNode;  // ← Now accepts ReactNode
  // ... other props
}
```

### 2. Render Logic
```tsx
{title && (
  typeof title === 'string' ? (
    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
  ) : (
    <div className="flex-1">{title}</div>
  )
)}
```

---

## 📋 Usage Examples

### Example 1: Simple String Title
```tsx
<Modal
  title="Edit Profile"
  isOpen={isOpen}
  onClose={onClose}
>
  {/* Content */}
</Modal>
```

### Example 2: Icon + Title
```tsx
<Modal
  title={
    <div className="flex items-center gap-3">
      <User className="h-6 w-6 text-blue-600" />
      <h3 className="text-xl font-bold">User Profile</h3>
    </div>
  }
  isOpen={isOpen}
  onClose={onClose}
>
  {/* Content */}
</Modal>
```

### Example 3: Title + Subtitle (like JobDescriptionModal)
```tsx
<Modal
  headerClassName="bg-gradient-to-r from-green-50 to-blue-50"
  title={
    <div className="flex items-center">
      <Briefcase className="h-6 w-6 text-green-600 mr-3" />
      <div>
        <h3 className="text-xl font-semibold text-gray-900">
          Job Description
        </h3>
        <p className="text-sm text-gray-600">{jobTitle}</p>
      </div>
    </div>
  }
>
  {/* Content */}
</Modal>
```

### Example 4: Complex Header with Actions
```tsx
<Modal
  title={
    <div className="flex items-center justify-between flex-1">
      <div className="flex items-center gap-3">
        <Badge className="h-6 w-6 text-purple-600" />
        <div>
          <h3 className="text-xl font-bold">Premium Feature</h3>
          <p className="text-xs text-gray-500">Upgrade required</p>
        </div>
      </div>
      <button className="text-sm text-blue-600 hover:underline">
        Learn more
      </button>
    </div>
  }
>
  {/* Content */}
</Modal>
```

---

## 🎯 Custom Header Backgrounds

Use `headerClassName` prop:

```tsx
// Gradient backgrounds
headerClassName="bg-gradient-to-r from-blue-50 to-indigo-50"
headerClassName="bg-gradient-to-r from-green-50 to-blue-50"
headerClassName="bg-gradient-to-r from-purple-50 to-pink-50"

// Solid colors
headerClassName="bg-blue-50"
headerClassName="bg-green-50"
headerClassName="bg-gray-50"

// With custom styling
headerClassName="bg-gradient-to-r from-orange-50 to-red-50 border-b-2 border-orange-200"
```

---

## ✅ Updated Files

1. **Modal.tsx**
   - Interface: `title?: string | React.ReactNode`
   - Render logic updated

2. **JobDescriptionModal.tsx**
   - Moved custom header to `title` prop
   - Removed negative margin hack
   - Added gradient background

---

## 🔄 Migration Checklist

To migrate existing modals:

- [ ] Find modals with custom headers in body
- [ ] Look for negative margins (-mt-6, etc.)
- [ ] Move header JSX to `title` prop
- [ ] Remove margin hacks
- [ ] Add `headerClassName` for custom styling
- [ ] Test visual appearance
- [ ] Verify close button position

---

## 🎨 Design System

### Header Styles
```css
Default:
  bg-gradient-to-r from-blue-50 to-indigo-50
  border-b border-gray-200
  p-6

Custom Icon Colors:
  - Blue: Analytics, Info
  - Green: Success, Jobs
  - Purple: Premium, AI
  - Orange: Warnings
  - Red: Errors, Delete
```

### Typography
```tsx
Title: text-xl font-semibold text-gray-900
Subtitle: text-sm text-gray-600
Icon: h-6 w-6 text-{color}-600
```

---

## 🚀 Benefits Summary

1. ✅ **Semantic HTML** - Headers in proper place
2. ✅ **No Hacks** - Clean code, no negative margins
3. ✅ **Reusable** - Consistent pattern
4. ✅ **Flexible** - String or ReactNode
5. ✅ **Accessible** - Proper ARIA structure
6. ✅ **Beautiful** - Custom gradients & styling
7. ✅ **Type Safe** - Full TypeScript support

---

## 📝 Code Review Checklist

When reviewing Modal usage:

- ✅ No negative margins in body
- ✅ Header content in `title` prop
- ✅ Proper icon sizing (h-6 w-6)
- ✅ Gradient backgrounds when appropriate
- ✅ Text hierarchy (title larger than subtitle)
- ✅ Semantic spacing
- ✅ Accessibility labels

---

**Pattern established! Use this for all future modals.** 🎉

