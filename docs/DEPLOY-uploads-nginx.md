# Hướng dẫn deploy lên VPS — sửa lỗi ảnh 404 và ẩn chi nhánh demo

Áp dụng cho đợt thay đổi: thêm `location /uploads/` vào nginx, thêm volume
`uploads_data`, bỏ MinIO, sửa `deleteImage`, ẩn chi nhánh ngoài phạm vi công bố.

**Đọc hết một lượt trước khi bắt đầu.** Có bước không hoàn tác được.

---

## ⚠️ Ba điểm bẫy của quy trình deploy hiện tại

**1. Ảnh cũ sẽ biến mất nếu không sao lưu trước.**
Trước đây service `api` không có volume, nên ảnh nằm trong lớp ghi của container.
Sau khi thêm `uploads_data:/app/uploads`, volume rỗng sẽ **mount đè** lên thư mục
đó. Ảnh cũ vẫn nằm trong container cũ cho tới khi container bị xoá — nhưng
`docker compose up -d` sẽ tạo container mới và xoá container cũ. Vì vậy phải sao
lưu **trước** khi chạy `up -d`.

**2. CI/CD không khởi động lại nginx.**
`.github/workflows/deploy.yml` chỉ build `api` và `web`. File `nginx.conf` được
bind-mount nên `git pull` cập nhật file trên đĩa, nhưng nginx đang chạy vẫn giữ
config cũ trong bộ nhớ. Phải reload nginx thủ công, nếu không ảnh vẫn 404.

**3. Container MinIO sẽ thành mồ côi.**
Service `minio` đã bị xoá khỏi compose. `docker compose up -d` bình thường sẽ để
container cũ chạy tiếp. Cần thêm `--remove-orphans`.

---

## Bước 0 — Trên máy của bạn: đẩy code lên

Kiểm tra nhánh mà VPS đang dùng trước (xem Bước 1). Giả sử là `production`:

```bash
cd ~/Desktop/BachLinhWeb
git add -A
git commit -m "fix: phục vụ ảnh upload qua nginx, thêm volume uploads, bỏ MinIO"
git push origin production
```

CI/CD chỉ tự chạy khi push vào `master`. Nếu VPS dùng `production` thì các bước
dưới đây làm thủ công qua SSH.

---

## Bước 1 — SSH vào VPS và xác định hiện trạng

```bash
ssh <user>@<ip-vps>
cd /opt/bachlinhweb

git branch --show-current          # VPS đang ở nhánh nào?
git log --oneline -1               # commit hiện tại
docker compose -f docker-compose.prod.yml ps
```

Ghi lại tên nhánh. Các bước sau dùng đúng nhánh đó.

---

## Bước 2 — Sao lưu (BẮT BUỘC, làm trước mọi thứ)

### 2a. Sao lưu ảnh đang có trong container

```bash
docker compose -f docker-compose.prod.yml cp api:/app/uploads ./uploads-backup
ls -R ./uploads-backup | head -20
du -sh ./uploads-backup
```

Nếu lệnh báo không có thư mục `/app/uploads`, nghĩa là chưa có ảnh nào được
upload sau lần deploy gần nhất — bỏ qua phần khôi phục ở Bước 6.

### 2b. Sao lưu cơ sở dữ liệu

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" homestay > ~/homestay-$(date +%F-%H%M).sql
ls -lh ~/homestay-*.sql
```

Nếu biến `$POSTGRES_USER` không có sẵn trong shell, lấy từ file `.env`:

```bash
grep POSTGRES_USER .env
```

**Không sang bước tiếp theo nếu hai file sao lưu chưa tồn tại và chưa có dung
lượng hợp lý.**

---

## Bước 3 — Lấy code mới

```bash
cd /opt/bachlinhweb
git pull origin <nhánh-ở-bước-1>
```

Kiểm tra nginx.conf đã có block mới chưa:

```bash
grep -A3 "location /uploads/" nginx/nginx.conf
```

Phải thấy `proxy_pass http://api;`. Không thấy thì `git pull` chưa lấy đúng nhánh.

---

## Bước 4 — Kiểm tra cú pháp nginx trước khi áp dụng

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -t
```

Phải ra `syntax is ok` và `test is successful`. Nếu báo lỗi, dừng lại và gửi tôi
nội dung lỗi — **đừng reload nginx khi test chưa qua**, sẽ làm sập cả site.

---

## Bước 5 — Build và khởi động lại

```bash
docker compose -f docker-compose.prod.yml build --no-cache api web
docker compose -f docker-compose.prod.yml up -d --remove-orphans
```

`--remove-orphans` sẽ xoá container MinIO cũ. Volume `minio_data` vẫn giữ nguyên
trên đĩa, không mất dữ liệu — xoá sau nếu chắc chắn không cần.

Migration `20260918010000_complaints_composite_indexes` chạy tự động khi container
`api` khởi động (xem `CMD` trong `Dockerfile.prod`). Kiểm tra:

```bash
docker compose -f docker-compose.prod.yml logs api | grep -i migrat | tail -5
```

---

## Bước 6 — Khôi phục ảnh cũ vào volume mới

Bỏ qua bước này nếu Bước 2a không có file nào.

```bash
docker compose -f docker-compose.prod.yml cp ./uploads-backup/. api:/app/uploads
docker compose -f docker-compose.prod.yml exec api ls -la /app/uploads/rooms | head
```

Từ giờ ảnh nằm trong volume `uploads_data`, không mất khi deploy lại nữa.

---

## Bước 7 — Reload nginx (CI/CD KHÔNG làm bước này)

```bash
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

Nếu lệnh trên báo lỗi, dùng cách chắc chắn hơn:

```bash
docker compose -f docker-compose.prod.yml restart nginx
```

---

## Bước 8 — Kiểm tra ảnh đã hiển thị

Lấy một URL ảnh thật từ API:

```bash
curl -s https://bachlinh.com.vn/api/v1/rooms?limit=5 \
  | grep -o 'https://bachlinh.com.vn/uploads/[^"]*' | head -1
```

Rồi kiểm tra URL đó:

```bash
curl -I https://bachlinh.com.vn/uploads/rooms/<tên-file>.webp
```

| Kết quả | Ý nghĩa |
|---|---|
| `200` + `Content-Type: image/webp` | Đã sửa xong |
| `404` + `Content-Type: text/html` | nginx chưa reload, quay lại Bước 7 |
| `404` + `Content-Type: text/plain` hoặc từ nginx | File không có trên đĩa, xem lại Bước 6 |

Mở trình duyệt vào một trang phòng và xác nhận ảnh hiện.

---

## Bước 9 — Ẩn chi nhánh ngoài phạm vi công bố

Website công bố chỉ cung cấp dịch vụ tại cơ sở Cầu Giấy, nhưng DB production còn
chi nhánh Phú Quốc, Đà Lạt, Sài Gòn đang hiển thị công khai.

### 9a. Xem trước (không ghi gì)

```bash
docker compose -f docker-compose.prod.yml exec api \
  node dist/src/scripts/hide-demo-branches.js
```

**Đọc kỹ danh sách in ra.** Script chỉ giữ chi nhánh có id `br-cg-01`. Production
của bạn còn "Homestay Mỹ Đình" và "Chi nhánh HN" với id dạng UUID — chúng sẽ bị
ẩn. Nếu một trong hai chính là cơ sở Cầu Giấy đang dùng thật, **dừng lại**, thêm
id đó vào `KEEP_BRANCH_IDS` ở đầu file
`src/backend/src/scripts/hide-demo-branches.ts`, commit, pull và build lại rồi
chạy tiếp.

Script cũng cảnh báo nếu chi nhánh sắp ẩn có đơn đặt phòng thật.

### 9b. Thực hiện

```bash
docker compose -f docker-compose.prod.yml exec api \
  node dist/src/scripts/hide-demo-branches.js --apply
```

Script **không xoá** gì, chỉ đặt `isActive = false` và đưa phòng về `inactive`,
nên lịch sử đơn đặt phòng giữ nguyên và có thể bật lại bất cứ lúc nào.

Script nằm trong `src/` nên được `nest build` biên dịch sẵn vào `dist/`, chạy
bằng `node` thuần — không cần `ts-node` hay `tsconfig`. Nếu vì lý do nào đó lệnh
trên không chạy được, dùng SQL trực tiếp:

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d homestay <<'SQL'
BEGIN;
SELECT id, name, city, is_active FROM branches ORDER BY created_at;
SQL
```

Xem danh sách, rồi ẩn đúng những id không thuộc phạm vi:

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d homestay <<'SQL'
BEGIN;
UPDATE rooms SET status = 'inactive'
  WHERE branch_id IN ('br-pq-01','br-dl-01','br-hcm-01');
UPDATE branches SET is_active = false
  WHERE id IN ('br-pq-01','br-dl-01','br-hcm-01');
SELECT id, name, city, is_active FROM branches ORDER BY created_at;
COMMIT;
SQL
```

Sửa danh sách id trong hai câu `UPDATE` cho khớp thực tế trước khi chạy.

### 9c. Kiểm tra

```bash
curl -s https://bachlinh.com.vn/api/v1/branches | python3 -m json.tool | grep '"name"'
```

Chỉ còn chi nhánh đang hoạt động. Trang chủ cũng phải hiện đúng số chi nhánh ở
ô thống kê.

---

## Bước 10 — Dọn dẹp

```bash
# Xoá biến MinIO không còn dùng khỏi .env
grep -n MINIO .env          # xem trước
# rồi mở .env xoá các dòng MINIO_*

docker image prune -f
```

Giữ lại `uploads-backup/` và file `.sql` ít nhất một tuần.

---

## Nếu có sự cố — cách quay lại

```bash
cd /opt/bachlinhweb
git log --oneline -5
git reset --hard <commit-trước-khi-deploy>
docker compose -f docker-compose.prod.yml build --no-cache api web
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml restart nginx
```

Khôi phục DB nếu cần:

```bash
cat ~/homestay-<ngày>.sql | docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U "$POSTGRES_USER" -d homestay
```

Việc ẩn chi nhánh hoàn tác bằng cách đặt lại `is_active = true`, không cần khôi
phục toàn bộ DB.

---

## Đề xuất sửa CI/CD sau này

Thêm reload nginx và `--remove-orphans` vào `.github/workflows/deploy.yml` để lần
sau không phải làm tay:

```yaml
            docker compose -f docker-compose.prod.yml build --no-cache api web
            docker compose -f docker-compose.prod.yml up -d --remove-orphans
            docker compose -f docker-compose.prod.yml exec -T nginx nginx -t
            docker compose -f docker-compose.prod.yml exec -T nginx nginx -s reload
```

Lưu ý workflow hiện chỉ chạy khi push vào `master`, trong khi nhánh làm việc là
`production`. Cần thống nhất một nhánh.
