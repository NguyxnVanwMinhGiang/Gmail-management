import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createEmailGroup,
  deleteEmailGroup,
  getGroupEmails,
  listEmailGroups,
  removeEmailFromGroup,
  toggleEmailInGroup,
  updateEmailGroup,
  type EmailGroup,
} from "../api/emailGroups";

export const useEmailGroups = () => {
  return useQuery<EmailGroup[]>({
    queryKey: ["email-groups"],
    queryFn: listEmailGroups,
    staleTime: 60_000,
    retry: false,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmailGroup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["email-groups"] });
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: number; payload: { name: string; color: string; description?: string } }) =>
      updateEmailGroup(groupId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["email-groups"] });
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmailGroup,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["email-groups"] });
    },
  });
};

export const useGroupEmails = (groupId: number) => {
  return useQuery({
    queryKey: ["email-group-emails", groupId],
    queryFn: () => getGroupEmails(groupId),
    enabled: !!groupId,
    retry: false,
  });
};

export const useToggleEmailInGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, emailId }: { groupId: number; emailId: number }) => toggleEmailInGroup(groupId, emailId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["email-groups"] });
      await queryClient.invalidateQueries({ queryKey: ["email-group-emails", variables.groupId] });
    },
  });
};

export const useRemoveEmailFromGroup = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, emailId }: { groupId: number; emailId: number }) => removeEmailFromGroup(groupId, emailId),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["email-groups"] });
      await queryClient.invalidateQueries({ queryKey: ["email-group-emails", variables.groupId] });
    },
  });
};
