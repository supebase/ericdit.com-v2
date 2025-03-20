import type { User } from "~/types";

export const useOnlineStatusStore = defineStore("onlineStatus", {
  state: () => ({
    usersOnlineStatus: {} as Record<string, boolean>,
    cleanup: null as (() => void) | null,
    lastActiveTime: {} as Record<string, number>,
    subscriptionCleanup: null as (() => void) | null,
  }),

  actions: {
    async setUserOnlineStatus(userId: string, status: boolean) {
      if (!userId) return;

      const { $directus, $user } = useNuxtApp();

      try {
        await $directus.request(
          $user.updateUser(userId, {
            online: status,
            last_active: new Date().toISOString(),
          } as Partial<User>)
        );

        this.usersOnlineStatus[userId] = status;
        if (status) {
          this.lastActiveTime[userId] = Date.now();
        } else {
          delete this.lastActiveTime[userId];
        }
      } catch (error) {
        console.error("Failed to update user online status:", error);
      }
    },

    updateOnlineStatuses(updates: Record<string, boolean>) {
      this.usersOnlineStatus = { ...this.usersOnlineStatus, ...updates };
    },

    startMonitoring(userId: string) {
      if (!userId) return;
      this.stopMonitoring();

      const monitor = new ActivityMonitor(
        async (status) => {
          await this.setUserOnlineStatus(userId, status);
        },
        { timeout: 180000 }
      );

      this.cleanup = monitor.start();

      // 添加浏览器关闭事件处理
      const handleBeforeUnload = async () => {
        await this.setUserOnlineStatus(userId, false);
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      // 更新清理函数，确保同时移除事件监听器
      const originalCleanup = this.cleanup;
      this.cleanup = () => {
        originalCleanup();
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    },

    stopMonitoring() {
      if (this.cleanup) {
        this.cleanup();
        this.cleanup = null;
      }
      if (this.subscriptionCleanup) {
        this.subscriptionCleanup();
        this.subscriptionCleanup = null;
      }
    },

    async initializeOnlineStatuses() {
      const { $directus, $user, $realtimeClient } = useNuxtApp();

      try {
        const users = await $directus.request(
          $user.readUsers({
            fields: ["id", "online", "last_active"],
            filter: {
              status: { _eq: "active" },
            },
          })
        );

        const now = Date.now();
        const statuses = (users as User[]).reduce((acc: Record<string, boolean>, user: User) => {
          const lastActive = user.last_active ? new Date(user.last_active).getTime() : 0;
          acc[user.id] = Boolean(user.online && now - lastActive < 180000);
          return acc;
        }, {});

        this.updateOnlineStatuses(statuses);

        const { subscription } = await $realtimeClient.subscribe("directus_users", {
          query: {
            fields: ["id", "online", "last_active"],
            filter: {
              status: { _eq: "active" },
            },
          },
        });

        let isSubscriptionActive = true;
        this.subscriptionCleanup = () => {
          isSubscriptionActive = false;
          subscription.return?.();
        };

        (async () => {
          try {
            for await (const item of subscription) {
              if (!isSubscriptionActive) break;

              if ("data" in item && item.data) {
                switch (item.event) {
                  case "create":
                  case "update":
                    if (Array.isArray(item.data)) {
                      const updates = item.data.reduce(
                        (acc: Record<string, boolean>, user: Record<string, any>) => {
                          const lastActive = user.last_active
                            ? new Date(user.last_active).getTime()
                            : 0;
                          const now = Date.now();
                          acc[user.id] = Boolean(user.online && now - lastActive < 180000);
                          return acc;
                        },
                        {}
                      );
                      this.updateOnlineStatuses(updates);
                    } else {
                      const userData = item.data as User;
                      const lastActive = userData.last_active
                        ? new Date(userData.last_active).getTime()
                        : 0;
                      const now = Date.now();
                      this.updateOnlineStatuses({
                        [userData.id]: Boolean(userData.online && now - lastActive < 180000),
                      });
                    }
                    break;

                  case "delete":
                    if (Array.isArray(item.data)) {
                      const updates = item.data.reduce(
                        (acc: Record<string, boolean>, user: any) => {
                          acc[user.id] = false;
                          return acc;
                        },
                        {}
                      );
                      this.updateOnlineStatuses(updates);
                    } else {
                      const userId = (item.data as { id: string }).id;
                      this.updateOnlineStatuses({ [userId]: false });
                    }
                    break;
                }
              }
            }
          } catch (error) {
            console.error("Error in subscription stream:", error);
            if (isSubscriptionActive) {
              await this.initializeOnlineStatuses();
            }
          }
        })();
      } catch (error) {
        console.error("Failed to initialize online statuses:", error);
      }
    },

    getUserOnlineStatus(userId: string): boolean {
      return Boolean(userId && this.usersOnlineStatus[userId]);
    },

    async handleLogout(userId: string) {
      if (!userId) return;

      await this.setUserOnlineStatus(userId, false);
      this.stopMonitoring();
      this.usersOnlineStatus = {};
      this.lastActiveTime = {};
    },
  },

  getters: {
    onlineUsersCount: (state) => Object.values(state.usersOnlineStatus).filter(Boolean).length,
  },
});
