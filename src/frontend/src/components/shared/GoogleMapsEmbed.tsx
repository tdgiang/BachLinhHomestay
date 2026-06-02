interface GoogleMapsEmbedProps {
  latitude: number;
  longitude: number;
  label?: string;
  height?: number;
  className?: string;
}

export function GoogleMapsEmbed({
  latitude,
  longitude,
  label,
  height = 320,
  className,
}: GoogleMapsEmbedProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

  const src = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${latitude},${longitude}&zoom=15`
    : `https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`;

  return (
    <div
      className={`rounded-[var(--radius-card)] overflow-hidden border ${className ?? ""}`}
      style={{ height, borderColor: "var(--color-border)" }}
    >
      <iframe
        src={src}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={label ?? "Bản đồ vị trí"}
      />
    </div>
  );
}
