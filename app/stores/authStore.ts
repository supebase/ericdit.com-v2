import type { User } from "~/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    usersOnlineStatus: {} as Record<string, boolean>,
    isLoggedIn: false,
    isLoading: false,
  }),
  actions: {
    async fetchUserData() {
      const { $authClient, $user } = useNuxtApp();

      this.isLoading = true;
      try {
        const user = (await $authClient.request(
          $user.readMe({
            fields: ["id", "email", "first_name", "avatar", "location"],
          })
        )) as User;
        this.setUserData(user);
      } catch (error) {
        this.clearUserData();
      } finally {
        this.isLoading = false;
      }
    },

    setUserData(user: User) {
      this.user = user;
      this.isLoggedIn = true;
      this.setUserOnlineStatus(user.id, true); // 更新当前用户的在线状态
      this.listenToUserActivity(user.id); // 监听当前用户活动
    },

    clearUserData() {
      if (this.user) {
        this.setUserOnlineStatus(this.user.id, false); // 退出时更新在线状态
      }
      this.user = null;
      this.isLoggedIn = false;
    },

    // 设置任何用户的在线状态
    setUserOnlineStatus(userId: string, status: boolean) {
      this.usersOnlineStatus[userId] = status;
    },

    getUserOnlineStatus(userId: string) {
      return this.usersOnlineStatus[userId] || false; // 默认返回 false
    },

    // 监听用户活动
    listenToUserActivity(userId: string) {
      const inactivityTimeout = 5 * 60 * 1000;
      let inactivityTimer: NodeJS.Timeout | null = null;

      const resetInactivityTimer = () => {
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
        inactivityTimer = setTimeout(() => {
          this.setUserOnlineStatus(userId, false);
        }, inactivityTimeout);
      };

      const visibilityChangeHandler = () => {
        if (document.hidden) {
          this.setUserOnlineStatus(userId, false);
        } else {
          this.setUserOnlineStatus(userId, true);
        }
      };

      window.addEventListener("mousemove", resetInactivityTimer);
      window.addEventListener("keydown", resetInactivityTimer);
      window.addEventListener("scroll", resetInactivityTimer);
      document.addEventListener("visibilitychange", visibilityChangeHandler);

      resetInactivityTimer();

      return () => {
        if (inactivityTimer) clearTimeout(inactivityTimer);
        window.removeEventListener("mousemove", resetInactivityTimer);
        window.removeEventListener("keydown", resetInactivityTimer);
        window.removeEventListener("scroll", resetInactivityTimer);
        document.removeEventListener("visibilitychange", visibilityChangeHandler);
      };
    },
  },
});
