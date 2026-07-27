import { useQuery } from "@tanstack/react-query";
import { useEmailGroups } from "./useEmailGroups";
import { getGroupMemberships } from "../api/emailGroups";

export const useEmailGroupMembership = (emailId?: number) => {
  const groupsQuery = useEmailGroups();
  const groups = groupsQuery.data || [];

  const membershipQuery = useQuery({
    queryKey: ["email-memberships", emailId],

    queryFn: async () => {
      if (!emailId) return [];
      const res = await getGroupMemberships(emailId);
      return Array.isArray(res) ? res : (res as { group_ids?: number[] }).group_ids || [];
    },
    enabled: !!emailId,

    staleTime: 1000 * 60 * 2,
    retry: false,
  });

  const activeGroupIds = membershipQuery.data || [];

  return {
    groups,
    isLoading: groupsQuery.isLoading || membershipQuery.isLoading,
    error: groupsQuery.error || membershipQuery.error,
    activeGroupIds,

    refetchMembership: membershipQuery.refetch,
  };
};