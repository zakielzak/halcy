import { fetchAllImages, fetchImagesByFolder, ImageRecord } from "@/lib/db"
import { useQuery } from "@tanstack/react-query"

/**
 * A custom hook to fetch and manage images for a specific library.
 * @param dbPath The file path to the library's database.
 */

export const useImages = (dbPath: string, folderId?: string) => {
  const queryKey = ["images", dbPath, folderId];
  // Define la función de fetching.
  const queryFn = () => {
    if (folderId) {
      return fetchImagesByFolder(dbPath, folderId);
    }
    // Si no hay folderId, se traen todas las imágenes.
    return fetchAllImages(dbPath);
  };

  const {
    data: images,
    isLoading,
    isError,
  } = useQuery<ImageRecord[]>({
    queryKey,
    queryFn,
    enabled: !!dbPath,
  });

  return {
    images,
    isLoading,
    isError,
  };
};