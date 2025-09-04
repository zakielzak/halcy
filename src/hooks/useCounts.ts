import { useQuery } from "@tanstack/react-query";
import { connect, fetchCounts, Counts } from "@/lib/db";






/**
 * Custom hook que proporciona los conteos de imágenes para la UI.
 * @param dbPath La ruta a la base de datos de la biblioteca.
 */
export const useCounts = (dbPath: string) => {
  const query = useQuery<Counts, Error>({
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