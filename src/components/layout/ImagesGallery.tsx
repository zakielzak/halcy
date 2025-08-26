import { useLibrary } from '@/hooks/useLibrary';
import { cn } from '@/lib/utils';
import { useVirtualizer } from '@tanstack/react-virtual';
import { convertFileSrc, invoke } from '@tauri-apps/api/core';
import { useEffect, useRef, useState } from 'react';

interface ImageProps {
  path: string;
  style: React.CSSProperties;
  /*   height: number; */
}

// Data simulated
// We don't need width for virtualization & masonry layout
const images: ImageData[] = new Array(10000).fill(true).map((_, i) => ({
  id: i,
  height: 200 + Math.round(Math.random() * 200),
}));

const ImageCard = ({
  imagePath,
  index,
  height,
  style,
}: {
  imagePath: string;
  index: number;
  height: number;
  style: React.CSSProperties;
}) => {
  const imageUrl = convertFileSrc(imagePath);
  return (
    <div
      style={{
        ...style,
        height: `${height}px`,
        backgroundColor: "#3498db",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "14px",
        color: "#888",
        border: "1px solid #ccc",
        borderRadius: "5px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <img
        src={imageUrl}
        alt={imagePath.split("/").pop() || ""}
        className={cn(
          "object-cover w-full h-full transition-opacity duration-300"
        )}
        /* onLoad={handleImageLoad} */
      />
    </div>
  );
};

function ImagesGallery() {
  // VIRTUALIZER
  const { rootDir } = useLibrary();
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /*   const { width } = useWindowSize(); */ // TODO: custom hook to Get window width to dynamically calculate columns

  useEffect(() => {
    const scanLibrary = async () => {
      if (!rootDir) {
        setImagePaths([]);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const paths = await invoke<string[]>("scan_library_images", {
          libraryPath: rootDir,
        });
        setImagePaths(paths);
      } catch (e) {
        console.error("Error scanning library:", e);
        setError("Could not load library. Please check permissions or path.");
        setImagePaths([]);
      } finally {
        setIsLoading(false);
      }
    };
    scanLibrary();
  }, [rootDir]);

  const parentRef = useRef<HTMLDivElement>(null);

  const gapY = 15;
  const gapX = 7;
  const numColumns = 4;

  const virtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => images[index].height + gapY,
    overscan: 5,
    lanes: numColumns,
    getItemKey: (index) => imagePaths[index],
  });

  const virtualItems = virtualizer.getVirtualItems();
  return (
    <>
      <div className="">Header</div>

      <div
        ref={parentRef}
        className="List h-full w-full relative overflow-y-auto pr-6 pl-4"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
          className="w-full relative "
        >
          {virtualItems.map((virtualItem) => {
            const item = images[virtualItem.index];
            const imagePath = imagePaths[virtualItem.index] ?? "";

            return (
              <ImageCard
                key={virtualItem.key}
                imagePath={imagePath}
                index={virtualItem.index}
                height={item.height}
                style={{
                  position: "absolute",
                  top: 0,
                  left: `calc(${(100 / numColumns) * virtualItem.lane}% + ${
                    virtualItem.lane * gapX
                  }px)`,
                  width: `calc(${100 / numColumns}% - ${gapX}px)`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              />
            );
          })}
          {/*   {virtualItems.map((virtualItem) => {
              const imagePath = imagePaths[virtualItem.index];
              return (
                <ImageItem
                  key={virtualItem.key}
                  path={imagePath}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: `calc(${(100 / numColumns) * virtualItem.lane}% + ${
                      virtualItem.lane * gapX
                    }px)`,
                    width: `calc(${100 / numColumns}% - ${gapX}px)`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                />
              );
            })} */}
        </div>
      </div>
    </>
  );
}

export default ImagesGallery