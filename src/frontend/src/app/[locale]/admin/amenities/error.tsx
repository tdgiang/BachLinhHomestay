'use client';

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <p className="text-red-500 font-medium">Không thể tải danh sách tiện ích.</p>
      <button
        onClick={reset}
        className="px-4 py-2 bg-[#00B4D8] text-white rounded-lg text-sm hover:bg-[#0077B6]"
      >
        Thử lại
      </button>
    </div>
  );
}
