'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Error]', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
      <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
        <AlertTriangle size={22} className="text-red-500" />
      </div>
      <div>
        <p className="font-semibold text-gray-800">Đã xảy ra lỗi</p>
        <p className="text-sm text-gray-400 mt-1">{error.message || 'Vui lòng thử lại'}</p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Thử lại
      </Button>
    </div>
  );
}
