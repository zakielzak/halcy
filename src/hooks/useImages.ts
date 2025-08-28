import { fetchAllImages, ImageRecord } from "@/lib/db"
import { useQuery } from "@tanstack/react-query"

/**
 * A custom hook to fetch and manage images for a specific library.
 * @param dbPath The file path to the library's database.
 */

export const useImages = (dbPath: string) => {
    const {
        data: images,
        isLoading,
        isError
    } = useQuery<ImageRecord[]>({
        queryKey: ["images", dbPath],
        queryFn: () => fetchAllImages(dbPath),
        enabled: !!dbPath
    })

    return {
        images,
        isLoading,
        isError,
    };
}