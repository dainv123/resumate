# Internationalization (i18n) Guide

## 📚 Overview

Resumate hỗ trợ đa ngôn ngữ (multi-language) với:
- ✅ Tiếng Việt (Vietnamese)
- ✅ English

## 🎯 Quick Start

### 1. Using Translations in Components

```tsx
import { useLanguage } from "@/contexts/LanguageContext";

export default function MyComponent() {
  const { t } = useLanguage();
  
  return (
    <div>
      <h1>{t("jobTailor.title")}</h1>
      <p>{t("jobTailor.description")}</p>
      <button>{t("common.save")}</button>
    </div>
  );
}
```

### 2. Language Switcher

Language switcher đã được tích hợp vào Sidebar (bottom section).

Users can switch languages by:
1. Click on language button (Globe icon)
2. Select preferred language
3. Selection is saved to localStorage

## 📁 File Structure

```
frontend/src/
├── locales/
│   ├── en.json          # English translations
│   └── vi.json          # Vietnamese translations
├── contexts/
│   └── LanguageContext.tsx    # i18n context & logic
└── components/ui/
    └── LanguageSwitcher.tsx   # Language switcher UI
```

## 🔧 Configuration

### Adding New Translations

**1. Edit translation files:**

`locales/en.json`:
```json
{
  "mySection": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

`locales/vi.json`:
```json
{
  "mySection": {
    "title": "Tiêu đề của tôi",
    "description": "Mô tả của tôi"
  }
}
```

**2. Use in component:**
```tsx
const { t } = useLanguage();

<h1>{t("mySection.title")}</h1>
<p>{t("mySection.description")}</p>
```

### Translation Keys Structure

```
{
  "section": {
    "subsection": {
      "key": "value"
    }
  }
}
```

Access: `t("section.subsection.key")`

## 📝 Translation Categories

### 1. Common (common.*)
General UI elements used across the app:
- `common.loading` - "Loading..." / "Đang tải..."
- `common.save` - "Save" / "Lưu"
- `common.cancel` - "Cancel" / "Hủy"
- etc.

### 2. Navigation (nav.*)
Menu items and navigation:
- `nav.dashboard`
- `nav.myCV`
- `nav.jobTailor`
- etc.

### 3. Feature-specific
Each feature has its own section:
- `jobTailor.*` - Job Tailor page
- `cv.*` - CV management
- `projects.*` - Projects page
- `portfolio.*` - Portfolio page
- `settings.*` - Settings page

### 4. Modals (modal.*)
Modal-specific text:
- `modal.jobDescription`
- `modal.originalData`
- `modal.confirmation`

## 🎨 Language Switcher UI

### Position
- Location: Sidebar bottom section
- Above: Settings & Logout buttons

### Features
- Globe icon indicator
- Dropdown menu
- Current language highlighted
- Checkmark on selected
- Saves to localStorage

### Customization

**Style:**
```tsx
// In LanguageSwitcher.tsx
className="your-custom-classes"
```

**Position:**
Move to different location by importing:
```tsx
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
```

## 🔄 Language Context API

### useLanguage Hook

```tsx
const {
  language,      // Current language: 'en' | 'vi'
  setLanguage,   // Function to change language
  t,             // Translation function
  languages      // Available languages list
} = useLanguage();
```

### Methods

#### `language`
Current active language code
```tsx
const { language } = useLanguage();
console.log(language); // 'en' or 'vi'
```

#### `setLanguage(lang)`
Change language programmatically
```tsx
const { setLanguage } = useLanguage();
setLanguage('vi'); // Switch to Vietnamese
```

#### `t(key)`
Translate a key
```tsx
const { t } = useLanguage();
const title = t('jobTailor.title');
```

#### `languages`
List of available languages
```tsx
const { languages } = useLanguage();
// [
//   { code: 'en', name: 'English', nativeName: 'English' },
//   { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' }
// ]
```

## 🌐 Adding New Languages

### Step 1: Create Translation File
```bash
touch frontend/src/locales/fr.json  # French example
```

### Step 2: Add Translations
Copy structure from `en.json` and translate

### Step 3: Update Context
Edit `LanguageContext.tsx`:
```tsx
import fr from "@/locales/fr.json";

const translations = {
  en,
  vi,
  fr,  // Add new language
};

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
  { code: "fr", name: "French", nativeName: "Français" },  // Add
];
```

### Step 4: Update Types
```tsx
type Language = "en" | "vi" | "fr";  // Add new code
```

## 📊 Current Translation Coverage

### Fully Translated
- ✅ Common UI elements
- ✅ Navigation
- ✅ Job Tailor page
- ✅ CV management
- ✅ Projects page
- ✅ Portfolio page
- ✅ Settings
- ✅ Modals

### Example Usage

**Job Tailor Page:**
```tsx
// Before
<h3>Job Tailor</h3>
<p>Optimize your CV for specific job descriptions</p>

// After
<h3>{t("jobTailor.title")}</h3>
<p>{t("jobTailor.description")}</p>
```

**Buttons:**
```tsx
// Before
<button>Analyze Compatibility</button>
<button>Generate Cover Letter</button>

// After
<button>{t("jobTailor.analyzeCompatibility")}</button>
<button>{t("jobTailor.generateCoverLetter")}</button>
```

## 🔍 Debugging

### Translation Not Found
If key is not found, it returns the key itself:
```tsx
t("nonexistent.key")  // Returns: "nonexistent.key"
```

### Check Current Language
```tsx
const { language } = useLanguage();
console.log("Current language:", language);
```

### View All Translations
```tsx
import en from "@/locales/en.json";
import vi from "@/locales/vi.json";

console.log("English:", en);
console.log("Vietnamese:", vi);
```

## 🎯 Best Practices

### 1. Consistent Keys
Use consistent naming:
```
feature.action
feature.element
feature.status
```

### 2. Reuse Common Terms
Don't duplicate:
```json
// ❌ Bad
{
  "cv": { "save": "Save" },
  "projects": { "save": "Save" }
}

// ✅ Good
{
  "common": { "save": "Save" },
  "cv": { ... },
  "projects": { ... }
}
```

### 3. Descriptive Keys
```json
// ❌ Bad
{ "btn1": "Click here" }

// ✅ Good
{ "analyzeCompatibility": "Analyze Compatibility" }
```

### 4. Context in Translations
Provide context for translators:
```json
{
  "jobTailor": {
    "scoreAnalysis": "Get detailed score & gap analysis",  // Clear context
    "personalizedLetter": "AI writes personalized letter"
  }
}
```

## 🚀 Future Enhancements

### Planned Features
- [ ] RTL language support (Arabic, Hebrew)
- [ ] Date/time localization
- [ ] Number formatting
- [ ] Currency formatting
- [ ] Pluralization rules
- [ ] Dynamic content translation
- [ ] Translation editor UI

### Extensibility
The system is designed to easily add:
- More languages
- Feature-specific translations
- Dynamic content
- User-specific language preferences

## 📚 Resources

- Translation files: `frontend/src/locales/`
- Context: `frontend/src/contexts/LanguageContext.tsx`
- Switcher: `frontend/src/components/ui/LanguageSwitcher.tsx`
- Provider: `frontend/src/app/providers.tsx`

---

**Last updated:** October 10, 2025
**Languages supported:** English (en), Tiếng Việt (vi)



