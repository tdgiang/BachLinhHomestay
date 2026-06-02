'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface DescriptionSectionProps {
  description: string;
}

export function DescriptionSection({ description }: DescriptionSectionProps) {
  const t = useTranslations('room');
  const [expanded, setExpanded] = useState(false);

  const lines = description.split('\n');
  const isLong = lines.length > 3 || description.length > 250;
  const displayText = !isLong || expanded ? description : description.slice(0, 250) + '...';

  return (
    <div>
      <h2 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>
        {t('description')}
      </h2>
      <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--color-text-primary)' }}>
        {displayText}
      </p>
      {isLong && (
        <button
          onClick={() => setExpanded((v) => !v)}
          className="mt-2 text-sm font-semibold underline hover:opacity-70 transition-opacity"
          style={{ color: 'var(--color-text-primary)' }}
        >
          {expanded ? t('readLess') : t('readMore')}
        </button>
      )}
    </div>
  );
}
