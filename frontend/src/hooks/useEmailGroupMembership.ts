import { useMemo } from "react";
import { useQueries } from "@tanstack/react-query";
import { useEmailGroups } from "./useEmailGroups";
import { getGroupEmails } from "../api/emailGroups";

export const useEmailGroupMembership = (emailId?: number) => {
  const groupsQuery = useEmailGroups();
  const groups = groupsQuery.data || [];

  const groupEmailQueries = useQueries({
    queries: groups.map((group) => ({
      queryKey: ["email-group-emails", group.id],
      queryFn: () => getGroupEmails(group.id),
      enabled: groups.length > 0,
      staleTime: 60_000,
      retry: false,
    })),
  });

  const activeGroupIds = useMemo(() => {
    if (!emailId) return [] as number[];

    return groups.flatMap((group, index) => {
      const items = groupEmailQueries[index]?.data?.items || [];
      const hasEmail = items.some((item) => item.email.id === emailId);
      return hasEmail ? [group.id] : [];
    });
  }, [emailId, groups, groupEmailQueries]);

  return {
    groups,
    isLoading: groupsQuery.isLoading,
    error: groupsQuery.error,
    activeGroupIds,
  };
};
