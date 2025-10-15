# Hướng dẫn lấy SEO Keys cho Resumate

## 🔑 2 Keys cần lấy:

### 1. GOOGLE_SITE_VERIFICATION
**Mục đích:** Xác thực quyền sở hữu website với Google Search Console

**Cách lấy:**
1. Truy cập: https://search.google.com/search-console
2. Đăng nhập bằng Google account
3. Click "Add Property"
4. Chọn "URL prefix" và nhập domain của bạn
5. Chọn verification method: "HTML tag"
6. Copy đoạn code:
   ```html
   <meta name="google-site-verification" content="abc123xyz..." />
   ```
7. Lấy phần `content="..."` (bỏ dấu ngoặc kép)

**Ví dụ:** `GOOGLE_SITE_VERIFICATION=abc123xyz456def789`

---

### 2. NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
**Mục đích:** Tracking analytics và user behavior

**Cách lấy:**
1. Truy cập: https://analytics.google.com
2. Tạo GA4 property mới (nếu chưa có):
   - Click "Start measuring"
   - Nhập tên property: "Resumate"
   - Chọn timezone và currency
   - Chọn business category
   - Tạo Data Stream cho Web
3. Copy "Measurement ID" (format: G-XXXXXXXXXX)

**Ví dụ:** `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-ABC123XYZ4`

---

## 📝 Cập nhật file .env.local:

Tạo file `.env.local` trong thư mục `frontend/` với nội dung:

```bash
# Frontend Environment Variables
PORT=5000
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_URL=http://localhost:5000

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here

# SEO Configuration
GOOGLE_SITE_VERIFICATION=your_google_verification_code_here
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_ga_id_here

# App Configuration
NEXT_PUBLIC_APP_NAME=Resumate
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## 🚀 Sau khi cập nhật:

1. **Restart development server:**
   ```bash
   npm run dev
   ```

2. **Test SEO features:**
   - Kiểm tra meta tags trong browser
   - Verify Google Search Console
   - Test Google Analytics tracking

3. **Deploy production:**
   ```bash
   npm run build
   ```

---

## 📊 Lợi ích của 2 keys này:

### Google Search Console:
- Monitor search performance
- Track keyword rankings
- Identify technical SEO issues
- Submit sitemap
- View Core Web Vitals

### Google Analytics 4:
- Track user behavior
- Monitor conversion rates
- Analyze traffic sources
- View real-time data
- Custom event tracking

---

## 🔧 Troubleshooting:

**Nếu Google Search Console không verify:**
- Đảm bảo meta tag được add vào `<head>`
- Check domain chính xác
- Wait 24-48 hours

**Nếu Google Analytics không track:**
- Kiểm tra Measurement ID format (G-XXXXXXXXXX)
- Verify domain trong GA4 settings
- Check browser console for errors

---

## 📱 Mobile App (nếu có):
Để track mobile app, thêm vào GA4:
1. Tạo thêm Data Stream cho Mobile App
2. Cấu hình Firebase (nếu dùng React Native)
3. Thêm tracking code cho mobile

---

*Lưu ý: Các keys này chỉ cần thiết khi deploy production. Development có thể hoạt động mà không cần.*
