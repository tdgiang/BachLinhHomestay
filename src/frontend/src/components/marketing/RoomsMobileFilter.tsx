'use client';

import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { RoomsFilterSidebar } from './RoomsFilterSidebar';
import type { Branch, RoomQuery } from '@/types';

interface Props {
  branches: Branch[];
  currentQuery: RoomQuery;
}

export function RoomsMobileFilter({ branches, currentQuery }: Props) {
  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="gap-2" />
        }
      >
        <SlidersHorizontal className="w-4 h-4" />
        Lọc
      </SheetTrigger>
      <SheetContent side="right" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <RoomsFilterSidebar branches={branches} currentQuery={currentQuery} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
