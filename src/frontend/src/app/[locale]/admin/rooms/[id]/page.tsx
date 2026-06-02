"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSession } from "next-auth/react";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  Upload,
  Trash2,
  Star,
  ImageIcon,
  Info,
  DollarSign,
  Settings,
  Plus,
  X,
  Package,
  Search,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";
import type { Amenity, AmenityCategory, Branch, Room, RoomAmenity, RoomImage } from "@/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<AmenityCategory, string> = {
  basic: "Cơ bản",
  entertainment: "Giải trí",
  convenience: "Tiện lợi",
  safety: "An toàn",
};

function AmenityIconPreview({ name, className }: { name: string | null; className?: string }) {
  if (!name) return <Package className={className} />;
  const iconName = name.charAt(0).toUpperCase() + name.slice(1);
  const Icon = (LucideIcons as any)[iconName] as React.ComponentType<{ className?: string }> | undefined;
  return Icon ? <Icon className={className} /> : <Package className={className} />;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const RoomSchema = z.object({
  name: z.string().min(1, "Bắt buộc"),
  nameEn: z.string().optional(),
  description: z.string().optional(),
  descriptionEn: z.string().optional(),
  branchId: z.string().min(1, "Chọn chi nhánh"),
  roomNumber: z.string().min(1, "Bắt buộc"),
  floor: z.coerce.number().optional(),
  capacity: z.coerce.number().min(1),
  pricePerHour: z.coerce.number().min(0),
  pricePerHourOriginal: z.coerce.number().optional(),
  pricePerDay: z.coerce.number().min(0),
  pricePerDayOriginal: z.coerce.number().optional(),
  minHours: z.coerce.number().min(1),
  extraHourPrice: z.coerce.number().optional(),
  extraPersonPrice: z.coerce.number().optional(),
  checkInTime: z.string(),
  checkOutTime: z.string(),
  allowHourly: z.boolean(),
  status: z.enum(["active", "maintenance", "inactive"]),
  isFeatured: z.boolean(),
  isGuestFavorite: z.boolean(),
});
type RoomFormData = z.infer<typeof RoomSchema>;

const TABS = [
  { id: "info", label: "Thông tin", icon: Info },
  { id: "price", label: "Giá", icon: DollarSign },
  { id: "settings", label: "Cài đặt", icon: Settings },
  { id: "amenities", label: "Tiện ích", icon: Package },
  { id: "images", label: "Hình ảnh", icon: ImageIcon },
] as const;
type TabId = (typeof TABS)[number]["id"];

interface AmenitySelection {
  amenityId: string;
  isFeatured: boolean;
  isFree: boolean;
  price: number | null;
}

async function getToken() {
  const s = await getSession();
  return (s as { accessToken?: string })?.accessToken ?? "";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoomEditPage() {
  const { id, locale } = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const isNew = id === "new";

  const [tab, setTab] = useState<TabId>("info");
  const [room, setRoom] = useState<Room | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [images, setImages] = useState<RoomImage[]>([]);
  const [allAmenities, setAllAmenities] = useState<Amenity[]>([]);
  const [amenitySelections, setAmenitySelections] = useState<AmenitySelection[]>([]);
  // Files queued before the room exists (create-new flow)
  const [pendingFiles, setPendingFiles] = useState<{ file: File; preview: string }[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RoomFormData>({
    resolver: zodResolver(RoomSchema),
    defaultValues: {
      capacity: 2,
      minHours: 2,
      allowHourly: true,
      status: "active",
      isFeatured: false,
      isGuestFavorite: false,
      checkInTime: "14:00",
      checkOutTime: "11:00",
      pricePerHour: 0,
      pricePerDay: 0,
    },
  });

  // ── load ────────────────────────────────────────────────────────────────

  useEffect(() => {
    apiClient.getBranches().then(setBranches).catch(() => {});
    apiClient.getAmenities().then((res) => setAllAmenities(res.items)).catch(() => {});
    if (!isNew) {
      apiClient
        .getRoom(id)
        .then((r) => {
          setRoom(r);
          setImages(r.images ?? []);
          setAmenitySelections(
            (r.amenities ?? []).map((ra: RoomAmenity) => ({
              amenityId: ra.amenityId,
              isFeatured: ra.isFeatured,
              isFree: ra.isFree,
              price: ra.price,
            })),
          );
          const keys: (keyof RoomFormData)[] = [
            "name",
            "nameEn",
            "description",
            "descriptionEn",
            "branchId",
            "roomNumber",
            "floor",
            "capacity",
            "pricePerHour",
            "pricePerHourOriginal",
            "pricePerDay",
            "pricePerDayOriginal",
            "minHours",
            "extraHourPrice",
            "extraPersonPrice",
            "checkInTime",
            "checkOutTime",
            "allowHourly",
            "status",
            "isFeatured",
            "isGuestFavorite",
          ];
          keys.forEach((k) => {
            const v = (r as unknown as Record<string, unknown>)[k];
            if (v != null) setValue(k, v as never);
          });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isNew]);

  // ── submit ──────────────────────────────────────────────────────────────

  const onSubmit = async (data: RoomFormData) => {
    setSaving(true);
    setSaveError("");
    setSaveSuccess(false);
    try {
      const token = await getToken();
      const dto = {
        ...data,
        floor: data.floor || undefined,
        pricePerHourOriginal: data.pricePerHourOriginal || undefined,
        pricePerDayOriginal: data.pricePerDayOriginal || undefined,
        extraHourPrice: data.extraHourPrice || undefined,
        extraPersonPrice: data.extraPersonPrice || undefined,
      };
      if (isNew) {
        const created = await apiClient.createRoom(dto, token);
        // Upload images queued before the room existed
        if (pendingFiles.length > 0) {
          await Promise.allSettled(
            pendingFiles.map(({ file }) => apiClient.uploadRoomImage(created.id, file, token)),
          );
          pendingFiles.forEach(({ preview }) => URL.revokeObjectURL(preview));
        }
        // Sync amenities selected before creation
        if (amenitySelections.length > 0) {
          await apiClient.syncRoomAmenities(created.id, amenitySelections, token);
        }
        router.push(`/${locale}/admin/rooms/${created.id}`);
      } else {
        const updated = await apiClient.updateRoom(id, dto, token);
        await apiClient.syncRoomAmenities(id, amenitySelections, token);
        setRoom(updated);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-6 h-6 animate-spin text-gray-300" />
      </div>
    );

  return (
    <div className="space-y-5">
      {/* ── Breadcrumb / Header ── */}
      <div className="flex items-center gap-3">
        <Link href={`/${locale}/admin/rooms`}>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-gray-100"
          >
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {isNew ? "Thêm phòng mới" : (room?.name ?? "Chỉnh sửa phòng")}
          </h1>
          {!isNew && room && (
            <p className="text-xs text-gray-400 mt-0.5">
              Phòng {room.roomNumber}
              {room.floor != null ? ` · Tầng ${room.floor}` : ""} ·{" "}
              {room.branch?.name}
            </p>
          )}
        </div>
        {!isNew && room && (
          <span
            className={`ml-auto text-xs px-2.5 py-1 rounded-full font-medium border ${
              room.status === "active"
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : room.status === "maintenance"
                  ? "bg-amber-100 text-amber-700 border-amber-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
            }`}
          >
            {
              {
                active: "Hoạt động",
                maintenance: "Bảo trì",
                inactive: "Ngừng",
              }[room.status]
            }
          </span>
        )}
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button
            key={tid}
            type="button"
            onClick={() => setTab(tid)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === tid
                ? "border-[#00B4D8] text-[#00B4D8]"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <Icon size={14} />
            {label}
            {tid === "images" && (images.length + pendingFiles.length) > 0 && (
              <span className="ml-1 bg-[#00B4D8] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {images.length + pendingFiles.length}
              </span>
            )}
            {tid === "amenities" && amenitySelections.length > 0 && (
              <span className="ml-1 bg-[#00B4D8] text-white text-xs rounded-full w-4 h-4 flex items-center justify-center leading-none">
                {amenitySelections.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border shadow-sm p-6">
          {/* ── Tab: Thông tin ── */}
          {tab === "info" && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F
                  label="Tên phòng (Tiếng Việt) *"
                  error={errors.name?.message}
                >
                  <Input
                    {...register("name")}
                    placeholder="Phòng Deluxe Hướng Phố"
                  />
                </F>
                <F label="Tên phòng (Tiếng Anh)">
                  <Input
                    {...register("nameEn")}
                    placeholder="Deluxe City View Room"
                  />
                </F>
              </div>
              <F label="Mô tả (Tiếng Việt)">
                <Textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Mô tả ngắn về phòng..."
                  className="resize-none"
                />
              </F>
              <F label="Mô tả (Tiếng Anh)">
                <Textarea
                  {...register("descriptionEn")}
                  rows={3}
                  placeholder="Short room description..."
                  className="resize-none"
                />
              </F>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <F label="Chi nhánh *" error={errors.branchId?.message}>
                  <Select
                    value={watch("branchId") ?? ""}
                    onValueChange={(v) => v && setValue("branchId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn chi nhánh" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b.id} value={b.id}>
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </F>
                <F label="Số phòng *" error={errors.roomNumber?.message}>
                  <Input {...register("roomNumber")} placeholder="101" />
                </F>
                <F label="Tầng">
                  <Input {...register("floor")} type="number" placeholder="1" />
                </F>
              </div>
              <F
                label="Sức chứa tối đa (người) *"
                error={errors.capacity?.message}
              >
                <Input
                  {...register("capacity")}
                  type="number"
                  className="w-32"
                />
              </F>
            </div>
          )}

          {/* ── Tab: Giá ── */}
          {tab === "price" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 text-xs text-blue-700">
                Giá gốc (nếu có) dùng để hiển thị khuyến mãi gạch giá trên giao
                diện đặt phòng.
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <F
                  label="Giá theo giờ (₫) *"
                  error={errors.pricePerHour?.message}
                >
                  <Input
                    {...register("pricePerHour")}
                    type="number"
                    placeholder="150,000"
                  />
                </F>
                <F label="Giá gốc theo giờ (₫)">
                  <Input
                    {...register("pricePerHourOriginal")}
                    type="number"
                    placeholder="200,000"
                  />
                </F>
                <F
                  label="Giá theo ngày (₫) *"
                  error={errors.pricePerDay?.message}
                >
                  <Input
                    {...register("pricePerDay")}
                    type="number"
                    placeholder="1,200,000"
                  />
                </F>
                <F label="Giá gốc theo ngày (₫)">
                  <Input
                    {...register("pricePerDayOriginal")}
                    type="number"
                    placeholder="1,500,000"
                  />
                </F>
              </div>
              <div className="border-t pt-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Phụ thu
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <F
                    label="Số giờ tối thiểu *"
                    error={errors.minHours?.message}
                  >
                    <Input
                      {...register("minHours")}
                      type="number"
                      placeholder="2"
                    />
                  </F>
                  <F label="Phụ thu thêm giờ (₫)">
                    <Input
                      {...register("extraHourPrice")}
                      type="number"
                      placeholder="50,000"
                    />
                  </F>
                  <F label="Phụ thu thêm người (₫)">
                    <Input
                      {...register("extraPersonPrice")}
                      type="number"
                      placeholder="100,000"
                    />
                  </F>
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Cài đặt ── */}
          {tab === "settings" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 max-w-xs">
                <F label="Check-in">
                  <Input {...register("checkInTime")} type="time" />
                </F>
                <F label="Check-out">
                  <Input {...register("checkOutTime")} type="time" />
                </F>
              </div>
              <F label="Trạng thái phòng">
                <Select
                  value={watch("status")}
                  onValueChange={(v) =>
                    v &&
                    setValue(
                      "status",
                      v as "active" | "maintenance" | "inactive",
                    )
                  }
                >
                  <SelectTrigger className="w-52">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">✅ Hoạt động</SelectItem>
                    <SelectItem value="maintenance">🔧 Bảo trì</SelectItem>
                    <SelectItem value="inactive">⛔ Ngừng hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </F>
              <div className="border-t pt-4 space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                  Tùy chọn
                </p>
                <Toggle
                  label="Cho phép đặt theo giờ"
                  checked={watch("allowHourly")}
                  onChange={(v) => setValue("allowHourly", v)}
                />
                <Toggle
                  label="Phòng nổi bật (hiển thị trên trang chủ)"
                  checked={watch("isFeatured")}
                  onChange={(v) => setValue("isFeatured", v)}
                />
                <Toggle
                  label="Được khách yêu thích (Guest Favorite badge)"
                  checked={watch("isGuestFavorite")}
                  onChange={(v) => setValue("isGuestFavorite", v)}
                />
              </div>
            </div>
          )}

          {/* ── Tab: Tiện ích ── */}
          {tab === "amenities" && (
            <AmenitiesTab
              allAmenities={allAmenities}
              selections={amenitySelections}
              onChange={setAmenitySelections}
            />
          )}

          {/* ── Tab: Hình ảnh ── */}
          {tab === "images" && (
            <ImageTab
              roomId={isNew ? null : id}
              images={images}
              onImagesChange={setImages}
              pendingFiles={pendingFiles}
              onPendingFilesChange={setPendingFiles}
            />
          )}
        </div>

        {/* ── Save bar ── */}
        {(tab !== "images" || isNew) && (
          <div className="flex items-center justify-between mt-4 bg-white rounded-xl border shadow-sm px-5 py-3.5">
            <div>
              {saveError && (
                <p className="text-sm text-red-500 flex items-center gap-1.5">
                  <X size={14} /> {saveError}
                </p>
              )}
              {saveSuccess && (
                <p className="text-sm text-emerald-600 flex items-center gap-1.5">
                  <CheckCircle size={14} /> Đã lưu thành công!
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Link href={`/${locale}/admin/rooms`}>
                <Button type="button" variant="outline" size="sm">
                  Hủy
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={saving}
                className="bg-[#00B4D8] hover:bg-[#0077B6] min-w-28 gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {pendingFiles.length > 0 ? `Đang tạo & upload ${pendingFiles.length} ảnh...` : "Đang lưu..."}
                  </>
                ) : isNew ? (
                  pendingFiles.length > 0 ? `Tạo phòng & upload ${pendingFiles.length} ảnh` : "Tạo phòng"
                ) : (
                  "Lưu thay đổi"
                )}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}

// ─── AmenitiesTab ─────────────────────────────────────────────────────────────

const ROOM_CATEGORY_CONFIG: Record<AmenityCategory, { color: string; bg: string; border: string; dot: string }> = {
  basic:         { color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200",   dot: "bg-blue-400" },
  entertainment: { color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-200", dot: "bg-violet-400" },
  convenience:   { color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  dot: "bg-amber-400" },
  safety:        { color: "text-emerald-600",bg: "bg-emerald-50",border: "border-emerald-200",dot: "bg-emerald-400" },
};

function Chip({
  active, onClick,
}: { active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-5 h-5 rounded flex items-center justify-center shrink-0 border-2 transition-all ${
        active
          ? "bg-[#00B4D8] border-[#00B4D8]"
          : "border-gray-300 hover:border-[#00B4D8]/50 bg-white"
      }`}
    >
      {active && (
        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-none stroke-current stroke-2">
          <path d="M1 4l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function MiniToggle({
  checked, onChange, label,
}: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-8 h-4 rounded-full transition-colors focus:outline-none ${
          checked ? "bg-[#00B4D8]" : "bg-gray-200"
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0"
        }`} />
      </button>
      <span className="text-xs text-gray-600">{label}</span>
    </label>
  );
}

function AmenitiesTab({
  allAmenities,
  selections,
  onChange,
}: {
  allAmenities: Amenity[];
  selections: AmenitySelection[];
  onChange: (s: AmenitySelection[]) => void;
}) {
  const [search, setSearch] = useState("");

  const isSelected = (id: string) => selections.some((s) => s.amenityId === id);
  const getSel     = (id: string) => selections.find((s) => s.amenityId === id);

  const toggle = (amenity: Amenity) => {
    if (isSelected(amenity.id)) {
      onChange(selections.filter((s) => s.amenityId !== amenity.id));
    } else {
      onChange([...selections, { amenityId: amenity.id, isFeatured: false, isFree: true, price: null }]);
    }
  };

  const patch = (amenityId: string, p: Partial<AmenitySelection>) =>
    onChange(selections.map((s) => (s.amenityId === amenityId ? { ...s, ...p } : s)));

  const q = search.toLowerCase();
  const filtered = allAmenities.filter(
    (a) => !q || a.name.toLowerCase().includes(q) || (a.nameEn ?? "").toLowerCase().includes(q),
  );

  const grouped = (Object.keys(CATEGORY_LABELS) as AmenityCategory[])
    .map((cat) => ({ category: cat, items: filtered.filter((a) => a.category === cat) }))
    .filter((g) => g.items.length > 0);

  if (allAmenities.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <Package size={24} className="text-gray-300" />
        </div>
        <p className="font-semibold text-gray-600">Chưa có tiện ích nào</p>
        <p className="text-sm text-gray-400 mt-1">
          Vào{" "}
          <a href="../amenities" className="text-[#00B4D8] underline font-medium">
            Quản lý tiện ích
          </a>{" "}
          để thêm trước.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm tiện ích..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B4D8]/25"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-[#00B4D8]/8 rounded-xl border border-[#00B4D8]/20">
          <span className="text-lg font-bold text-[#00B4D8] leading-none">{selections.length}</span>
          <span className="text-xs text-gray-500 leading-tight">/ {allAmenities.length}<br />đã chọn</span>
        </div>
      </div>

      {/* Quick-select selected chips */}
      {selections.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selections.map((sel) => {
            const a = allAmenities.find((x) => x.id === sel.amenityId);
            if (!a) return null;
            const cfg = ROOM_CATEGORY_CONFIG[a.category as AmenityCategory];
            return (
              <span
                key={sel.amenityId}
                className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.color} ${cfg.border}`}
              >
                <AmenityIconPreview name={a.icon} className="w-3 h-3" />
                {a.name}
                <button
                  type="button"
                  onClick={() => onChange(selections.filter((s) => s.amenityId !== sel.amenityId))}
                  className="ml-0.5 opacity-60 hover:opacity-100"
                >
                  <X size={10} />
                </button>
              </span>
            );
          })}
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded-full hover:bg-red-50 transition-colors"
          >
            Bỏ tất cả
          </button>
        </div>
      )}

      {/* Grouped amenities */}
      <div className="space-y-5">
        {grouped.map(({ category, items }) => {
          const cfg = ROOM_CATEGORY_CONFIG[category];
          return (
            <div key={category}>
              {/* Category header */}
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-1.5 h-4 rounded-full ${cfg.dot}`} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.color}`}>
                  {CATEGORY_LABELS[category]}
                </span>
                <div className="flex-1 border-t border-gray-100" />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {items.map((amenity) => {
                  const selected = isSelected(amenity.id);
                  const sel      = getSel(amenity.id);
                  return (
                    <div
                      key={amenity.id}
                      className={`rounded-xl border-2 transition-all duration-150 ${
                        selected
                          ? `${cfg.border} ${cfg.bg}`
                          : "border-gray-100 bg-white hover:border-gray-200"
                      }`}
                    >
                      {/* Main row */}
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => toggle(amenity)}
                      >
                        <Chip active={selected} onClick={() => toggle(amenity)} />
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                          selected ? cfg.bg : "bg-gray-100"
                        }`}>
                          <AmenityIconPreview name={amenity.icon}
                            className={`w-4 h-4 ${selected ? cfg.color : "text-gray-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${selected ? "text-gray-900" : "text-gray-700"}`}>
                            {amenity.name}
                          </p>
                          {amenity.nameEn && (
                            <p className="text-xs text-gray-400 truncate">{amenity.nameEn}</p>
                          )}
                        </div>
                      </div>

                      {/* Options panel */}
                      {selected && sel && (
                        <div className={`px-3 pb-3 pt-2 border-t ${cfg.border} space-y-2`}>
                          <div className="flex items-center gap-5 flex-wrap">
                            <MiniToggle
                              checked={sel.isFeatured}
                              onChange={(v) => patch(amenity.id, { isFeatured: v })}
                              label="Nổi bật"
                            />
                            <MiniToggle
                              checked={sel.isFree}
                              onChange={(v) => patch(amenity.id, { isFree: v, price: v ? null : sel.price })}
                              label="Miễn phí"
                            />
                          </div>
                          {!sel.isFree && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 shrink-0">Phí:</span>
                              <div className="relative flex-1">
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={sel.price ?? ""}
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => patch(amenity.id, {
                                    price: e.target.value ? Number(e.target.value) : null,
                                  })}
                                  className="w-full text-xs border rounded-lg pl-2 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#00B4D8]"
                                />
                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">₫</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ImageTab ─────────────────────────────────────────────────────────────────

function ImageTab({
  roomId,
  images,
  onImagesChange,
  pendingFiles,
  onPendingFilesChange,
}: {
  roomId: string | null;
  images: RoomImage[];
  onImagesChange: (imgs: RoomImage[]) => void;
  pendingFiles: { file: File; preview: string }[];
  onPendingFilesChange: (files: { file: File; preview: string }[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Add files: upload immediately if room exists, queue as pending if not
  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const valid = Array.from(files).filter((f) => {
        if (!f.type.startsWith("image/")) return false;
        if (f.size > 5 * 1024 * 1024) { setUploadError(`${f.name} vượt quá 5MB`); return false; }
        return true;
      });
      if (valid.length === 0) return;

      if (!roomId) {
        // Queue for later — show local preview
        const newPending = valid.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        }));
        onPendingFilesChange([...pendingFiles, ...newPending]);
        return;
      }

      setUploading(true);
      setUploadError("");
      try {
        const token = await getToken();
        const results: RoomImage[] = [];
        for (const file of valid) {
          const img = await apiClient.uploadRoomImage(roomId, file, token);
          results.push(img);
        }
        onImagesChange([...images, ...results]);
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : "Upload thất bại");
      } finally {
        setUploading(false);
      }
    },
    [roomId, images, onImagesChange, pendingFiles, onPendingFilesChange],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  async function handleDelete(imageId: string) {
    if (!roomId) return;
    try {
      await apiClient.deleteRoomImage(roomId, imageId, await getToken());
      onImagesChange(images.filter((i) => i.id !== imageId));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Xóa thất bại");
    }
  }

  function handleRemovePending(preview: string) {
    URL.revokeObjectURL(preview);
    onPendingFilesChange(pendingFiles.filter((p) => p.preview !== preview));
  }

  async function handleSetCover(imageId: string) {
    if (!roomId) return;
    try {
      await apiClient.setRoomImageCover(roomId, imageId, await getToken());
      onImagesChange(images.map((i) => ({ ...i, isCover: i.id === imageId })));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Cập nhật thất bại");
    }
  }

  const totalCount = images.length + pendingFiles.length;

  return (
    <div className="space-y-5">
      {/* Upload zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
          dragging
            ? "border-[#00B4D8] bg-[#00B4D8]/5 scale-[1.01]"
            : "border-gray-200 hover:border-[#00B4D8] hover:bg-gray-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-[#00B4D8]" />
            <p className="text-sm text-gray-500">Đang upload...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Upload size={20} className="text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-700">
              Kéo thả ảnh vào đây
            </p>
            <p className="text-xs text-gray-400 mt-1">
              hoặc click để chọn file
            </p>
            <p className="text-xs text-gray-300 mt-2">
              JPG · PNG · WebP · tối đa 5MB/ảnh
            </p>
          </>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-2.5 flex items-center gap-2">
          <X size={14} /> {uploadError}
        </p>
      )}

      {/* Pending notice */}
      {!roomId && pendingFiles.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <Upload size={13} className="shrink-0" />
          {pendingFiles.length} ảnh sẽ được upload tự động sau khi bấm "Tạo phòng"
        </div>
      )}

      {/* Image grid */}
      {totalCount === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400 border rounded-xl bg-gray-50">
          <ImageIcon size={28} className="mx-auto mb-2 text-gray-200" />
          Chưa có ảnh nào. Upload ảnh để hiển thị trên trang đặt phòng.
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">{totalCount} ảnh</p>
            {roomId && <p className="text-xs text-gray-400">Click ảnh để đặt làm ảnh bìa</p>}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">

            {/* Uploaded images (edit mode) */}
            {images.map((img) => (
              <div
                key={img.id}
                className={`relative group rounded-xl overflow-hidden aspect-video bg-gray-100 cursor-pointer ring-2 transition-all ${
                  img.isCover ? "ring-[#00B4D8] shadow-md" : "ring-transparent hover:ring-gray-300"
                }`}
                onClick={() => !img.isCover && handleSetCover(img.id)}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                {img.isCover && (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-[#00B4D8] text-white text-xs px-2 py-0.5 rounded-full font-medium shadow">
                    <Star size={10} className="fill-white" /> Bìa
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!img.isCover && (
                    <button
                      type="button"
                      title="Đặt làm ảnh bìa"
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      onClick={(e) => { e.stopPropagation(); handleSetCover(img.id); }}
                    >
                      <Star size={13} className="text-amber-500" />
                    </button>
                  )}
                  <button
                    type="button"
                    title="Xóa ảnh"
                    className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                    onClick={(e) => { e.stopPropagation(); handleDelete(img.id); }}
                  >
                    <Trash2 size={13} className="text-white" />
                  </button>
                </div>
              </div>
            ))}

            {/* Pending (local preview) images (create mode) */}
            {pendingFiles.map(({ file, preview }) => (
              <div
                key={preview}
                className="relative group rounded-xl overflow-hidden aspect-video bg-gray-100 ring-2 ring-dashed ring-amber-300"
              >
                <img src={preview} alt={file.name} className="w-full h-full object-cover opacity-80" />
                <div className="absolute top-2 left-2 bg-amber-400 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                  Chờ upload
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    type="button"
                    title="Bỏ ảnh này"
                    className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
                    onClick={() => handleRemovePending(preview)}
                  >
                    <Trash2 size={13} className="text-white" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add more */}
            <div
              onClick={() => inputRef.current?.click()}
              className="aspect-video rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#00B4D8] hover:bg-gray-50 transition-colors"
            >
              <Plus size={20} className="text-gray-300" />
              <span className="text-xs text-gray-300 mt-1">Thêm ảnh</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function F({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer py-2 group">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${checked ? "bg-[#00B4D8]" : "bg-gray-200"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
        />
      </button>
      <span className="text-sm text-gray-700 group-hover:text-gray-900">
        {label}
      </span>
    </label>
  );
}
