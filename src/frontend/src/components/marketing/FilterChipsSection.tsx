'use client';

import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { FilterChips } from './FilterChips';

export function FilterChipsSection() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Determine active chip from current URL params
  const type = searchParams.get('type');
  const priceMax = searchParams.get('priceMax');
  const search = searchParams.get('search');

  let active = '';
  if (type === 'hourly') active = 'hourly';
  else if (type === 'daily') active = 'daily';
  else if (priceMax === '500000') active = 'under500k';
  else if (search === 'ban công') active = 'balcony';
  else if (search === 'bồn tắm') active = 'bathtub';
  else if (search === 'duplex') active = 'duplex';
  else if (search === 'gác xép') active = 'loft';

  const handleSelect = (value: string) => {
    if (!value) { router.push('/#rooms'); return; }
    const params = new URLSearchParams();
    if (value === 'hourly') params.set('type', 'hourly');
    else if (value === 'daily') params.set('type', 'daily');
    else if (value === 'under500k') params.set('priceMax', '500000');
    else if (value === 'balcony') params.set('search', 'ban công');
    else if (value === 'bathtub') params.set('search', 'bồn tắm');
    else if (value === 'duplex') params.set('search', 'duplex');
    else if (value === 'loft') params.set('search', 'gác xép');
    router.push(`/?${params.toString()}#rooms`);
  };

  return (
    <FilterChips active={active} onSelect={handleSelect} />
  );
}
