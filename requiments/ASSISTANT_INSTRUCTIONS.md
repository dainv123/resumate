# 🤖 How to Work with AI Assistant

Hướng dẫn cách yêu cầu feature từ AI assistant để **100% follow guidelines**.

---

## 🎯 Quick Start

### Cách Nhanh Nhất:

1. **Mở**: `FEATURE_REQUEST_TEMPLATE.md`
2. **Copy**: Template "Bottom Line" (4 dòng)
3. **Fill**: [Name], [Components], [Hooks], [Requirements]
4. **Paste**: Cho AI assistant
5. **Done**: Assistant sẽ tự động follow tất cả guidelines

### Template 4 Dòng:

```markdown
# Feature: [Name]

**Components**: [List with purpose]
**Hooks**: [List with purpose]
**Requirements**: SRP, reusable, no duplication, error handling, TypeScript, linter clean
```

---

## 📋 3 Mức Độ Chi Tiết

### Level 1: QUICK (15 seconds - Simple features)

```markdown
**Feature**: Add Export Button

**Do**: Add export button to CV cards, call existing export API

**Make**: Button component wrapper, handle export

**Reuse**: In dashboard, CV list, search results
```

✅ Khi: Feature đơn giản, có precedent trong codebase

### Level 2: STANDARD (1 minute - Medium features)

```markdown
# Feature: CV Comparison

**What**: Allow user to select 2 CVs and compare side-by-side

**Build**:
- ComparisonSelector.tsx (choose 2 CVs)
- ComparisonView.tsx (side-by-side display)
- useCompareCV.ts (comparison logic)

**Reusable**:
- ComparisonSelector: Use in CV list page
- ComparisonView: Use in detailed comparison page

**Quality**:
- SRP: Each component 1 responsibility
- Max 150 lines per component
- Error if < 2 CVs selected
- Loading while fetching comparison
- All TypeScript typed
```

✅ Khi: Medium feature, cần rõ architecture

### Level 3: DETAILED (2-3 minutes - Complex features)

```markdown
# Feature: Advanced CV Filtering

## 🎯 Overview
Filter CVs by multiple criteria: status, tailored date, job description.
Show filter panel with checkboxes, date range, search.

## 📐 Architecture

**Components**:
- FilterPanel.tsx (filter UI - reusable, 100 lines)
- FilterTag.tsx (individual filter tag - reusable, 40 lines)  
- FilteredResults.tsx (results display - use CVGrid, 50 lines)

**Hooks**:
- useFilters.ts (filter state management)
- useFilteredCVs.ts (API call with filters)

**Utils**:
- lib/utils/filters.ts (filter helper functions)

## ✅ Requirements

**SRP**:
- FilterPanel: Only UI, state in hook
- FilterTag: Just display, click in parent
- useFilters: State only
- useFilteredCVs: API call only

**Quality**:
- Max 120 lines per component
- Reuse FilterPanel in: Dashboard, CV page, search
- Handle empty results
- Error on API fail
- Show loading state
- All TypeScript strict

**Integration**:
- Replace grid in RecentCvsSection
- Add to CV list page
```

✅ Khi: Complex feature, nhiều components

---

## 🎯 Prompt Structure Checklist

Before submitting feature request, verify:

- [ ] Feature name rõ ràng
- [ ] What to build: 1-3 câu
- [ ] Components listed: tên + mục đích
- [ ] Hooks listed: tên + responsibility
- [ ] Reusability specified: nơi dùng lại
- [ ] Requirements listed: SRP, quality, error handling
- [ ] Reference: similar feature nếu có

✅ = Good to submit

---

## 🚀 My Automatic Responses

Khi bạn submit feature request, tôi sẽ:

### Step 1: Confirm Understanding (30 seconds)

```markdown
✅ Understood! I'll create:

**Components**:
- ComponentA.tsx (Responsibility: X)
- ComponentB.tsx (Responsibility: Y)

**Hooks**:
- useHook.ts (Logic: Z)

**Architecture**: [Diagram]

**Guidelines Checklist**:
✅ SRP: Each < 1 responsibility
✅ Size: Each < 200 lines
✅ Reusable: [List where]
✅ DRY: No duplication
✅ Error: Try-catch + toasts
✅ Loading: Skeleton/spinner
✅ Types: Full TypeScript
✅ Quality: All checks ✓
```

### Step 2: Build & Verify (2-5 minutes)

```markdown
✅ Building...

📄 Created:
- ComponentA.tsx (95 lines) ✓
- ComponentB.tsx (87 lines) ✓
- useHook.ts (65 lines) ✓

✅ Quality Checks:
- SRP: ✓ Clear responsibilities
- Reuse: ✓ Can use in X, Y, Z
- DRY: ✓ No code duplication
- Types: ✓ All props typed
- Errors: ✓ Try-catch + toasts
- Loading: ✓ Skeleton states
- Linter: ✓ 0 errors, 0 warnings
```

### Step 3: Summary

```markdown
✅ Feature Complete!

📊 Metrics:
- 3 components created
- 1 hook created
- 4 files reusable
- 0% duplication
- 100% TypeScript coverage
- Linter: ✅ Clean

🎯 Quality Score: A+
```

---

## ⚠️ Important: I Will ALWAYS

When you submit ANY feature request (even if you don't explicitly say):

✅ Follow IMPLEMENTATION_GUIDELINES.md  
✅ Apply SOLID principles (especially SRP)  
✅ Max 200 lines per component  
✅ Extract reusable logic to hooks  
✅ Extract reusable UI to components  
✅ Extract utilities to lib/  
✅ No code duplication (DRY)  
✅ Error handling: try-catch + toasts  
✅ Loading states: skeleton/spinner  
✅ Full TypeScript typing  
✅ No console.log in code  
✅ Run linter & fix errors  
✅ Verify all tests pass  

**You don't need to mention these - I'll do them automatically.**

---

## 🔍 Red Flags in Your Prompt (I'll Ask for Clarification)

| Red Flag | What I'll Ask |
|----------|---------------|
| "Build a CV feature" | Need more specific! Which feature? Which components? |
| "Make it reusable" | Already will! But where specifically? |
| "Follow clean code" | Already will! Anything specific? |
| "No component duplicates" | Already DRY! Any specific areas? |
| Vague component names | Need clear purpose! E.g., "Button" → "ExportButton" |
| No error handling spec | Will add! But what behavior want? |

**Proactive**: If I see vague prompt, I'll ask for clarification before starting.

---

## ✅ Good Prompts (Examples)

### Good 1: Clear & Specific
```markdown
# Feature: CV Template Selector

**Do**: Show modal to pick template before exporting CV

**Components**:
- TemplateSelector.tsx - Show template options (reusable)
- TemplatePreview.tsx - Preview selected template (reusable)

**Hooks**:
- useTemplateSelection.ts - Handle selection logic

**Reuse**: In export flow, settings page, quick build

**Quality**:
✅ TemplateSelector < 100 lines
✅ SRP: Each component 1 job
✅ Handle: Invalid template error
✅ Show: Loading preview state
✅ Types: All TypeScript strict
```

**Why Good**: 
- ✅ Clear components
- ✅ Listed reuse points
- ✅ Quality criteria
- ✅ Ready to build

### Good 2: References Existing
```markdown
# Feature: Bulk Delete CVs

**Similar to**: Delete single CV in RecentCvsSection.tsx

**Extend**: 
- Add checkbox to CVCard
- Add "Delete Selected" button
- Reuse: existing useCVActions hook
- New: useBulkDelete hook (handle multiple)

**Quality**:
✅ Use existing modal pattern
✅ Reuse CVCard selections
✅ New: BulkActionsBar component
✅ Handle: No CVs selected error
```

**Why Good**:
- ✅ Builds on existing code
- ✅ Reuses patterns
- ✅ Clear incremental changes

### Good 3: Links to Guidelines
```markdown
# Feature: Search & Filter

See: REFACTORING_EXAMPLE.md (similar pattern)

**Build**: 
- SearchBar.tsx (input - reusable)
- FilterPanel.tsx (filters - reusable)
- useSearchFilter.ts (logic)

**Requirements**: Follow SRP from example

**Reuse**: Dashboard, CV list, sidebar search
```

**Why Good**:
- ✅ References example
- ✅ Follows proven pattern
- ✅ Easy to verify quality

---

## ❌ Bad Prompts (I'll Ask for Details)

### Bad 1: Too Vague
```markdown
**Feature**: Build CV features
```
❌ What features? How many components? What's reusable?

**I'll ask for**: Specific feature name, components, hooks

### Bad 2: No Architecture
```markdown
**Feature**: Tailor CV

**Do**: Let user tailor CV
```
❌ Which components? How many? What's the flow?

**I'll ask for**: Component list, hook list, integration points

### Bad 3: Conflicting Requirements
```markdown
**Feature**: Export with lots of options

**Also**: Keep it simple and minimal
```
❌ Can't optimize for both! Which priority?

**I'll ask for**: Clarify priority (features vs simplicity)

---

## 📞 How to Ask Questions

### About Guidelines:
```markdown
**Question**: Do I need to extract this logic to a hook?

**Answer**: Check SRP - if logic could be reused, YES.
See: IMPLEMENTATION_GUIDELINES.md → Reuse Strategy
```

### About Architecture:
```markdown
**Question**: Should Component A and B be separate?

**Answer**: Check SRP - if different responsibility, YES.
See: REFACTORING_EXAMPLE.md → Architecture Diagram
```

### About Code:
```markdown
**Question**: Is this code duplication?

**Answer**: If same logic in 2+ places, YES.
I'll extract to shared hook/component/util.
```

---

## 💡 Pro Tips

### 1. Reference Existing Code
```markdown
**Feature**: Similar to [existing feature]

See: frontend/src/components/[existing file]
```
✅ Helps me understand pattern you want

### 2. Specify Constraints
```markdown
**Constraints**:
- Each component < 100 lines (even smaller than normal)
- Must use existing CVCard component
- Reusable in 3+ places
```
✅ Clear priorities

### 3. Include Examples
```markdown
**Example Usage**:
<MyComponent cvs={[]} onSelect={} />

Usage locations:
1. Dashboard
2. CV list page
3. Search results
```
✅ I understand the API

### 4. Ask for Feedback
```markdown
**Request**: Show me the architecture
before you build, so I can verify it's right.
```
✅ Collaborative approach

---

## 🎓 Common Questions

### Q: Do I need to be super detailed?
**A**: No! Even short prompt will work. But more detail = better result.

### Q: What if I'm not sure about architecture?
**A**: That's fine! Just describe what user sees, I'll design architecture.

### Q: Can I change requirements mid-way?
**A**: Yes! Just tell me, I'll update. Best to clarify before building though.

### Q: How do I know you followed guidelines?
**A**: Check my response:
- [ ] I listed all files created
- [ ] I showed component sizes
- [ ] I listed reusable locations
- [ ] I ran linter ✓
- [ ] I explained SRP for each piece

### Q: What if there's a linter error?
**A**: I'll fix immediately before finishing.

---

## 📝 Template Recap

**Copy & paste this when requesting features:**

```markdown
# Feature: [Name]

[What to build - 2-3 sentences]

**Components**: [List each with purpose]
**Hooks**: [List each with responsibility]
**Reusable in**: [Where will use again]

**Requirements**:
✅ SRP (each 1 responsibility)
✅ Max 200 lines per component
✅ Extract reusable logic to hooks
✅ No code duplication
✅ Error handling + loading states
✅ Full TypeScript
✅ Linter: 0 errors

**Reference**: [If similar feature exists]
```

---

## 🚀 You're All Set!

Now you can:

1. ✅ Read `IMPLEMENTATION_GUIDELINES.md` (architecture standards)
2. ✅ Read `FEATURE_REQUEST_TEMPLATE.md` (how to request features)
3. ✅ Read `REFACTORING_EXAMPLE.md` (real example)
4. ✅ Read this file (how I work)
5. ✅ Request features using template

**And I'll automatically follow everything!** 🎉

---

**Last Updated**: 2025-10-23  
**Status**: Ready to use ✅
