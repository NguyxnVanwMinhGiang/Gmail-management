// hooks/friend/useFriend.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listFriendRequest, acpFriend, rejectFriend, listFriend } from "../../api/friends";

export interface FriendRequest {
    friendship_id: number;
    sender_domain: string;
    status: string;
    created_at: string;
}

interface FriendItem {
    friend_id: number;
    domain: string;
    created_at: string;
}

interface UseFriendRequestsOptions {
    enableRequests?: boolean;
    enableFriends?: boolean;
}

export const useFriendRequests = (options: UseFriendRequestsOptions = {}) => {
    const queryClient = useQueryClient();
    const {
        enableRequests = true,
        enableFriends = true,
    } = options;

    // 1. Query lấy danh sách LỜI MỜI kết bạn (Dùng chung cho các Popup)
    const requestsQuery = useQuery<FriendRequest[]>({
        queryKey: ["list-friend-requests"],
        queryFn: async () => {
            const res = await listFriendRequest();
            return res.data;
        },
        enabled: enableRequests,
        staleTime: 1000 * 60 * 5, // Data mới trong 5 phút, gọi ở nhiều nơi không bị fetch lại
    });

    // 2. Query lấy DANH SÁCH BẠN BÈ (Dùng cho cả Page và Popup cần hiển thị)
    const friendsQuery = useQuery<FriendItem[]>({
        queryKey: ["list"],
        queryFn: async () => {
            const res = await listFriend();
            return Array.isArray(res.data) ? res.data : [];
        },
        enabled: enableFriends,
        staleTime: 1000 * 60 * 5, // Đứng ở trang nào gọi cũng chỉ tốn đúng 1 request ban đầu
    });

    // 3. Mutation Chấp nhận kết bạn
    const acceptMutation = useMutation({
        mutationFn: (friendship_id: number) => acpFriend(friendship_id),
        onSuccess: () => {
            // Sau khi chấp nhận thành công, tự làm mới cả 2 danh sách
            queryClient.invalidateQueries({ queryKey: ["list-friend-requests"] });
            queryClient.invalidateQueries({ queryKey: ["list"] });
        }
    });

    // 4. Mutation Từ chối kết bạn
    const rejectMutation = useMutation({
        mutationFn: (friendship_id: number) => rejectFriend(friendship_id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["list-friend-requests"] });
        }
    });

    return {
        // Dữ liệu lời mời kết bạn
        requests: requestsQuery.data || [],
        loadingFriendRequests: requestsQuery.isLoading,
        errorRequests: requestsQuery.error,
        refreshRequests: requestsQuery.refetch,

        // Dữ liệu danh sách bạn bè
        friends: friendsQuery.data || [],
        loadFriendList: friendsQuery.isLoading,
        errorFriends: friendsQuery.error,
        refreshFriends: friendsQuery.refetch,

        // Các hàm hành động (Chuyển sang dùng mutateAsync để giữ nguyên logic trả về của bạn)
        acceptRequest: async (friendship_id: number) => {
            const res = await acceptMutation.mutateAsync(friendship_id);
            return res.data;
        },
        rejectRequest: async (friendship_id: number) => {
            const res = await rejectMutation.mutateAsync(friendship_id);
            return res.data;
        }
    };
};