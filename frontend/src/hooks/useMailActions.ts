// src/hooks/useMailActions.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteEamil, starredEmail } from "../api/mail";

export const useMailActions = () => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: ({ id, is_deleted }: { id: string; is_deleted: boolean }) => deleteEamil(id, is_deleted),
    onSuccess: () => {
      // Báo cho React Query tải lại danh sách thư sau khi xóa
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["starred"] });
    },

  });

  const starMutation = useMutation({
    mutationFn: ({ id, is_starred }: { id: string; is_starred: boolean }) => starredEmail(id, is_starred),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
      queryClient.invalidateQueries({ queryKey: ["trash"] });
      queryClient.invalidateQueries({ queryKey: ["starred"] });
    }
  });

  return {
    deleteMail: deleteMutation.mutateAsync,
    starMail: starMutation.mutateAsync,
  };
};