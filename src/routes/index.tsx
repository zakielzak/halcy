import { GalleryLayout } from '@/components/layout/GalleryLayout';
import ImagesGallery from '@/components/layout/ImagesGallery';
import { useImages } from '@/hooks/useImages';
import { useLibrary } from '@/hooks/useLibrary';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: () => {
      const { rootDir } = useLibrary();
      const { images } = useImages(`${rootDir}/library.db`, "all");
      return (
        <GalleryLayout title="All">
          <ImagesGallery images={images} />
        </GalleryLayout>
      );
  },
})