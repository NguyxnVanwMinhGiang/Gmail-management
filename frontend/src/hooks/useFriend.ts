import { listFriendRequest, acpFriend, rejectFriend, listFriend } from "../api/friends";
import { useEffect, useState, useCallback } from 'react';

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

export const useFriendRequests = () => {
    const [requests, setRequests] = useState<FriendRequest[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [friends, setFriends] = useState<FriendItem[]>([]);

    // Dùng useCallback để hàm không bị tạo lại sau mỗi lần render
    const loadRequests = useCallback(async () => {
        try {
        setLoading(true);
        setError(null);
        const res = await listFriendRequest();
        
        setRequests(res.data); 
        } catch (err: any) {
        setError(err.message || 'Không thể tải danh sách lời mời kết bạn.');
        } finally {
        setLoading(false);
        }
    }, []);

    // Tự động gọi khi component mount lần đầu
    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const removeRequest = useCallback((friendship_id: number) => {
        setRequests((prev) => prev.filter((item) => item.friendship_id !== friendship_id));
    }, []);

    const acceptRequest = useCallback(async (friendship_id: number) => {
        try {
            setActionLoadingId(friendship_id);
            setError(null);
            const res = await acpFriend(friendship_id);

            if (res.data.success) {
                removeRequest(friendship_id);
            }

            return res.data;
        } catch (err: any) {
            const message = err.response?.data?.detail || err.message || "Không thể chấp nhận lời mời kết bạn.";
            setError(message);
            return { success: false, message };
        } finally {
            setActionLoadingId(null);
        }
    }, [removeRequest]);

    const rejectRequest = useCallback(async (friendship_id: number) => {
        try {
            setActionLoadingId(friendship_id);
            setError(null);
            const res = await rejectFriend(friendship_id);

            if (res.data.success) {
                removeRequest(friendship_id);
            }

            return res.data;
        } catch (err: any) {
            const message = err.response?.data?.detail || err.message || "Không thể từ chối lời mời kết bạn.";
            setError(message);
            return { success: false, message };
        } finally {
            setActionLoadingId(null);
        }
    }, [removeRequest]);

    const loadListFriend = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await listFriend();

            if (res.status === 200 && Array.isArray(res.data)) {
                setFriends(res.data);
            }
        } catch (err: any) {
            console.error(err);
            setError("Không thể tải danh sách bạn bè.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadListFriend();
    }, []);

    return { 
        requests, 
        loading, 
        error, 
        actionLoadingId,
        friends,
        acceptRequest,
        rejectRequest,
        refresh: loadRequests, // Cho phép component chủ động gọi lại để cập nhật data
        loadListFriend
    };
};