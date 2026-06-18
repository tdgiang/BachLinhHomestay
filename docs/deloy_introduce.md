# Hướng dẫn Deploy lên VPS Ubuntu

## Yêu cầu hệ thống

| Thành phần | Tối thiểu | Khuyến nghị |
|---|---|---|
| OS | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |
| RAM | 2 GB | 4 GB |
| CPU | 1 vCPU | 2 vCPU |
| Ổ đĩa | 20 GB SSD | 40 GB SSD |
| Domain | Đã trỏ A record về IP VPS | — |

---

## Bước 1 — Chuẩn bị VPS

### 1.1 Kết nối SSH và cập nhật hệ thống

```bash
ssh root@<IP_VPS>

apt update && apt upgrade -y
apt install -y curl git ufw
```

### 1.2 Cấu hình Firewall

```bash
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
ufw status
```

---

## Bước 2 — Cài đặt Docker

```bash
# Cài Docker Engine
curl -fsSL https://get.docker.com | sh

# Kiểm tra
docker --version
docker compose version
```

---

## Bước 3 — Cấu hình DNS

Trỏ các bản ghi A về IP VPS tại nhà cung cấp domain:

| Hostname | Type | Value |
|---|---|---|
| `bachlinh.com.vn` | A | `<IP_VPS>` |
| `www.bachlinh.com.vn` | A | `<IP_VPS>` |
| `cdn.bachlinh.com.vn` | A | `<IP_VPS>` |

> Đợi DNS propagate (thường 5–30 phút). Kiểm tra bằng: `ping bachlinh.com.vn`

---

## Bước 4 — Clone code lên VPS

```bash
# Tạo thư mục ứng dụng
mkdir -p /opt/bachlinhweb

# Clone repository
cd /opt
git clone <REPO_URL> bachlinhweb
cd bachlinhweb
```

---

## Bước 5 — Cấu hình biến môi trường

```bash
# Copy từ file mẫu
cp .env.prod.example .env

# Mở để chỉnh sửa
nano .env
```

Điền đầy đủ các giá trị:

```env
# ── Domain ───────────────────────────────────────────────────────────────────
SITE_URL=https://bachlinh.com.vn
API_URL=https://bachlinh.com.vn

# ── Database ──────────────────────────────────────────────────────────────────
POSTGRES_USER=homestay_user
POSTGRES_PASSWORD=<MẬT_KHẨU_MẠNH_POSTGRES>

# ── Redis ─────────────────────────────────────────────────────────────────────
REDIS_PASSWORD=<MẬT_KHẨU_MẠNH_REDIS>

# ── JWT ───────────────────────────────────────────────────────────────────────
# Tạo bằng: openssl rand -hex 64
JWT_SECRET=<64_KÝ_TỰ_NGẪU_NHIÊN>
JWT_REFRESH_SECRET=<64_KÝ_TỰ_NGẪU_NHIÊN_KHÁC>

# ── NextAuth ──────────────────────────────────────────────────────────────────
# Tạo bằng: openssl rand -base64 32
AUTH_SECRET=<BASE64_32_BYTES>

# ── MinIO ─────────────────────────────────────────────────────────────────────
MINIO_ACCESS_KEY=<MINIO_USER>
MINIO_SECRET_KEY=<MẬT_KHẨU_MẠNH_MINIO>

# ── VNPay (production) ────────────────────────────────────────────────────────
VNPAY_TMN_CODE=<MÃ_TMN_THẬT>
VNPAY_HASH_SECRET=<HASH_SECRET_THẬT>
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
```

### Tạo các secret ngẫu nhiên nhanh:

```bash
# JWT secrets
openssl rand -hex 64   # chạy 2 lần, dùng cho JWT_SECRET và JWT_REFRESH_SECRET

# AUTH_SECRET
openssl rand -base64 32

# Mật khẩu mạnh ngẫu nhiên
openssl rand -base64 24
```

---

## Bước 6 — Cấp chứng chỉ SSL (Let's Encrypt)

SSL phải có trước khi start nginx với config HTTPS.

### 6.1 Cài Certbot

```bash
sudo apt install -y certbot
```

### 6.2 Cấp cert (dừng nginx nếu đang chạy trên port 80)

```bash
# Cấp cert cho cả 3 subdomain cùng lúc
sudo certbot certonly --standalone \
  -d bachlinh.com.vn \
  -d www.bachlinh.com.vn \
  -d cdn.bachlinh.com.vn \
  --email tdgiangdev@gmail.com \
  --agree-tos \
  --no-eff-email
```

### 6.3 Copy cert vào thư mục nginx

```bash
mkdir -p /opt/bachlinhweb/nginx/ssl

cp /etc/letsencrypt/live/bachlinh.com.vn/fullchain.pem /opt/bachlinhweb/nginx/ssl/
cp /etc/letsencrypt/live/bachlinh.com.vn/privkey.pem   /opt/bachlinhweb/nginx/ssl/

chmod 600 /opt/bachlinhweb/nginx/ssl/privkey.pem
```

### 6.4 Tự động gia hạn cert

```bash
# Tạo script gia hạn
tee /etc/cron.d/certbot-renew > /dev/null << 'EOF'
0 3 * * * root certbot renew --quiet --pre-hook "docker compose -f /opt/bachlinhweb/docker-compose.prod.yml stop nginx" --post-hook "cp /etc/letsencrypt/live/bachlinh.com.vn/fullchain.pem /opt/bachlinhweb/nginx/ssl/ && cp /etc/letsencrypt/live/bachlinh.com.vn/privkey.pem /opt/bachlinhweb/nginx/ssl/ && docker compose -f /opt/bachlinhweb/docker-compose.prod.yml start nginx"
EOF
```

---

## Bước 7 — Build và Deploy lần đầu

```bash
cd /opt/bachlinhweb

# Build tất cả images (mất 5–15 phút lần đầu)
docker compose -f docker-compose.prod.yml --env-file .env build

# Khởi động toàn bộ stack
docker compose -f docker-compose.prod.yml --env-file .env up -d

# Theo dõi quá trình khởi động
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

Đợi đến khi thấy:
```
Application is running on: http://localhost:4000/api/v1
```

---

## Bước 8 — Seed dữ liệu ban đầu

Chạy một lần duy nhất sau khi deploy lần đầu:

```bash
cd /opt/bachlinhweb

# Copy tsconfig vào container để ts-node chạy được
docker cp src/backend/tsconfig.json bachlinhweb-api-1:/app/tsconfig.json
docker cp src/backend/tsconfig.build.json bachlinhweb-api-1:/app/tsconfig.build.json

# Chạy seed
docker exec bachlinhweb-api-1 \
  node_modules/.bin/ts-node --project tsconfig.json \
  -e "require('tsconfig-paths/register'); require('./prisma/seed.ts')"
```

Kết quả thành công:
```
✅ Seed completed:
   Admin: admin@homestay.vn / Admin@123
   3 branches | 9 rooms | 34 images | 82 amenity links | vouchers
```

> **Quan trọng:** Đổi mật khẩu admin ngay sau khi đăng nhập lần đầu.

---

## Bước 9 — Kiểm tra

```bash
# Kiểm tra tất cả containers đang chạy
docker compose -f docker-compose.prod.yml ps

# Test API
curl https://bachlinh.com.vn/api/v1/branches

# Test login
curl -s -X POST https://bachlinh.com.vn/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@homestay.vn","password":"Admin@123"}' | python3 -m json.tool

# Test health
curl https://bachlinh.com.vn/health
```

---

## Bước 10 — Cập nhật code (Redeploy)

Mỗi khi có code mới:

```bash
cd /opt/bachlinhweb

# Pull code mới
git pull origin master

# Rebuild service đã thay đổi (ví dụ cả api lẫn web)
docker compose -f docker-compose.prod.yml --env-file .env build api web

# Restart không downtime (rolling)
docker compose -f docker-compose.prod.yml --env-file .env up -d --no-deps api
docker compose -f docker-compose.prod.yml --env-file .env up -d --no-deps web

# Kiểm tra logs sau deploy
docker compose -f docker-compose.prod.yml logs --tail=50 api
docker compose -f docker-compose.prod.yml logs --tail=50 web
```

---

## Lệnh vận hành thường dùng

```bash
# Xem trạng thái tất cả services
docker compose -f docker-compose.prod.yml ps

# Xem logs real-time
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml logs -f api    # chỉ backend
docker compose -f docker-compose.prod.yml logs -f web    # chỉ frontend
docker compose -f docker-compose.prod.yml logs -f nginx  # chỉ nginx

# Restart một service
docker compose -f docker-compose.prod.yml restart api
docker compose -f docker-compose.prod.yml restart web

# Dừng toàn bộ (giữ data)
docker compose -f docker-compose.prod.yml down

# Dừng và xóa toàn bộ data (NGUY HIỂM)
docker compose -f docker-compose.prod.yml down -v
```

---

## Backup Database

```bash
# Tạo thư mục backup
mkdir -p /opt/bachlinhweb/backups

# Backup thủ công
docker exec bachlinhweb-postgres-1 \
  pg_dump -U homestay_user homestay | \
  gzip > /opt/bachlinhweb/backups/db_$(date +%Y%m%d_%H%M%S).sql.gz

# Tự động backup hàng ngày lúc 2 giờ sáng
tee /etc/cron.d/db-backup > /dev/null << 'EOF'
0 2 * * * root docker exec bachlinhweb-postgres-1 pg_dump -U homestay_user homestay | gzip > /opt/bachlinhweb/backups/db_$(date +\%Y\%m\%d).sql.gz && find /opt/bachlinhweb/backups -name "*.sql.gz" -mtime +30 -delete
EOF

# Restore backup
gunzip -c /opt/bachlinhweb/backups/db_20260601.sql.gz | \
  docker exec -i bachlinhweb-postgres-1 \
  psql -U homestay_user homestay
```

---

## Xử lý sự cố

### Container api liên tục restart

```bash
docker logs bachlinhweb-api-1 --tail=50
# Thường do DATABASE_URL sai hoặc postgres chưa sẵn sàng
```

### Lỗi SSL / không truy cập được HTTPS

```bash
# Kiểm tra cert còn hạn không
sudo certbot certificates

# Copy lại cert nếu đã gia hạn
cp /etc/letsencrypt/live/bachlinh.com.vn/fullchain.pem /opt/bachlinhweb/nginx/ssl/
cp /etc/letsencrypt/live/bachlinh.com.vn/privkey.pem   /opt/bachlinhweb/nginx/ssl/
docker compose -f docker-compose.prod.yml restart nginx
```

### Hết dung lượng ổ đĩa

```bash
# Xóa Docker images/containers không dùng
docker system prune -af

# Xem dung lượng Docker đang dùng
docker system df
```

### Xem tài nguyên hệ thống

```bash
# CPU, RAM, Network của từng container
docker stats

# Ổ đĩa
df -h
du -sh /opt/bachlinhweb/backups/
```

---

## Tổng quan kiến trúc trên VPS

```
Internet
    │
    ▼
[Nginx :80/:443]  ←── SSL cert từ Let's Encrypt
    │
    ├─ /api/v1/*  ──►  [NestJS API :4000]  ──►  [PostgreSQL :5432]
    │                                       ──►  [Redis :6379]
    │                                       ──►  [MinIO :9000]
    │
    └─ /*         ──►  [Next.js :3000]
    └─ /api/*     ──►  [Next.js :3000]  (NextAuth)

cdn.bachlinh.com.vn  ──►  [MinIO :9000]  (ảnh phòng)
```
