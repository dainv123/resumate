# Implementation Guidelines - Resumate

Tài liệu này định nghĩa các tiêu chuẩn phát triển tính năng trong dự án Resumate.

## 🎯 Nguyên tắc Core (SOLID + Clean Code)

### Single Responsibility Principle (SRP)
- **Yêu cầu**: Mỗi component/function phải có **1 trách nhiệm duy nhất**
- **Kiểm tra**: Nếu bạn dùng "and" để describe component thì cần tách
  - ❌ "CVCard with delete and export" → Tách `CVCard` + `CVCardActions`
  - ✅ "CVCard displays CV info" + "CVCardActions handles actions"

### Component Splitting
- **Tách component khi**:
  - Component > 200 dòng code → Tách
  - Có 3+ state hooks → Recheck xem có logic nào tách được
  - Có nested render functions → Tách thành component riêng
  - Logic có thể reuse ở chỗ khác

- **Ví dụ tách component**:
  ```tsx
  // ❌ Monolithic
  <RecentCvsSection> (260 lines)
    - Fetch data
    - Delete logic + modal
    - Export logic
    - Render grid
  
  // ✅ Modular
  <RecentCvsSection> (120 lines - core logic)
    ├─ <CVCard> (reusable everywhere)
    ├─ <DeleteConfirmationModal> (reusable everywhere)
    ├─ <CVCardActions> (actions handler)
    └─ <CVGrid> (grid layout)
  ```

### Code Reuse Strategy
1. **Identify shared logic** → Extract to custom hooks
2. **Identify shared UI** → Extract to reusable components
3. **Identify shared utilities** → Extract to lib files

**Ví dụ**:
```tsx
// ✅ Custom hook for export logic (reusable)
const useExportCV = () => {
  const handleExport = async (cvId, format) => { /* ... */ };
  return { handleExport };
};

// ✅ Reusable Modal component (can use anywhere)
<DeleteConfirmationModal isOpen={} onConfirm={} />

// ✅ Utility function (can use anywhere)
export const formatCVFileName = (filename: string, format: string) => {};
```

## 📋 Feature Implementation Checklist

Khi yêu cầu implement feature, hãy follow checklist này:

### Phase 1: Analysis & Design
- [ ] Define component structure
- [ ] Identify reusable components
- [ ] Plan state management
- [ ] List custom hooks needed

### Phase 2: Implementation
- [ ] Implement reusable components first
- [ ] Extract custom hooks
- [ ] Extract utility functions
- [ ] Main component uses abstractions

### Phase 3: Code Quality
- [ ] No component > 200 lines
- [ ] No duplicate code (DRY)
- [ ] All hooks in custom hooks, not in components
- [ ] Props are typed (TypeScript)
- [ ] Error handling
- [ ] Loading states
- [ ] No console.log (use proper logging)

### Phase 4: Review
- [ ] Run linter (no errors/warnings)
- [ ] Test all features
- [ ] Check code is maintainable (junior dev readable?)

## 🛠️ Recommended Structure

### Frontend Structure (Components)
```
src/
├── components/
│   ├── cv/
│   │   ├── CVCard.tsx               (reusable everywhere)
│   │   ├── CVActions.tsx            (reusable - actions handler)
│   │   ├── CVGrid.tsx               (reusable - list layout)
│   │   ├── DeleteConfirmationModal.tsx (reusable)
│   │   ├── ExportModal.tsx          (reusable)
│   │   └── modals/
│   │       ├── JobDescriptionModal.tsx
│   │       ├── TailorModal.tsx
│   │       └── TemplateConfigModal.tsx
│   ├── dashboard/
│   │   ├── RecentCvsSection.tsx     (specific to dashboard)
│   │   └── StatisticsCard.tsx       (reusable)
│   └── ui/
│       ├── Button.tsx               (always reusable)
│       ├── Modal.tsx                (always reusable)
│       └── LoadingSkeleton.tsx       (always reusable)
├── hooks/
│   ├── useExportCV.ts               (custom hook - reusable logic)
│   ├── useCvs.ts                    (custom hook - reusable)
│   ├── useDeleteCV.ts               (custom hook - reusable)
│   └── useDuplicateCV.ts            (custom hook - reusable)
├── lib/
│   ├── cv.ts                        (API client)
│   └── utils/
│       ├── fileHandling.ts
│       ├── formatting.ts
│       └── validation.ts
└── types/
    └── cv.types.ts
```

## 💡 Implementation Patterns

### Pattern 1: Custom Hook for Reusable Logic
```tsx
// hooks/useExportCV.ts
export const useExportCV = () => {
  const { showError, showSuccess } = useToast();
  
  const handleExport = async (
    cvId: string,
    format: 'pdf' | 'word' | 'ats'
  ) => {
    // Implementation
  };
  
  return { handleExport };
};

// Usage in component
const MyComponent = () => {
  const { handleExport } = useExportCV();
  // ...
};
```

### Pattern 2: Composition over Inheritance
```tsx
// ❌ One big component
<CVCard cv={cv} onEdit={} onDelete={} onExport={} />

// ✅ Composed components
<CVCard cv={cv}>
  <CVCardHeader cv={cv} />
  <CVCardContent cv={cv} />
  <CVCardActions 
    onEdit={onEdit}
    onDelete={onDelete}
    onExport={onExport}
  />
</CVCard>
```

### Pattern 3: Extract Render Logic to Components
```tsx
// ❌ Nested render function
const Component = () => {
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>
          {/* 30 lines of JSX */}
        </div>
      ))}
    </div>
  );
};

// ✅ Extracted component
const ItemCard = ({ item }) => (
  <div>{/* 30 lines of JSX */}</div>
);

const Component = () => (
  <div>
    {data.map(item => <ItemCard key={item.id} item={item} />)}
  </div>
);
```

## 🔍 Code Duplication Red Flags

Nếu thấy pattern này, hãy extract:

```tsx
// ❌ Duplicated modal logic
const Modal1 = ({ isOpen, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6">
      {/* Modal content */}
    </div>
  </div>
);

const Modal2 = ({ isOpen, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6">
      {/* Modal content */}
    </div>
  </div>
);

// ✅ Extract base modal
const BaseModal = ({ isOpen, onClose, children }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50">
    <div className="bg-white rounded-lg p-6">
      {children}
    </div>
  </div>
);
```

## 📝 Cách Yêu Cầu Feature Implementation

### Template Yêu Cầu (Copy-Paste):
```
**Feature**: [Feature Name]

**Requirements**:
- [ ] Follow SOLID principles (especially SRP)
- [ ] Split component nếu > 200 lines
- [ ] Extract reusable components (nếu có)
- [ ] Extract custom hooks (nếu có logic reusable)
- [ ] Extract utility functions (nếu có)
- [ ] No code duplication (DRY principle)
- [ ] Proper error handling + loading states
- [ ] TypeScript types for all props/functions
- [ ] No console.log (remove after debugging)
- [ ] Linter: 0 errors, 0 warnings

**Scope**:
[Describe what to build]

**Reference**:
[If applicable, reference similar implementations]
```

### Ví dụ Yêu Cầu Chi Tiết:
```
**Feature**: Implement Edit CV Functionality

**Requirements**:
✅ Follow SOLID principles (especially SRP)
✅ Component size: max 200 lines
✅ Create these reusable components:
   - EditCVForm.tsx (the form, can reuse in other pages)
   - FormField.tsx (individual field, can reuse)
✅ Create this custom hook:
   - useEditCV.ts (handle save/update logic, can reuse)
✅ No duplicate code from existing edit flows
✅ Proper error handling + loading states

**Design**:
<EditCVPage> (100 lines)
  ├─ <EditCVForm> (80 lines - reusable)
  │   └─ <FormField> (15 lines - reusable)
  └─ useEditCV() (50 lines custom hook)

**Reference**: See [id]/page.tsx for similar pattern
```

## ⚡ Performance Considerations

- [ ] Memoize components nếu receive complex props: `React.memo()`
- [ ] Use `useMemo` cho expensive computations
- [ ] Use `useCallback` cho functions passed to child components
- [ ] Lazy load modals/heavy components: `lazy()`
- [ ] Avoid recreating objects/arrays in render

## 🧪 Testing Checklist

- [ ] Component renders without error
- [ ] All user interactions work
- [ ] Error states display properly
- [ ] Loading states display properly
- [ ] Responsive design (mobile, tablet, desktop)

---

**Last Updated**: 2025-10-23
**Version**: 1.0
