import { fetchAllImages, fetchImages, fetchImagesByFolder, ImageRecord } from "@/lib/db"
import { useQuery } from "@tanstack/react-query"

/**
 * A custom hook to fetch and manage images based on a filter type.
 * @param dbPath The file path to the library's database.
 * @param type The type of image query (e.g., 'all', 'uncategorized', 'trash', 'folder').
 * @param id (Optional) The ID for the query, e.g., folderId.
 */

export const useImages = (dbPath: string, type: string, folderId?: string) => {
  const queryKey = ["images", dbPath, type, folderId];
  // Define la función de fetching.
  const queryFn = () => {

      return fetchImages(dbPath, type, folderId);
    
  };

  const {
    data: images,
    isLoading,
    isError,
  } = useQuery<ImageRecord[]>({
    queryKey,
    queryFn,
    enabled: !!dbPath && !!type,
  });

  return {
    images,
    isLoading,
    isError,
  };
};