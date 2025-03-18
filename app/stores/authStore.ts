import type { User } from "~/types";

// 常量配置
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5分钟不活动超时
const ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll"] as const;

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
    usersOnlineStatus: {} as Record<string, boolean>,
    isLoggedIn: false,
    isLoading: false,
    activityCleanup: null as (() => void) | null,
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
      this.setUserOnlineStatus(user.id, true);

      // 清理之前的监听器
      if (this.activityCleanup) {
        this.activityCleanup();
      }
      this.activityCleanup = this.listenToUserActivity(user.id);
    },

    clearUserData() {
      if (this.user) {
        this.setUserOnlineStatus(this.user.id, false);
      }
      if (this.activityCleanup) {
        this.activityCleanup();
        this.activityCleanup = null;
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
      let inactivityTimer: ReturnType<typeof setTimeout> | null = null;

      const resetInactivityTimer = () => {
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
        this.setUserOnlineStatus(userId, true);
        inactivityTimer = setTimeout(() => {
          this.setUserOnlineStatus(userId, false);
        }, INACTIVITY_TIMEOUT);
      };

      const visibilityChangeHandler = () => {
        this.setUserOnlineStatus(userId, !document.hidden);
        if (!document.hidden) {
          resetInactivityTimer();
        }
      };

      // 直接绑定事件
      ACTIVITY_EVENTS.forEach((event) => {
        window.addEventListener(event, resetInactivityTimer);
      });
      document.addEventListener("visibilitychange", visibilityChangeHandler);

      resetInactivityTimer();

      return () => {
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
        }
        ACTIVITY_EVENTS.forEach((event) => {
          window.removeEventListener(event, resetInactivityTimer);
        });
        document.removeEventListener("visibilitychange", visibilityChangeHandler);
      };
    },
  },
});
