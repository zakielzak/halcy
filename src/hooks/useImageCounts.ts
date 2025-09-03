import { useQuery } from "@tanstack/react-query";
import { connect, ImageRecord } from "@/lib/db";
import { FolderRecord } from "@/lib/db";

/**
 * Interface para el objeto de conteos devuelto por el hook.
 */
interface ImageCounts {
  allImages: number;
  uncategorized: number;
  /* trash: number; */
  folders: Record<string, number>; // Un objeto mapeado por folderId a su conteo
}

// Función que realiza la consulta a la base de datos para los conteos
const fetchCounts = async (dbPath: string): Promise<ImageCounts> => {
  try {
    const db = await connect(dbPath);
    console.log("Database connected at:", dbPath);

    const allImagesQuery: { count: number }[] = await db.select(
      "SELECT COUNT(*) as count FROM images;"
    );
    const uncategorizedQuery: { count: number }[] = await db.select(
      "SELECT COUNT(*) as count FROM images WHERE id NOT IN (SELECT image_id FROM folder_images);"
    );
   /*  const trashQuery: { count: number }[] = await db.select(
      "SELECT COUNT(*) as count FROM images WHERE is_deleted = 1;"
    ); */
    const foldersQuery: { folder_id: string; count: number }[] =
      await db.select(
        "SELECT folder_id, COUNT(*) as count FROM folder_images GROUP BY folder_id;"
      );

    const allImagesCount = allImagesQuery[0]?.count ?? 0;
    const uncategorizedCount = uncategorizedQuery[0]?.count ?? 0;
   /*  const trashCount = trashQuery[0]?.count ?? 0; */
    const foldersCount = foldersQuery.reduce(
      (acc, folder) => {
        acc[folder.folder_id] = folder.count;
        return acc;
      },
      {} as Record<string, number>
    );

    const result = {
      allImages: allImagesCount,
      uncategorized: uncategorizedCount,
     /*  trash: trashCount, */
      folders: foldersCount,
    };

    console.log("Fetched counts:", result);
    return result;
  } catch (error) {
    console.error("Error in fetchCounts:", error);
    throw new Error("Failed to fetch image counts."); // Lanza un error para que TanStack Query lo capture
  }
};

/**
 * Custom hook que proporciona los conteos de imágenes para la UI.
 * @param dbPath La ruta a la base de datos de la biblioteca.
 */
export const useImageCounts = (dbPath: string) => {
  const query = useQuery<ImageCounts, Error>({
    queryKey: ["image-counts", dbPath],
    queryFn: () => fetchCounts(dbPath),
    enabled: !!dbPath,
    staleTime: 5 * 60 * 1000,
  });

  return {
    counts: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};