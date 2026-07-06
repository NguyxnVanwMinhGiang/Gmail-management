// src/hooks/useMailActions.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEamil, starredEmail, spamEmail } from "../api/mail";

export const useMailActions = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: ({ id, is_deleted }: { id: string; is_deleted: boolean }) => deleteEamil(id, is_deleted),
    onSuccess: () => {
      // Báo cho React Query tải lại danh sách thư sau khi xóa
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["starred"] });
      queryClient.invalidateQueries({ queryKey: ["spam"] });
    },

  });

  const starMutation = useMutation({
    mutationFn: ({ id, is_starred }: { id: string; is_starred: boolean }) => starredEmail(id, is_starred),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["starred"] });
      queryClient.invalidateQueries({ queryKey: ["spam"] });
    }
  })

  const spamMutation = useMutation({
    mutationFn: ({ id, is_spam }: { id: string; is_spam: boolean }) => spamEmail(id, is_spam),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["starred"] });
      queryClient.invalidateQueries({ queryKey: ["spam"] });
    }
  });

  return {
    deleteMail: deleteMutation.mutateAsync,
    starMail: starMutation.mutateAsync,
    spamMail : spamMutation.mutateAsync,
  };
};