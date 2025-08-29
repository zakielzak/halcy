import { useImages } from "@/hooks/useImages";
import { useLibrary } from "@/hooks/useLibrary";
import { useVirtualizer } from "@tanstack/react-virtual";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useRef, useState } from "react";

// The ImageCard component doesn't need to change much, but we'll simplify it slightly.
const ImageCard = ({
  image,
  style,
}: {
  image: {
    path: string;
    width: number;
    heigth: number;
  };
  style: React.CSSProperties;
}) => {
  const imageUrl = convertFileSrc(image.path);
  return (
    <div
      style={style}
      className=" rounded-md shadow-lg overflow-hidden flex items-center justify-center"
    >
      <img
        src={imageUrl}
        alt={image.path.split("/").pop() || ""}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
    </div>
  );
};

function ImagesGallery() {
  const { rootDir } = useLibrary();
  const { images } = useImages(`${rootDir}/library.db`);

  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numColumns, setNumColumns] = useState(3); // User can change this with a UI control

  const gap = 13;
  const gapX = 0;
  const listImages = images ?? [];

  // Use a ResizeObserver to get the container's width dynamically
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });

    if (parentRef.current) {
      observer.observe(parentRef.current);
    }

    return () => {
      if (parentRef.current) {
        observer.unobserve(parentRef.current);
      }
    };
  }, [parentRef]);

  // The virtualizer's estimateSize function must use the containerWidth
  const virtualizer = useVirtualizer({
    count: listImages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      if (containerWidth === 0) return 300; // Return a placeholder until width is known
      const image = listImages[index];
      const aspectRatio = image.width / image.heigth;
      const columnWidth =
        (containerWidth - (numColumns - 1) * gap) / numColumns;
      const estimatedHeight = columnWidth / aspectRatio;
      return estimatedHeight + gap;
    },
    overscan: 4,
    lanes: numColumns,
    getItemKey: (index) => listImages[index].path,
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="h-full w-full relative overflow-y-auto pr-9 pl-4 scrollbar"
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
        className="w-full"
      >
        {virtualItems.map((virtualItem) => {
          const item = listImages[virtualItem.index];

          const aspectRatio = item.width / item.heigth;
          const calculatedHeight = virtualItem.size - gap; // Height calculated by the virtualizer

          return (
            <ImageCard
              key={virtualItem.key}
              image={item}
              style={{
                position: "absolute",
                top: 0,
                left: `calc(${(100 / numColumns) * virtualItem.lane}% + ${virtualItem.lane * gap}px)`,
                width: `calc(${100 / numColumns}% - ${gapX}px)`,
                transform: `translateY(${virtualItem.start}px)`,
                height: `${calculatedHeight}px`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

export default ImagesGallery;
