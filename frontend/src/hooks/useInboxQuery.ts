// src/hooks/useInbox.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { getInbox, getStarred, getTrash } from "../api/mail";
import { useMemo } from "react";

export const useInboxQuery = () => {
  const query = useInfiniteQuery({
    queryKey: ["inbox"],
    queryFn: ({ pageParam = 1 }) => getInbox(pageParam as number, 20),
    initialPageParam: 1,
    refetchInterval: 300000,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 2000 * 60,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Gộp các page lại thành 1 mảng phẳng luôn cho tiện
  const rawEmails = useMemo(() => {
    return query.data?.pages.flat() || [];
  }, [query.data]);

  return { ...query, rawEmails };
};

export const useTrashQuery = () => {
  const query = useInfiniteQuery({
    queryKey: ["trash"],
    queryFn: ({ pageParam = 1 }) => getTrash(pageParam as number, 20),
    initialPageParam: 1,
    refetchInterval: 300000,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 2000 * 60,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Gộp các page lại thành 1 mảng phẳng luôn cho tiện
  const rawEmails = useMemo(() => {
    return query.data?.pages.flat() || [];
  }, [query.data]);

  return { ...query, rawEmails };
};

export const useStarredQuery = () => {
  const query = useInfiniteQuery({
    queryKey: ["starred"],
    queryFn: ({ pageParam = 1 }) => getStarred(pageParam as number, 20),
    initialPageParam: 1,
    refetchInterval: 300000,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 2000 * 60,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Gộp các page lại thành 1 mảng phẳng luôn cho tiện
  const rawEmails = useMemo(() => {
    return query.data?.pages.flat() || [];
  }, [query.data]);

  return { ...query, rawEmails };
};