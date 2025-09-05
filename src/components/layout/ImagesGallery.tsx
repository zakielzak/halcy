import { useImages } from "@/hooks/useImages";
import { useLibrary } from "@/hooks/useLibrary";
import { useSetting } from "@/hooks/useSettings";
import { ImageRecord } from "@/lib/db";
import { useInspectorStore } from "@/store/inspectorStore";
import { useVirtualizer } from "@tanstack/react-virtual";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useEffect, useMemo, useRef, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";

// The ImageCard component doesn't need to change much, but we'll simplify it slightly.
const ImageCard = ({
  image,
  style,
  onClick,
}: {
  image: {
    path: string;
    width: number;
    height: number;
  };
  style: React.CSSProperties;
  onClick: () => void;
}) => {
  const imageUrl = convertFileSrc(image.path);
  return (
    <div
      style={style}
      className=" rounded-md shadow-lg overflow-hidden flex items-center justify-center"
      onClick={onClick}
    >
      <LazyLoadImage
        src={imageUrl}
        alt={image.path.split("/").pop() || ""}
        className="w-full h-full object-fill transition-opacity duration-300"
        width={image.width}
        height={image.height}
      />
    </div>
  );
};

function ImagesGallery({ images }: { images?: ImageRecord[] }) {
 /*  const { rootDir } = useLibrary(); */
 const { setSelectedItem } = useInspectorStore();

   const [rootDir, setRootDir] = useSetting("rootDir", "");

 /*  const { images } = useImages(`${rootDir}/library.db`); */

  const parentRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numColumns, setNumColumns] = useState(3); // User can change this with a UI control

  const gap = 13;
  const gapX = 0;
  const listImages = useMemo(() => images ?? [], [images]);

    useEffect(() => {
      console.log("En Images Gallery:", listImages);
    }, []);
  // Observer para obtener el ancho del contenedor de forma reactiva
  useEffect(() => {
    let observer: ResizeObserver;
    if (parentRef.current) {
      observer = new ResizeObserver((entries) => {
        if (entries[0]) {
          const width = entries[0].contentRect.width;
          setContainerWidth(width);
        }
      });
      observer.observe(parentRef.current);
    }
    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, []);

  // The virtualizer's estimateSize function must use the containerWidth
  const virtualizer = useVirtualizer({
    count: listImages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      if (containerWidth === 0) return 300; // Return a placeholder until width is known
      const image = listImages[index];
      const aspectRatio = image.width / image.height;
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
      className="h-full w-full relative overflow-y-auto pr-9 pl-4 scrollbar scroll-smooth"
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

          const aspectRatio = item.width / item.height;
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
              onClick={() =>
                setSelectedItem({ id: item.id, type: "image", data: item })
              }
            />
          );
        })}
      </div>
    </div>
  );
}

export default ImagesGallery;
