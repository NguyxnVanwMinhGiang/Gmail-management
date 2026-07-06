import { useInfiniteQuery } from "@tanstack/react-query";
import { getSentMails } from "../../api/friends";
import { useMemo } from "react";

export const useSentQuery = (friendId: number | null) => {
    const query = useInfiniteQuery({
        queryKey: ["friend-sent", friendId],
        queryFn: ({ pageParam = 1 }) => getSentMails(friendId as number, pageParam as number, 20),
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

    const rawSentEmails = useMemo(() => {
        return query.data?.pages.flat() || [];
    }, [query.data]);

    return { ...query, rawSentEmails };
};