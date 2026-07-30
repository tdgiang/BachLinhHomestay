"use client";

import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import {
  Plus,
  MapPin,
  Phone,
  Edit2,
  Trash2,
  Search,
  Globe,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import { apiClient } from "@/lib/api-client";
import type { Branch } from "@/types";

const LocationPicker = dynamic(
  () => import("@/components/admin/LocationPicker"),
  { ssr: false },
);

// ─── helpers ──────────────────────────────────────────────────────────────────

function emptyForm() {
  return {
    name: "",
    nameEn: "",
    address: "",
    city: "",
    phone: "",
    latitude: "",
    longitude: "",
    description: "",
    descriptionEn: "",
    isActive: true,
  };
}

type FormState = ReturnType<typeof emptyForm>;

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-gray-600">{label}</Label>
      {children}
    </div>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

async function getToken(): Promise<string> {
  const session = await getSession();
  return (session as { accessToken?: string })?.accessToken ?? "";
}

export default function AdminBranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Branch | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  // delete dialog
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // ── load ──────────────────────────────────────────────────────────────────

  async function load() {
    setLoading(true);
    try {
      const data = await apiClient.getBranches();
      setBranches(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // ── filter ────────────────────────────────────────────────────────────────

  const filtered = branches.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      b.city.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q)
    );
  });

  // ── open create ───────────────────────────────────────────────────────────

  function openCreate() {
    setEditTarget(null);
    setForm(emptyForm());
    setFormError("");
    setFormOpen(true);
  }

  // ── open edit ─────────────────────────────────────────────────────────────

  function openEdit(b: Branch) {
    setEditTarget(b);
    setForm({
      name: b.name,
      nameEn: b.nameEn ?? "",
      address: b.address,
      city: b.city,
      phone: b.phone ?? "",
      latitude: b.latitude != null ? String(b.latitude) : "",
      longitude: b.longitude != null ? String(b.longitude) : "",
      description: b.description ?? "",
      descriptionEn: b.descriptionEn ?? "",
      isActive: b.isActive,
    });
    setFormError("");
    setFormOpen(true);
  }

  // ── save (create or update) ───────────────────────────────────────────────

  async function handleSave() {
    if (!form.name.trim()) {
      setFormError("Tên chi nhánh không được để trống.");
      return;
    }
    if (!form.address.trim()) {
      setFormError("Địa chỉ không được để trống.");
      return;
    }
    if (!form.city.trim()) {
      setFormError("Thành phố không được để trống.");
      return;
    }

    const dto = {
      name: form.name.trim(),
      nameEn: form.nameEn.trim() || undefined,
      address: form.address.trim(),
      city: form.city.trim(),
      phone: form.phone.trim() || undefined,
      latitude: form.latitude ? Number(form.latitude) : undefined,
      longitude: form.longitude ? Number(form.longitude) : undefined,
      description: form.description.trim() || undefined,
      descriptionEn: form.descriptionEn.trim() || undefined,
      isActive: form.isActive,
    };

    setSaving(true);
    setFormError("");
    try {
      const token = await getToken();
      if (editTarget) {
        const updated = await apiClient.updateBranch(editTarget.id, dto, token);
        setBranches((prev) =>
          prev.map((b) => (b.id === updated.id ? updated : b)),
        );
      } else {
        const created = await apiClient.createBranch(dto, token);
        setBranches((prev) => [created, ...prev]);
      }
      setFormOpen(false);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ── delete ────────────────────────────────────────────────────────────────

  function openDelete(b: Branch) {
    setDeleteTarget(b);
    setDeleteError("");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError("");
    try {
      const token = await getToken();
      await apiClient.deleteBranch(deleteTarget.id, token);
      setBranches((prev) => prev.filter((b) => b.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error ? err.message : "Xóa thất bại. Vui lòng thử lại.",
      );
    } finally {
      setDeleting(false);
    }
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quản lý chi nhánh</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {branches.length} chi nhánh
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="gap-2 bg-[#00B4D8] hover:bg-[#0077B6] text-sm"
        >
          <Plus size={15} /> Thêm chi nhánh
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <Input
          placeholder="Tìm theo tên, thành phố, địa chỉ..."
          className="pl-8 h-9 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-sm text-gray-400">
          {search
            ? "Không tìm thấy chi nhánh phù hợp."
            : "Chưa có chi nhánh nào."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((branch) => (
            <div
              key={branch.id}
              className="bg-white rounded-xl border p-5 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                  <MapPin size={18} className="text-[#00B4D8]" />
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-[#00B4D8]"
                    onClick={() => openEdit(branch)}
                    title="Chỉnh sửa"
                  >
                    <Edit2 size={13} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-gray-400 hover:text-red-500"
                    onClick={() => openDelete(branch)}
                    title="Xóa chi nhánh"
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-gray-900 leading-snug">
                {branch.name}
              </h3>
              {branch.nameEn && (
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Globe size={10} /> {branch.nameEn}
                </p>
              )}

              <p className="text-sm text-gray-500 mt-2 flex items-start gap-1.5">
                <MapPin size={12} className="shrink-0 mt-0.5" />
                <span>
                  {branch.address}, {branch.city}
                </span>
              </p>
              {branch.phone && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                  <Phone size={12} className="shrink-0" />
                  {branch.phone}
                </p>
              )}
              {branch.latitude && branch.longitude && (
                <p className="text-xs text-gray-400 mt-1">
                  {Number(branch.latitude).toFixed(4)},{" "}
                  {Number(branch.longitude).toFixed(4)}
                </p>
              )}

              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    branch.isActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {branch.isActive ? "Đang hoạt động" : "Tạm ngừng"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit dialog ─────────────────────────────────────────── */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!saving) setFormOpen(open);
        }}
      >
        <DialogContent className="!max-w-4xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editTarget ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Tên chi nhánh *">
                <Input
                  placeholder="Homestay Ba.Li — Cầu Giấy"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </FormField>
              <FormField label="Tên tiếng Anh">
                <Input
                  placeholder="Ba.Li — Cau Giay"
                  value={form.nameEn}
                  onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                />
              </FormField>
            </div>

            {/* Address + City */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField label="Địa chỉ *">
                <Input
                  placeholder="12 Bạch Đằng, Hải Châu"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Thành phố *">
                <Input
                  placeholder="Hà Nội"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </FormField>
            </div>

            {/* Phone */}
            <FormField label="Số điện thoại">
              <Input
                placeholder="0236 123 4567"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </FormField>

            {/* Location picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-600">
                Vị trí trên bản đồ
              </Label>
              <LocationPicker
                lat={form.latitude ? Number(form.latitude) : null}
                lng={form.longitude ? Number(form.longitude) : null}
                onChange={(lat, lng) =>
                  setForm((f) => ({
                    ...f,
                    latitude: String(lat),
                    longitude: String(lng),
                  }))
                }
              />
            </div>

            {/* Lat / Lng manual inputs */}
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Vĩ độ (latitude)">
                <Input
                  placeholder="16.0544"
                  type="number"
                  step="any"
                  value={form.latitude}
                  onChange={(e) =>
                    setForm({ ...form, latitude: e.target.value })
                  }
                />
              </FormField>
              <FormField label="Kinh độ (longitude)">
                <Input
                  placeholder="108.2022"
                  type="number"
                  step="any"
                  value={form.longitude}
                  onChange={(e) =>
                    setForm({ ...form, longitude: e.target.value })
                  }
                />
              </FormField>
            </div>

            {/* Description */}
            <FormField label="Mô tả (tiếng Việt)">
              <Textarea
                placeholder="Mô tả chi nhánh..."
                rows={2}
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </FormField>
            <FormField label="Mô tả (tiếng Anh)">
              <Textarea
                placeholder="Branch description in English..."
                rows={2}
                value={form.descriptionEn}
                onChange={(e) =>
                  setForm({ ...form, descriptionEn: e.target.value })
                }
              />
            </FormField>

            {/* isActive toggle */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none ${
                  form.isActive ? "bg-[#00B4D8]" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    form.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {form.isActive ? "Đang hoạt động" : "Tạm ngừng hoạt động"}
              </span>
            </div>

            {formError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                {formError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setFormOpen(false)}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#00B4D8] hover:bg-[#0077B6] min-w-[100px]"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editTarget ? (
                "Lưu thay đổi"
              ) : (
                "Tạo chi nhánh"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete confirm dialog ────────────────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!deleting && !open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500 shrink-0" />
              Xóa chi nhánh
            </DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-2 text-sm text-gray-600">
            <p>
              Bạn chắc chắn muốn xóa chi nhánh{" "}
              <span className="font-semibold text-gray-900">
                {deleteTarget?.name}
              </span>
              ?
            </p>
            <p className="text-xs text-gray-400">
              Hành động này không thể hoàn tác. Chi nhánh chỉ có thể xóa khi
              không còn phòng liên kết.
            </p>
            {deleteError && (
              <p className="text-red-500 bg-red-50 rounded-lg px-3 py-2 text-xs">
                {deleteError}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="min-w-[80px]"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Xóa"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
