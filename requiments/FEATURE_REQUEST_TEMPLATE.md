# Feature Request Template

Dùng template này khi yêu cầu implement feature. Template sẽ đảm bảo tôi **100% follow IMPLEMENTATION_GUIDELINES**.

---

## 📋 Template - Copy & Paste

```markdown
# Feature: [Feature Name]

## 🎯 Overview
[Mô tả ngắn: feature làm gì, lợi ích gì]

## 📐 Architecture Design

### Components to Create:
- [ ] `[ComponentName1].tsx` - [Mô tả 1 dòng]
- [ ] `[ComponentName2].tsx` - [Mô tả 1 dòng]

### Custom Hooks to Create:
- [ ] `use[HookName].ts` - [Mô tả 1 dòng]

### Utility Functions to Create:
- [ ] `[file].ts` - [Mô tả 1 dòng]

### Integration Points:
- Use in: [Nơi nào sẽ dùng feature này]

## 📋 Requirements Checklist

**SOLID & Clean Code:**
- [ ] Follow Single Responsibility Principle (SRP)
- [ ] Each component has 1 clear responsibility
- [ ] Extract reusable components to `components/`
- [ ] Extract reusable logic to `hooks/`
- [ ] Extract utilities to `lib/utils/`

**Component Quality:**
- [ ] No component > 200 lines
- [ ] No nested render functions
- [ ] Extract list items to components
- [ ] Memoize if needed: `React.memo()`

**Code Reuse:**
- [ ] Identify code that could be reused
- [ ] Create reusable components where needed
- [ ] Create custom hooks for shared logic
- [ ] All handlers/mutations in hooks (not in components)

**Code Quality:**
- [ ] No code duplication (DRY principle)
- [ ] All props are TypeScript typed
- [ ] All function returns are typed
- [ ] Error handling: try-catch + error messages
- [ ] Loading states: show loading UI
- [ ] No console.log() in production code

**Testing & Linting:**
- [ ] Run `npm run lint` → 0 errors, 0 warnings
- [ ] Test all user interactions
- [ ] Test error states
- [ ] Test loading states

## 🎨 Design Notes
[Nếu có design cụ thể, UI specifics]

## 📚 References
- Similar feature: [URL/Path nếu có]
- See also: [Các files liên quan]

## 🔗 Related Files
- Component: `src/components/...`
- Hook: `src/hooks/...`
- Types: `src/types/...`
```

---

## ✅ Cách Dùng - Step by Step

### **Step 1: Copy Template**
Copy template trên, điền đủ thông tin

### **Step 2: Điền Chi Tiết**

```markdown
# Feature: Implement Tailor CV Modal

## 🎯 Overview
Cho phép user tailor CV theo job description cụ thể.
Sẽ hiển thị modal với job description input, 
tailor options, preview CV tailored.

## 📐 Architecture Design

### Components to Create:
- [ ] `TailorCVModal.tsx` - Modal container (reusable everywhere)
- [ ] `JobDescriptionInput.tsx` - Input field (reusable in other modals)
- [ ] `TailorOptions.tsx` - Options selector (reusable)

### Custom Hooks to Create:
- [ ] `useTailorCV.ts` - Handle tailor logic, mutations
- [ ] `useJobDescriptionValidation.ts` - Validate job description

### Utility Functions to Create:
- [ ] `lib/utils/tailoring.ts` - Helper functions

### Integration Points:
- Use in: CV Detail page, Dashboard CV actions
```

### **Step 3: Add Requirements**

```markdown
## 📋 Requirements Checklist

**SOLID & Clean Code:**
- [ ] Follow Single Responsibility Principle
  - TailorCVModal: Container + state
  - JobDescriptionInput: Just input UI
  - useTailorCV: Business logic only
  
**Component Quality:**
- [ ] TailorCVModal < 150 lines
- [ ] JobDescriptionInput < 100 lines
- [ ] useTailorCV < 80 lines
- [ ] Extract modal header to component

**Code Reuse:**
- [ ] JobDescriptionInput reusable (use in other modals too)
- [ ] useTailorCV can use in other pages
- [ ] Validation logic in separate hook

**Code Quality:**
- [ ] Handle: invalid job description
- [ ] Handle: API timeout
- [ ] Show: loading state while tailoring
- [ ] Show: error message if fails
```

### **Step 4: Submit to Me**

Just paste your filled template in a message to me. I'll automatically:

✅ Follow all guidelines from IMPLEMENTATION_GUIDELINES.md  
✅ Create components with < 200 lines  
✅ Extract reusable logic to hooks  
✅ Avoid code duplication  
✅ Add error handling + loading states  
✅ Use TypeScript everywhere  
✅ Run linter and fix issues  

---

## 🎯 Simplified Version (Minimal Info)

Nếu bạn muốn ngắn hơn, dùng version này:

```markdown
**Feature**: [Name]

**What to build**:
[2-3 dòng mô tả]

**Components to create**:
- [Component1] - [1 dòng]
- [Component2] - [1 dòng]

**Reusable** (can use in multiple places):
- [Component/Hook name] - [Where to use]

**Requirements**:
✅ Follow SOLID (SRP)
✅ Max 200 lines per component
✅ Extract reusable components & hooks
✅ No code duplication
✅ Error handling + loading states
✅ TypeScript typed
✅ Linter: 0 errors

**Reference**: See [file.md] for similar pattern
```

---

## 💡 Pro Tips untuk Prompt Tốt

### ✅ **DO - Tốt**

```markdown
# Feature: Search CVs

**Components**:
- SearchInput.tsx - Input field (reusable)
- SearchResults.tsx - Results display (use CVGrid)

**Hooks**:
- useSearchCVs.ts - Search logic

**Requirements**:
✅ SRP: SearchInput only handles input
✅ Reuse: Use existing CVGrid for results
✅ No duplication: Extract common search logic
✅ Error handling: Show error if search fails
✅ Loading state: Show skeleton while searching
```

### ❌ **DON'T - Không tốt**

```markdown
# Feature: Add search to CVs

Maybe create some components?
```

**Vì sao**: Quá mơ hồ, tôi không biết:
- Cần bao nhiêu components?
- Reusable ở đâu?
- Architecture như thế nào?

### 🎯 **BEST - Tốt nhất**

```markdown
# Feature: Search & Filter CVs

## 🎯 Overview
Add search bar + filter options to CV list.
User can search by name, filter by status (Original/Tailored).

## 📐 Architecture

**Components**:
- SearchBar.tsx (reusable - 50 lines max)
- FilterOptions.tsx (reusable - 60 lines max)
- SearchResultsList.tsx (use CVGrid inside)

**Hooks**:
- useSearchCVs.ts (search logic, API call, caching)

**Integration**:
- Replace current grid in: RecentCvsSection, All CVs page

## ✅ Requirements

**SRP**:
- SearchBar: Only input + on change
- FilterOptions: Only filter UI
- useSearchCVs: Business logic only

**Reusable**:
- SearchBar: Use in header, sidebar, etc.
- FilterOptions: Use in advanced filters page
- useSearchCVs: Use anywhere need search

**Quality**:
- Handle empty search results
- Handle API errors gracefully
- Show loading state
- Debounce search input
- TypeScript: all typed

**Reference**: See REFACTORING_EXAMPLE.md
```

**Vì sao tốt**: Chi tiết, cấu trúc rõ, dễ hiểu.

---

## 🚀 Cách Tôi Sẽ Response

Khi bạn submit feature request, tôi sẽ:

### 1️⃣ **Confirm Understanding**
```
✅ I understand:
- Create 3 components: X, Y, Z
- Create 1 hook: useFoo
- Requirements: SRP, < 200 lines, reusable...
```

### 2️⃣ **Show Plan**
```
📐 Architecture:
Component1 (X lines) - Responsibility: A
Component2 (Y lines) - Responsibility: B
Hook (Z lines) - Logic: C
```

### 3️⃣ **Implement & Check**
```
✅ Components created:
  - Component1.tsx ✓
  - Component2.tsx ✓

✅ Hooks created:
  - useHook.ts ✓

✅ Quality checks:
  - SRP: ✓ Each < 200 lines
  - Reusable: ✓ Can use in X, Y, Z
  - DRY: ✓ No duplication
  - Types: ✓ All typed
  - Linter: ✓ 0 errors
```

### 4️⃣ **Done**
```
✅ Feature complete!

Created:
- 3 new components
- 1 new hook
- 4 files reusable
- 54% code reduction
```

---

## 📞 Contact Format

### Format 1: Full Template (Recommended)
**When**: Complex features, want specific architecture

```
[Paste full template with all sections]
```

### Format 2: Quick Format (Simple features)
**When**: Small features, straightforward

```
**Feature**: [Name]
**Components**: [List]
**Hooks**: [List]
**Requirements**: SRP, reusable, no duplication, error handling
**Reference**: [Similar feature/file]
```

### Format 3: Super Quick (Very simple)
**When**: Obvious what to do

```
**Feature**: [Name]
**Build**: [Brief description]
**Make reusable**: [Components/hooks]
```

---

## 🎓 Example Requests

### Example 1: Medium Feature
```markdown
# Feature: Duplicate CV with Custom Name

## Overview
When user clicks "Duplicate CV", show dialog to enter new name.
Then duplicate and show success toast.

## Components
- DuplicateCVDialog.tsx (reusable in CV actions)

## Hooks
- useDuplicateCV.ts (handle duplication with custom name)

## Requirements
✅ Input validation for CV name
✅ Show loading while duplicating
✅ Error handling if duplicate fails
✅ Success toast with new CV link
✅ TypeScript typed
✅ SRP: Dialog is just UI, logic in hook
```

### Example 2: Large Feature
```markdown
# Feature: CV Version History

## Overview
Show dialog with all CV versions.
User can view old version, restore, or delete.

## Components
- CVVersionHistoryModal.tsx (container)
- VersionItem.tsx (list item)
- VersionPreview.tsx (preview panel)

## Hooks
- useCVVersions.ts (fetch versions)
- useRestoreVersion.ts (restore logic)
- useDeleteVersion.ts (delete logic)

## Requirements
- Extract modals to separate file
- Use CVDisplay for preview
- Handle concurrent operations
- Error boundaries
- Loading states for each action
```

---

## ⚠️ Tidak Cần Mention

**Tôi automatically sẽ:**
- ✅ Follow IMPLEMENTATION_GUIDELINES.md
- ✅ Apply SOLID principles
- ✅ Extract reusable components
- ✅ Create custom hooks
- ✅ Avoid duplication
- ✅ Add error handling
- ✅ Add loading states
- ✅ Use TypeScript
- ✅ Run linter
- ✅ Fix linter errors

**Bạn không cần nói:**
- "Follow clean code" (automatically)
- "Use TypeScript" (automatically)
- "Add error handling" (automatically)
- "Run linter" (automatically)

---

## 📝 Template Summary

**Minimal**: Ngắn, dễ dùng, cho simple features
```
**Feature**: Name
**Build**: Mô tả
**Components**: List
**Reusable**: Where to use
```

**Full**: Chi tiết, rõ ràng, cho complex features
```
# Feature: Name

## Overview
[Mô tả]

## Architecture
- Components: [List]
- Hooks: [List]
- Utils: [List]

## Requirements
- SRP: [Chi tiết]
- Reusable: [Nơi dùng]
- Quality: [Chi tiết]
```

**Quick**: Rất ngắn, cho obvious features
```
**Feature**: Name
**Do**: Brief description
```

---

## ✨ Bottom Line

**Just use this format when requesting features:**

```markdown
# Feature: [Name]

[What to build - 2-3 dòng]

**Components**: [List]
**Hooks**: [List]
**Reusable in**: [Where]

**Requirements**:
✅ SRP (each piece 1 responsibility)
✅ Max 200 lines per component
✅ Extract reusable components/hooks
✅ No duplication (DRY)
✅ Error handling + loading states
✅ TypeScript all typed
✅ Linter: 0 errors

**Reference**: [Similar feature nếu có]
```

And I'll automatically implement following ALL guidelines! 🚀

---

**Last Updated**: 2025-10-23  
**Version**: 1.0
