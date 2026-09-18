/**
 * Ẩn các chi nhánh không thuộc phạm vi cung cấp dịch vụ đã công bố.
 *
 * Bối cảnh: website công bố theo Điều 9b NĐ 248/2026/NĐ-CP rằng Ba.Li Homestay
 * chỉ cung cấp dịch vụ tại cơ sở Cầu Giấy, Hà Nội. Nhưng DB production còn các
 * chi nhánh demo (Phú Quốc, Đà Lạt, TP. Hồ Chí Minh) do seed cũ tạo ra, cùng
 * vài bản ghi thử. Chúng vẫn hiển thị công khai — mâu thuẫn trực tiếp với nội
 * dung đã công bố.
 *
 * Script này KHÔNG xóa gì. Chỉ đặt isActive = false để giữ nguyên lịch sử đơn
 * đặt phòng, đồng thời đặt rooms của các chi nhánh đó về trạng thái inactive
 * để chúng không còn xuất hiện trong kết quả tìm phòng.
 *
 * Mặc định chạy ở chế độ xem trước (dry-run). Thêm --apply để thực sự ghi.
 *
 * Trên máy dev (từ thư mục src/backend):
 *   npx ts-node -r tsconfig-paths/register src/scripts/hide-demo-branches.ts
 *   npx ts-node -r tsconfig-paths/register src/scripts/hide-demo-branches.ts --apply
 *
 * Trên production — file nằm trong src/ nên được `nest build` biên dịch sẵn vào
 * dist/, chạy bằng node thuần, không cần ts-node hay tsconfig:
 *   docker compose -f docker-compose.prod.yml exec api \\
 *     node dist/src/scripts/hide-demo-branches.js
 *   docker compose -f docker-compose.prod.yml exec api \\
 *     node dist/src/scripts/hide-demo-branches.js --apply
 */
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Prisma 7 bắt buộc dùng adapter — cùng cách khởi tạo như prisma/seed.ts.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter } as any);

/** Chi nhánh được giữ hoạt động. Mọi chi nhánh khác sẽ bị ẩn. */
const KEEP_BRANCH_IDS = new Set<string>([
  // Cập nhật danh sách này nếu mở thêm cơ sở thật.
  'br-cg-01',
]);

/** Từ khóa nhận diện chi nhánh nằm ngoài phạm vi công bố, dùng để cảnh báo. */
const OUT_OF_SCOPE = [
  'Phú Quốc',
  'Đà Lạt',
  'Sài Gòn',
  'Hồ Chí Minh',
  'Đà Nẵng',
  'Hội An',
];

async function main() {
  const apply = process.argv.includes('--apply');

  const branches = await prisma.branch.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { rooms: true } } },
  });

  console.log(`\nTổng số chi nhánh trong DB: ${branches.length}\n`);

  const toHide: typeof branches = [];

  for (const b of branches) {
    const keep = KEEP_BRANCH_IDS.has(b.id);
    const suspicious = OUT_OF_SCOPE.some(
      (k) => b.name.includes(k) || b.city.includes(k),
    );

    // Đếm đơn đặt phòng thật để không âm thầm ẩn chi nhánh đang hoạt động.
    const bookingCount = await prisma.booking.count({
      where: { room: { branchId: b.id } },
    });

    const mark = keep ? 'GIỮ ' : 'ẨN  ';
    const warn = suspicious ? '  [ngoài phạm vi công bố]' : '';
    const bookings =
      bookingCount > 0 ? `  [${bookingCount} đơn đặt phòng]` : '';
    console.log(
      `  ${mark} ${b.id.padEnd(38)} ${b.name} — ${b.city}` +
        `  (${b._count.rooms} phòng)${bookings}${warn}`,
    );

    if (!keep) {
      if (bookingCount > 0) {
        console.log(
          `        ↑ chi nhánh này CÓ đơn đặt phòng. Kiểm tra kỹ trước khi ẩn.`,
        );
      }
      toHide.push(b);
    }
  }

  if (toHide.length === 0) {
    console.log('\nKhông có chi nhánh nào cần ẩn.\n');
    return;
  }

  if (!apply) {
    console.log(
      `\nXem trước: sẽ ẩn ${toHide.length} chi nhánh và toàn bộ phòng của chúng.`,
    );
    console.log('Chạy lại kèm --apply để thực hiện.\n');
    return;
  }

  const ids: string[] = toHide.map((b) => b.id);
  const [branchResult, roomResult] = await prisma.$transaction([
    prisma.branch.updateMany({
      where: { id: { in: ids } },
      data: { isActive: false },
    }),
    prisma.room.updateMany({
      where: { branchId: { in: ids } },
      data: { status: 'inactive' },
    }),
  ]);

  console.log(
    `\nĐã ẩn ${branchResult.count} chi nhánh và ${roomResult.count} phòng.`,
  );
  console.log(
    'Kiểm tra lại: GET /api/v1/branches (công khai) chỉ còn chi nhánh đang hoạt động.\n',
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
