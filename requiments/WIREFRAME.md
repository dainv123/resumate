

## **Wireframe (Text-based)**

### 1. Onboarding

* **Màn hình chào mừng**: Logo + tagline *“Update CV của bạn trong 1 phút”*.
* Nút **[Sign up / Login]** → Google / Email.

---

### 2. Dashboard (CV Manager)

* Thanh menu bên trái:

  * **My CV**
  * **Projects**
  * **Job Tailor**
  * **Portfolio**

* Khu vực chính:

  * Nếu chưa có CV → nút **[Upload CV]**.
  * Nếu có CV → hiển thị preview bản CV hiện tại + nút **[Update CV]**.

---

### 3. Upload CV

* **Upload box**: Kéo thả file (PDF, DOCX).
* AI parsing → loading animation.
* Kết quả:

  * Hiển thị bảng phân tích: Học vấn / Kinh nghiệm / Kỹ năng / Dự án.
  * Cho phép user chỉnh sửa thủ công.
  * Nút **[Save CV]**.

---

### 4. Projects Manager

* Danh sách dự án đã lưu.
* Nút **[Add Project]** → form nhập:

  * Tên dự án
  * Vai trò
  * Công nghệ
  * Kết quả (số liệu/nổi bật)
* AI gợi ý bullet points → user chỉnh sửa → **[Add to CV]**.

---

### 5. Job Tailor (JD → CV)

* Upload hoặc paste JD.
* AI phân tích keywords → hiển thị list **“Kỹ năng yêu cầu”**.
* Hiển thị gợi ý:

  * “Nên highlight Project A vì phù hợp JD.”
  * “Thêm keyword X vào kinh nghiệm Y.”
* Nút **[Generate Tailored CV]** → preview → **[Export PDF]**.

---

### 6. Portfolio

* Template chọn (Basic / Modern / Creative).
* Tự động lấy data từ Projects.
* Cho phép thêm ảnh, link demo, Github.
* Preview Portfolio page + share link: `username.autocv.app/portfolio`.

---

### 7. Export CV

* Nút **Export** → chọn:

  * PDF (ATS-friendly / Design template)
  * Word
  * JSON (cho import về sau).

---

## **Trải nghiệm người dùng (flow)**

1. Upload CV → có dữ liệu cơ bản.
2. Mỗi khi có project mới → vào Projects → thêm → CV tự update.
3. Khi apply job → vào Job Tailor → upload JD → xuất CV tailored.
4. Muốn show profile đẹp → Portfolio link.
