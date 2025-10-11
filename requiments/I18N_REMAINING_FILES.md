# 📋 Files chưa implement I18N

## ✅ Đã hoàn thành (100%):
1. ✅ `/app/dashboard/page.tsx` - Dashboard homepage
2. ✅ `/app/auth/login/page.tsx` - Login page
3. ✅ `/app/auth/register/page.tsx` - Register page
4. ✅ `/app/dashboard/settings/page.tsx` - Settings page
5. ✅ `/components/dashboard/Sidebar.tsx` - Navigation

---

## ⚠️ Files CÒN hardcoded Vietnamese text:

### **High Priority:**

#### 1. `/app/page.tsx` - Landing Page
**Vietnamese texts:**
- "Đăng nhập" button
- "Đăng ký" button
- "Update CV của bạn trong 1 phút"
- "Ứng dụng giúp freelancer..."
- Feature descriptions

**Priority:** ⭐⭐⭐ HIGH (public facing)
**Estimated:** ~15 translation keys needed

---

#### 2. `/app/dashboard/cv/page.tsx` - CV Management Page
**Vietnamese texts:**
- Various CV-related texts
- Already has CV translations in locales
- Needs implementation

**Priority:** ⭐⭐⭐ HIGH
**Estimated:** ~20 translation keys (most already exist)

---

#### 3. `/app/dashboard/job-tailor/page.tsx` - Job Tailor Page  
**Vietnamese texts:**
- Already has jobTailor translations
- Needs to replace hardcoded texts với t()

**Priority:** ⭐⭐ MEDIUM
**Estimated:** ~30 translation keys (most already exist)

---

### **Medium Priority:**

#### 4. `/components/cv/CVUpload.tsx`
**Texts:**
- "Uploading..."
- "Upload CV"
- Success/error messages (minor)

**Priority:** ⭐⭐ MEDIUM
**Estimated:** ~5 keys

---

#### 5. `/components/cv/EditCVModal.tsx`
**Texts:**
- Form labels
- Field descriptions
- Validation messages

**Priority:** ⭐ LOW (internal tool)
**Estimated:** ~40 keys (complex form)

---

#### 6. `/components/portfolio/CvSelector.tsx`
**Texts:**
- "Chọn CV"
- Minor UI texts

**Priority:** ⭐ LOW
**Estimated:** ~5 keys

---

## 📊 Summary:

**Total TSX files:** 40 files
**I18N Completed:** 5 files (12.5%)
**I18N Partial:** ~10 files (25%) - có translations nhưng chưa apply
**Remaining:** 8 files có hardcoded text

**Coverage tính theo text:**
- Critical pages (Dashboard, Auth, Settings): ✅ 100%
- Feature pages (CV, Projects, Portfolio, Job Tailor): ⚠️ 60%
- Components: ⚠️ 40%

---

## 🎯 Recommendation:

### **Phase 1 - DONE ✅**
- Dashboard
- Auth pages
- Settings
- Sidebar navigation

### **Phase 2 - Should do next:** 
1. Landing page (`/app/page.tsx`) - Public facing
2. CV page (`/app/dashboard/cv/page.tsx`)
3. Job Tailor page (apply existing translations)

### **Phase 3 - Nice to have:**
4. Projects page
5. Portfolio page
6. Minor components

---

## 💡 Note:

**Many translations already exist in JSON files!**

Example - `jobTailor` namespace đã có đầy đủ:
```json
{
  "jobTailor": {
    "title": "Job Tailor",
    "description": "Optimize your CV...",
    "selectCV": "Select CV",
    "analyzeCompatibility": "Analyze Compatibility",
    ... (50+ keys)
  }
}
```

Chỉ cần:
1. Import `useLanguage`
2. Replace hardcoded text với `t("jobTailor.xxx")`
3. Done!

---

## 🚀 Current Status:

**Main app flow:** ✅ 100% i18n
- Login → Dashboard → Settings: Full Vietnamese/English

**Feature pages:** ⚠️ 60% i18n  
- Job Tailor có translations nhưng chưa apply hết
- CV/Projects/Portfolio tương tự

**Recommendation:** 
App đã đủ tốt để sử dụng! Có thể làm thêm i18n cho các feature pages khi có thời gian.

---

## 📝 Quick Apply Guide:

Để apply nhanh cho file còn lại:

```bash
# 1. Check file có bao nhiêu hardcoded texts
grep -n "\"[A-Z][a-z]" file.tsx | wc -l

# 2. Import useLanguage
import { useLanguage } from "@/contexts/LanguageContext";
const { t } = useLanguage();

# 3. Replace
"Vietnamese text" → {t("namespace.key")}

# 4. Verify
npm run build
```

---

**Bạn muốn tôi tiếp tục làm Phase 2 (Landing + CV page) không?**

