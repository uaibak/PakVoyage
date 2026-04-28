interface GalleryStripProps {
  images: string[];
  title: string;
}

export function GalleryStrip({ images, title }: GalleryStripProps) {
  if (images.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {images.map((image, index) => (
        <div
          key={`${title}-${index}`}
          className="overflow-hidden rounded-[24px] border border-slate-200 bg-[rgba(248,243,235,0.9)]"
        >
          <img
            src={image}
            alt={`${title} view ${index + 1}`}
            className="h-56 w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
