# Complete I18N Translations - Implementation Guide

## Status: 🟡 In Progress

### Completed:
- ✅ Settings Page (100%)
- ✅ Analytics Page (100%)
- 🟡 CV Page (50%)

### Remaining:
- Dashboard Page
- Job Tailor Page  
- Portfolio Page
- Projects Page
- Compare Page
- Auth Pages
- Components

---

## Quick Implementation Summary

### Files Modified:
1. ✅ `frontend/src/locales/en.json` - Added analytics & cv translations
2. ✅ `frontend/src/locales/vi.json` - Added analytics & cv translations  
3. ✅ `frontend/src/app/dashboard/analytics/page.tsx` - Fully i18n
4. 🟡 `frontend/src/app/dashboard/cv/page.tsx` - Partially done

---

## Remaining Translations Needed

### Add to en.json:

```json
{
  "compare": {
    "title": "Version Comparison",
    "comparing": "Comparing Version {{v1}} vs Version {{v2}}",
    "backToCVs": "Back to CVs",
    "personalInfo": "Personal Information",
    "summary": "Summary",
    "experience": "Experience",
    "skills": "Skills",
    "technical": "Technical:",
    "soft": "Soft:",
    "education": "Education",
    "projects": "Projects",
    "subProjects": "Sub-Projects ({{count}})",
    "achievements": "Achievements:",
    "loading": "Loading comparison...",
    "failed": "Failed to load versions for comparison"
  },
  "portfolio": {
    "title": "Create Portfolio",
    "subtitle": "Build a professional portfolio to showcase your work",
    "steps": {
      "template": "Template",
      "cv": "CV",
      "customize": "Customize",
      "details": "Details",
      "previous": "Previous",
      "next": "Next",
      "complete": "Complete the form above"
    },
    "templateSelection": {
      "title": "Choose a Template",
      "subtitle": "Select a portfolio template that fits your style",
      "includes": "Includes:",
      "customizable": "Customizable sections",
      "selected": "Selected",
      "loading": "Loading templates...",
      "error": "Failed to load templates. Please try again.",
      "retry": "Retry",
      "noTemplates": "No templates available",
      "contactAdmin": "Please contact admin to seed templates."
    },
    "cvSelection": {
      "title": "Select CV",
      "subtitle": "Choose which CV to use for your portfolio"
    },
    "customize": {
      "title": "Customize Sections",
      "subtitle": "Enable or disable sections"
    },
    "details": {
      "title": "Personal Details",
      "subtitle": "Add your bio and social links",
      "bio": "Bio / Tagline",
      "bioPlaceholder": "Software Engineer | Full-stack Developer | Tech Enthusiast",
      "avatar": "Avatar URL (Optional)",
      "avatarPlaceholder": "https://example.com/your-photo.jpg",
      "linkedinUrl": "LinkedIn URL",
      "linkedinPlaceholder": "https://linkedin.com/in/yourname",
      "githubUrl": "GitHub URL",
      "githubPlaceholder": "https://github.com/yourname",
      "websiteUrl": "Website URL",
      "websitePlaceholder": "https://yourwebsite.com",
      "customDomain": "Custom Domain (Optional)",
      "customDomainPlaceholder": "portfolio.yourname.com",
      "preview": "Preview",
      "savePublish": "Save & Publish"
    },
    "success": {
      "previewReady": "Preview Ready!",
      "previewDesc": "Your portfolio is ready to view",
      "openPreview": "Open Preview",
      "published": "Portfolio Published! 🎉",
      "publishedDesc": "Your portfolio is now live and accessible at:"
    },
    "existingPortfolio": {
      "title": "You already have a portfolio",
      "desc": "Creating a new portfolio will override your existing one.",
      "view": "View current portfolio →"
    }
  },
  "projects": {
    "title": "Projects",
    "subtitle": "Manage your project portfolio",
    "addProject": "Add Project",
    "projectName": "Project Name",
    "namePlaceholder": "Enter project name",
    "description": "Description",
    "descriptionPlaceholder": "Describe your project",
    "role": "Your Role",
    "rolePlaceholder": "e.g., Lead Developer",
    "techStack": "Tech Stack",
    "techStackPlaceholder": "e.g., React, Node.js, MongoDB",
    "results": "Results/Achievements",
    "resultsPlaceholder": "What did you achieve?",
    "demoLink": "Demo Link",
    "demoPlaceholder": "https://demo.example.com",
    "githubLink": "GitHub Link",
    "githubPlaceholder": "https://github.com/...",
    "startDate": "Start Date",
    "endDate": "End Date",
    "saveProject": "Save Project",
    "empty": {
      "noProjects": "No projects yet",
      "description": "Add your first project to showcase your work",
      "addFirst": "Add Your First Project"
    },
    "confirm": {
      "delete": "Are you sure you want to delete this project?"
    }
  }
}
```

### Add to vi.json:

```json
{
  "compare": {
    "title": "So Sánh Phiên Bản",
    "comparing": "Đang so sánh Phiên Bản {{v1}} vs Phiên Bản {{v2}}",
    "backToCVs": "Quay Lại CVs",
    "personalInfo": "Thông Tin Cá Nhân",
    "summary": "Tóm Tắt",
    "experience": "Kinh Nghiệm",
    "skills": "Kỹ Năng",
    "technical": "Kỹ Thuật:",
    "soft": "Mềm:",
    "education": "Học Vấn",
    "projects": "Dự Án",
    "subProjects": "Dự Án Con ({{count}})",
    "achievements": "Thành Tích:",
    "loading": "Đang tải so sánh...",
    "failed": "Không thể tải các phiên bản để so sánh"
  },
  "portfolio": {
    "title": "Tạo Portfolio",
    "subtitle": "Xây dựng portfolio chuyên nghiệp để giới thiệu công việc",
    "steps": {
      "template": "Template",
      "cv": "CV",
      "customize": "Tùy Chỉnh",
      "details": "Chi Tiết",
      "previous": "Trước",
      "next": "Tiếp",
      "complete": "Hoàn thành form bên trên"
    },
    "templateSelection": {
      "title": "Chọn Template",
      "subtitle": "Chọn template portfolio phù hợp với phong cách của bạn",
      "includes": "Bao gồm:",
      "customizable": "Có thể tùy chỉnh sections",
      "selected": "Đã chọn",
      "loading": "Đang tải templates...",
      "error": "Không thể tải templates. Vui lòng thử lại.",
      "retry": "Thử Lại",
      "noTemplates": "Không có template nào",
      "contactAdmin": "Vui lòng liên hệ admin để seed templates."
    },
    "cvSelection": {
      "title": "Chọn CV",
      "subtitle": "Chọn CV nào để sử dụng cho portfolio"
    },
    "customize": {
      "title": "Tùy Chỉnh Sections",
      "subtitle": "Bật hoặc tắt các sections"
    },
    "details": {
      "title": "Thông Tin Cá Nhân",
      "subtitle": "Thêm bio và các link mạng xã hội",
      "bio": "Bio / Tagline",
      "bioPlaceholder": "Software Engineer | Full-stack Developer | Tech Enthusiast",
      "avatar": "Avatar URL (Tùy chọn)",
      "avatarPlaceholder": "https://example.com/your-photo.jpg",
      "linkedinUrl": "LinkedIn URL",
      "linkedinPlaceholder": "https://linkedin.com/in/yourname",
      "githubUrl": "GitHub URL",
      "githubPlaceholder": "https://github.com/yourname",
      "websiteUrl": "Website URL",
      "websitePlaceholder": "https://yourwebsite.com",
      "customDomain": "Custom Domain (Tùy chọn)",
      "customDomainPlaceholder": "portfolio.yourname.com",
      "preview": "Xem Trước",
      "savePublish": "Lưu & Xuất Bản"
    },
    "success": {
      "previewReady": "Bản Xem Trước Sẵn Sàng!",
      "previewDesc": "Portfolio của bạn đã sẵn sàng để xem",
      "openPreview": "Mở Xem Trước",
      "published": "Portfolio Đã Được Xuất Bản! 🎉",
      "publishedDesc": "Portfolio của bạn giờ đã live tại:"
    },
    "existingPortfolio": {
      "title": "Bạn đã có portfolio rồi",
      "desc": "Tạo portfolio mới sẽ ghi đè lên portfolio hiện tại.",
      "view": "Xem portfolio hiện tại →"
    }
  },
  "projects": {
    "title": "Dự Án",
    "subtitle": "Quản lý portfolio dự án của bạn",
    "addProject": "Thêm Dự Án",
    "projectName": "Tên Dự Án",
    "namePlaceholder": "Nhập tên dự án",
    "description": "Mô Tả",
    "descriptionPlaceholder": "Mô tả dự án của bạn",
    "role": "Vai Trò Của Bạn",
    "rolePlaceholder": "vd: Lead Developer",
    "techStack": "Công Nghệ",
    "techStackPlaceholder": "vd: React, Node.js, MongoDB",
    "results": "Kết Quả/Thành Tích",
    "resultsPlaceholder": "Bạn đạt được gì?",
    "demoLink": "Link Demo",
    "demoPlaceholder": "https://demo.example.com",
    "githubLink": "Link GitHub",
    "githubPlaceholder": "https://github.com/...",
    "startDate": "Ngày Bắt Đầu",
    "endDate": "Ngày Kết Thúc",
    "saveProject": "Lưu Dự Án",
    "empty": {
      "noProjects": "Chưa có dự án nào",
      "description": "Thêm dự án đầu tiên để showcase công việc",
      "addFirst": "Thêm Dự Án Đầu Tiên"
    },
    "confirm": {
      "delete": "Bạn có chắc chắn muốn xóa dự án này?"
    }
  }
}
```

---

## Implementation Progress

### Analytics Page (✅ Completed)
- [x] Added translations to en.json & vi.json
- [x] Updated page to use t() function
- [x] All hardcoded texts replaced
- [x] Tested language switching

### CV Page (🟡 50% Complete)
- [x] Added translations
- [x] Header & stats updated
- [x] Modals partially updated
- [ ] Need to update: search/filter, empty states, view modal sections
- [ ] Need to update: confirm dialogs

---

## Next Steps

1. Finish CV Page (remaining 50%)
2. Add Dashboard translations
3. Add Job Tailor translations  
4. Update all remaining pages
5. Final testing

---

## Note for Batch Updates

Due to the large number of files, consider using find/replace in IDE for common patterns:
- `"My CVs"` → `{t("cv.title")}`
- `"Upload CV"` → `{t("cv.uploadCV")}`
- etc.

This will be faster than individual search_replace operations.

