# Resumate — Product intent

Ứng dụng giúp freelancer / người đi làm **cập nhật CV & Portfolio** từ project mới hoặc Job Description (JD), rồi **chuẩn bị phỏng vấn** theo đúng role.

Mục tiêu: giảm chỉnh tay, giữ tone chuyên nghiệp, nói cùng ngôn ngữ với JD.

---

## Core product (đã có trong codebase)

### 1. Import & quản lý CV
- Upload PDF/DOCX → AI parse (học vấn, kinh nghiệm, skills, projects) → lưu JSON.
- Sửa tay, version history / restore / duplicate.
- Export: PDF, Word, ATS text.

### 2. Cập nhật từ project mới
- Nhập project (tên, role, stack, kết quả) → AI bullet points → gắn vào CV.

### 3. Job Tailor
- Paste JD → CV tailored theo keywords/requirements.
- Compatibility score + gợi ý gap.
- Cover letter generator.

### 4. Portfolio
- Sinh portfolio từ CV/projects, nhiều template (Basic, Creative, Modern, …).
- Public URL theo username; export HTML.

### 5. Interview Prep
- JD + CV → roadmap PASS, question bank (impact-scored), STAR stories, project defense.
- Readiness score, mock drills (Pro), cheat-sheet PDF (Pro).

### 6. Supporting product surface
- Analytics (exports, activity).
- Dark mode, UI EN/VI.
- Freemium limits (free vs pro) trên upload / tailor / export / prep.

---

## User flow

1. Đăng ký → upload CV → review bản parse.  
2. Thêm project → AI bullets → update CV.  
3. Có JD → tailor (+ score / cover letter) → export.  
4. Publish portfolio link.  
5. Sắp phỏng vấn → tạo prep plan → làm task / mock → cheat sheet.

---

## Khác biệt so với LinkedIn / CV builder thông thường

| | LinkedIn / generic builder | Resumate |
|--|---------------------------|----------|
| Profile | Một profile cố định | Nhiều bản CV (gốc + tailored) |
| JD fit | Thủ công | Tailor + compatibility + cover letter |
| Projects → CV | Copy/paste | AI bullets + sync |
| Interview | Không / generic AI | Roadmap + curated bank + mock |
| Portfolio | Hạn chế | Hosted template + share link |

---

## Business model

**Free:** 1 CV upload, 3 projects, 5 tailor, 10 exports, 1 interview-prep plan, 3 mock drills (theo period reset).

**Pro:** Unlimited các quota trên + full Interview Prep pack (mock scoring, cheat sheet, …).

Đối tượng: freelancer, consultant, designer/dev đổi job thường xuyên, ứng viên cần nhiều bản CV theo JD.

---

## Ghi chú docs

- Chi tiết kỹ thuật / setup: [../README.md](../README.md)
- Interview Prep: [INTERVIEW_PREP_FEATURE.md](./INTERVIEW_PREP_FEATURE.md)
- Job Tailor extras: [JOB_TAILOR_FEATURES.md](./JOB_TAILOR_FEATURES.md)

Các file status/i18n cũ trong `requiments/` có thể lệch — ưu tiên code + README khi conflict.
