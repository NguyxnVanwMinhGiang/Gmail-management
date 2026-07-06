// src/hooks/useInbox.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { getInbox } from "../../api/friends";
import { useMemo } from "react";

export const useInboxQuery = (friendId: number | null) => {
  const query = useInfiniteQuery({
    queryKey: ["friend-inbox", friendId],
    queryFn: ({ pageParam = 1 }) => getInbox(friendId as number, pageParam as number, 20),
    initialPageParam: 1,
    refetchInterval: 300000,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 2000 * 60,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: friendId !== null,
  });

  // Gộp các page lại thành 1 mảng phẳng luôn cho tiện
  const rawEmails = useMemo(() => {
    return query.data?.pages.flat() || [];
  }, [query.data]);

  return { ...query, rawEmails };
};