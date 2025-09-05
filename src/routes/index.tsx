import { GalleryLayout } from '@/components/layout/GalleryLayout';
import ImagesGallery from '@/components/layout/ImagesGallery';
import { useImages } from '@/hooks/useImages';
import { useLibrary } from '@/hooks/useLibrary';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react';

export const Route = createFileRoute('/')({
  component: () => {
    const { rootDir } = useLibrary();
     const dbPath = `${rootDir}/library.db`;
   
    const [orderBy, setOrderBy] = useState<string>("imported_date");
    const [isAscending, setIsAscending] = useState<boolean>(false);

    // Pass the local state to the useImages hook
    const { images } = useImages(
      dbPath,
      "all",
      undefined,
      orderBy,
      isAscending
    );
    return (
      <GalleryLayout title="All" folderId={undefined}>
        <ImagesGallery images={images} />
      </GalleryLayout>
    );
  },
})