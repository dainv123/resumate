# Backend Scripts & Migrations Guide

## Database Migrations

### Available Commands

```bash
# Generate a new migration
npm run migration:generate

# Run all pending migrations
npm run migration:run

# Revert the last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

### Migration Workflow

1. **Generate Migration**: Tạo migration mới dựa trên thay đổi entities
   ```bash
   npm run migration:generate
   ```

2. **Review Migration**: Kiểm tra file migration được tạo trong `src/migrations/`

3. **Run Migration**: Chạy migration để cập nhật database
   ```bash
   npm run migration:run
   ```

4. **Revert if Needed**: Nếu có lỗi, có thể revert migration
   ```bash
   npm run migration:revert
   ```

## Database Setup

### Quick Setup
```bash
# Setup database với migrations và seed data
npm run db:setup
```

### Reset Database
```bash
# Reset hoàn toàn database (revert + run + seed)
npm run db:reset
```

## Seeding Scripts

### CV Templates Seeding
```bash
# Seed CV templates vào database
npm run seed:templates
```

Script này sẽ:
- Seed các template mặc định
- Thêm các template mới (dynamic, show-all, modern, creative, minimal, executive)
- Bỏ qua các template đã tồn tại
- Hiển thị summary về số lượng template đã seed

## Environment Setup

Đảm bảo có file `.env` với các biến sau:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=resumate
NODE_ENV=development
```

## Troubleshooting

### Migration Issues
- Kiểm tra kết nối database
- Đảm bảo database đã được tạo
- Kiểm tra quyền truy cập database

### Seeding Issues
- Đảm bảo đã chạy migrations trước
- Kiểm tra log để xem lỗi cụ thể
- Có thể chạy lại script seeding an toàn

### Common Commands

```bash
# Check migration status
npm run migration:show

# Run specific migration (if needed)
npx typeorm-ts-node-commonjs migration:run -d src/config/database.config.ts

# Generate migration với tên cụ thể
npx typeorm-ts-node-commonjs migration:generate src/migrations/AddNewFeature -d src/config/database.config.ts
```

