import { useImages } from '@/hooks/useImages';
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
/* const images: ImageData[] = new Array(10000).fill(true).map((_, i) => ({
  id: i,
  height: 200 + Math.round(Math.random() * 200),
})); */

const ImageCard = ({
  image,
  style,
}: {
  image: {
    path: string;
    width: number;
    heigth: number;
  }
  style: React.CSSProperties;
}) => {
  const imageUrl = convertFileSrc(image.path);
  return (
    <div
      style={{
        ...style,
      
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
        alt={image.path.split("/").pop() || ""}
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
  const { rootDir, handleLibrarySelect } = useLibrary();
  const { images, isLoading, isError } = useImages(`${rootDir}/library.db`)
  const [imagePaths, setImagePaths] = useState<string[]>([]);

  useEffect(() => {
    console.log(rootDir)
    console.log(images)
  }, [handleLibrarySelect]);


  /*   const { width } = useWindowSize(); */ // TODO: custom hook to Get window width to dynamically calculate columns

  useEffect(() => {
    const scanLibrary = async () => {
      if (!rootDir) {
        setImagePaths([]);
        return;
      }
    
      try {
        const paths = await invoke<string[]>("scan_library_images", {
          libraryPath: rootDir,
        });
        setImagePaths(paths);
      } catch (e) {
        console.error("Error scanning library:", e);
     
        setImagePaths([]);
      } 
    };
    scanLibrary();
  }, [rootDir]);

  const parentRef = useRef<HTMLDivElement>(null);

  const gapY = 15;
  const gapX = 7;
  const numColumns = 4;


    const listImages = images ?? [];
      const columnWidth = 400;

  const virtualizer = useVirtualizer({
    count: listImages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const aspectRatio = listImages[index].width / listImages[index].heigth;
      const estimatedHeight = columnWidth / aspectRatio;
      return estimatedHeight + gapY;
    },
    overscan: 5,
    lanes: numColumns,
    getItemKey: (index) => listImages[index].path,
  });

  const virtualItems = virtualizer.getVirtualItems();
  return (
    <>
     

      <div
        ref={parentRef}
        className="List h-full w-full relative overflow-y-auto pr-6 pl-4 scrollbar"
      >
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
          }}
          className="w-full relative "
        >
          {virtualItems.map((virtualItem) => {
            const item = listImages[virtualItem.index];
            
              const aspectRatio = item.width / item.heigth;
              const calculatedHeight = `calc(${100 / numColumns}vw / ${aspectRatio} - ${gapX}px)`;

            
          return (
            <ImageCard
              key={virtualItem.key}
              image={item}
              style={{
                position: "absolute",
                top: 0,
                left: `calc(${(100 / numColumns) * virtualItem.lane}% + ${
                  virtualItem.lane * gapX
                }px)`,
                width: `calc(${100 / numColumns}% - ${gapX}px)`,
                transform: `translateY(${virtualItem.start}px)`,
                height: calculatedHeight, // Pass the calculated height to the component
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