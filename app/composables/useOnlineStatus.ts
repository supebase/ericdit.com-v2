import type { User } from "~/types";

export const useOnlineStatus = () => {
  const { $realtimeClient } = useNuxtApp();
  const onlineStatusStore = useOnlineStatusStore();
  const authStore = useAuthStore();

  // 订阅用户在线状态变化
  const subscribeToUserStatus = async () => {
    try {
      const { subscription } = await $realtimeClient.subscribe("directus_users", {
        query: {
          fields: ["id", "online", "last_active"],
        },
      });

      for await (const item of subscription) {
        if (item.event === "update") {
          const user = item.data[0];
          if (user && user.id) {
            onlineStatusStore.setUserOnlineStatus(user.id, !!user.online);
          }
        }
      }

      onUnmounted(() => $realtimeClient.disconnect());
    } catch (error) {
      console.error("Failed to subscribe to user status:", error);
    }
  };

  // 设置页面可见性变化监听
  const setupVisibilityListener = () => {
    if (!authStore.isLoggedIn || !authStore.user?.id) return;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === "visible") {
        await onlineStatusStore.updateUserStatus(authStore.user!.id, true);
      } else {
        // 当页面隐藏时只更新最后活动时间，不改变在线状态
        const { $authClient, $user } = useNuxtApp();
        await $authClient.request(
          $user.updateUser(authStore.user!.id, {
            last_active: new Date().toISOString(),
          } as User)
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    onUnmounted(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    });
  };

  // 检查用户是否在线
  const isUserOnline = (userId: string) => {
    return !!onlineStatusStore.onlineUsers[userId];
  };

  // 获取用户最后活跃时间
  const getUserLastActive = async (userId: string) => {
    const { $directus, $user } = useNuxtApp();
    try {
      const user = await $directus.request<User>(
        $user.readUser(userId, {
          fields: ["last_active"],
        })
      );
      return user.last_active;
    } catch (error) {
      console.error("Failed to get user last active time:", error);
      return null;
    }
  };

  return {
    subscribeToUserStatus,
    setupVisibilityListener,
    isUserOnline,
    getUserLastActive,
  };
};
