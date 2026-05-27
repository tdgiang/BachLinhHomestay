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
} from "lucide-react";
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
import type { Branch, Room, RoomImage } from "@/types";

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
  { id: "images", label: "Hình ảnh", icon: ImageIcon },
] as const;
type TabId = (typeof TABS)[number]["id"];

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
    apiClient
      .getBranches()
      .then(setBranches)
      .catch(() => {});
    if (!isNew) {
      apiClient
        .getRoom(id)
        .then((r) => {
          setRoom(r);
          setImages(r.images ?? []);
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
        // Upload any images that were queued before the room existed
        if (pendingFiles.length > 0) {
          await Promise.allSettled(
            pendingFiles.map(({ file }) => apiClient.uploadRoomImage(created.id, file, token)),
          );
          pendingFiles.forEach(({ preview }) => URL.revokeObjectURL(preview));
        }
        router.push(`/${locale}/admin/rooms/${created.id}`);
      } else {
        const updated = await apiClient.updateRoom(id, dto, token);
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
