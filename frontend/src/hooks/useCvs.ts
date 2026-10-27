import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { cvApi, PaginationOptions } from "@/lib/cv";

export const useCvs = () => {
  return useQuery({
    queryKey: ["cvs"],
    queryFn: cvApi.getUserCvs,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
};

export const useCvsPaginated = (options: PaginationOptions = {}) => {
  return useQuery({
    queryKey: ["cvs", "paginated", options],
    queryFn: () => cvApi.getUserCvsPaginated(options),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
};

export const useCvById = (id: string | undefined) => {
  return useQuery({
    queryKey: ["cv", id],
    queryFn: () => cvApi.getCvById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
  });
};

// Infinite scroll hook for lazy loading CVs
export const useCvsInfinite = (options: Omit<PaginationOptions, 'page'> = {}) => {
  return useInfiniteQuery({
    queryKey: ["cvs", "infinite", options],
    queryFn: ({ pageParam = 1 }) => 
      cvApi.getUserCvsPaginated({ ...options, page: pageParam }),
    getNextPageParam: (lastPage) => {
      // Debug logging
      console.log("getNextPageParam Debug:", {
        lastPage,
        page: lastPage?.page,
        totalPages: lastPage?.totalPages,
        hasNext: lastPage?.hasNext,
        hasPrev: lastPage?.hasPrev,
      });
      
      // Use hasNext from API response
      if (lastPage?.hasNext) {
        return (lastPage.page || 1) + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    refetchOnMount: false, // Prevent refetch on mount
    refetchOnReconnect: false, // Prevent refetch on reconnect
    retry: 1, // Only retry once on failure
  });
};
