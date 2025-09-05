import { fetchImages, ImageRecord } from "@/lib/db";
import { useQuery } from "@tanstack/react-query";

/**
 * A custom hook to fetch and manage images based on a filter type.
 * @param dbPath The file path to the library's database.
 * @param type The type of image query (e.g., 'all', 'uncategorized', 'trash', 'folder').
 * @param id (Optional) The ID for the query, e.g., folderId.
 */

export const useImages = (
  dbPath: string,
  type: "all" | "uncategorized" | "byFolder" | "byId",
  folderId: string | undefined,
  orderBy?: string,
  isAscending?: boolean
) => {
  const {
    data: images,
    isLoading,
    isError,
  } = useQuery<ImageRecord[]>({
    queryKey: ["images", dbPath, type, folderId, orderBy, isAscending],
    queryFn: () => fetchImages(dbPath, type, folderId, orderBy, isAscending),
    enabled:
      !!dbPath && !!type && ((type !== "byFolder" && type !== "byId") || !!folderId),
  });

  return {
    images,
    isLoading,
    isError,
  };
};
