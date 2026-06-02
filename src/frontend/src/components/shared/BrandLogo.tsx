import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { APP_NAME, LOGO_SRC } from '@/lib/constants';
import { cn } from '@/lib/utils';

const sizeClasses = {
  sm: 'h-7 w-auto',
  md: 'h-9 w-auto',
  lg: 'h-11 w-auto',
} as const;

type BrandLogoProps = {
  showText?: boolean;
  hideTextOnMobile?: boolean;
  size?: keyof typeof sizeClasses;
  className?: string;
  imageClassName?: string;
  asLink?: boolean;
};

export function BrandLogo({
  showText = true,
  hideTextOnMobile = false,
  size = 'md',
  className,
  imageClassName,
  asLink = true,
}: BrandLogoProps) {
  const content = (
    <span className={cn('flex items-center gap-2.5 shrink-0', className)}>
      <Image
        src={LOGO_SRC}
        alt={APP_NAME}
        width={462}
        height={348}
        className={cn('object-contain', sizeClasses[size], imageClassName)}
        priority={size !== 'sm'}
      />
      {showText && (
        <span
          className={cn(
            'font-bold text-lg leading-tight',
            hideTextOnMobile && 'hidden sm:inline',
          )}
          style={{ color: 'var(--color-text-primary)' }}
        >
          Ba<span style={{ color: 'var(--color-warning)' }}>.</span>Li Homestay
        </span>
      )}
    </span>
  );

  if (asLink) {
    return (
      <Link href="/" className="shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
