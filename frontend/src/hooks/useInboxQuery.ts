// src/hooks/useInbox.ts
import { useInfiniteQuery } from "@tanstack/react-query";
import { getInbox, getStarred, getTrash, getSpams, getSent } from "../api/mail";
import { useMemo } from "react";
import { useLocation } from "@tanstack/react-router";

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
  const location = useLocation();
  const isAtTrash = location.pathname === "/mail/trash";

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
    enabled: isAtTrash,
  });

  // Gộp các page lại thành 1 mảng phẳng luôn cho tiện
  const rawEmails = useMemo(() => {
    return query.data?.pages.flat() || [];
  }, [query.data]);

  return { ...query, rawEmails };
};

export const useStarredQuery = () => {
  const location = useLocation();
  const isAtStarred = location.pathname === "/mail/starred";
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
    enabled: isAtStarred,
  });

  // Gộp các page lại thành 1 mảng phẳng luôn cho tiện
  const rawEmails = useMemo(() => {
    return query.data?.pages.flat() || [];
  }, [query.data]);

  return { ...query, rawEmails };
};

export const useSpamQuery = () => {
  const location = useLocation();
  const isAtSpam = location.pathname === "/mail/spam";
  const query = useInfiniteQuery({
    queryKey: ["spam"],
    queryFn: ({ pageParam = 1 }) => getSpams(pageParam as number, 20),
    initialPageParam: 1,
    refetchInterval: 300000,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 2000 * 60,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isAtSpam,
  });

  // Gộp các page lại thành 1 mảng phẳng luôn cho tiện
  const rawEmails = useMemo(() => {
    return query.data?.pages.flat() || [];
  }, [query.data]);

  return { ...query, rawEmails };
};

export const useSentQuery = () => {
  const location = useLocation();
  const isAtSent = location.pathname === "/mail/sent";
  const query = useInfiniteQuery({
    queryKey: ["sent"],
    queryFn: ({ pageParam = 1 }) => getSent(pageParam as number, 20),
    initialPageParam: 1,
    refetchInterval: 300000,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 20 ? allPages.length + 1 : undefined;
    },
    staleTime: 2000 * 60,
    retry: false,
    refetchOnWindowFocus: false,
    enabled: isAtSent,
  });

  // Gộp các page lại thành 1 mảng phẳng luôn cho tiện
  const rawEmails = useMemo(() => {
    return query.data?.pages.flat() || [];
  }, [query.data]);

  return { ...query, rawEmails };
};