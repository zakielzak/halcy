import { GalleryLayout } from '@/components/layout/GalleryLayout';
import ImagesGallery from '@/components/layout/ImagesGallery';
import { useFolders } from '@/hooks/useFolders';
import { useImages } from '@/hooks/useImages';
import { useLibrary } from '@/hooks/useLibrary';
import { createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/route/$filterId')({
  component: () => {
    const { filterId } = Route.useParams();
    const { rootDir } = useLibrary();
    const dbPath = `${rootDir}/library.db`;
    const { data: folderTree } = useFolders(dbPath);

    // decide query type & id
    const isSystemFilter =
      filterId === "all" ||
      filterId === "uncategorized" ||
      filterId === "trash" || 
      filterId === "untagged" ||
      filterId === "recently-used" ||
      filterId === "random" ||
      filterId === "all-tags";
    const type = isSystemFilter ? filterId : "byFolder";
    const id = isSystemFilter ? undefined : filterId;

    const { images } = useImages(dbPath, type, id);

    // Determine title
    const title = isSystemFilter
      ? filterId.charAt(0).toUpperCase() + filterId.slice(1)
      : (id !== undefined && folderTree?.[id]?.name) || "Folder";

    return (
      <GalleryLayout title={title}>
        <ImagesGallery images={images} />
      </GalleryLayout>
    );
  },
})

