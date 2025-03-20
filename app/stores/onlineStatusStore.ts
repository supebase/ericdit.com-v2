import type { User } from "~/types";

export const useOnlineStatusStore = defineStore("onlineStatus", {
  state: () => ({
    usersOnlineStatus: {} as Record<string, boolean>,
    activityCleanup: null as (() => void) | null,
    activeUsers: new Set<string>(),
  }),

  actions: {
    async setUserOnlineStatus(userId: string, status: boolean) {
      const { $directus, $user } = useNuxtApp();

      try {
        await $directus.request($user.updateUser(userId, { online: status } as User));
        this.usersOnlineStatus[userId] = status;

        if (status) {
          this.activeUsers.add(userId);
        } else {
          this.activeUsers.delete(userId);
        }
      } catch (error) {
        console.error("Failed to set user online status:", error);
      }
    },

    getUserOnlineStatus(userId: string) {
      return this.usersOnlineStatus[userId] || false;
    },

    startMonitoring(userId: string) {
      if (this.activeUsers.has(userId)) return;

      // 使用 debounce 处理状态更新
      const debouncedSetStatus = useDebounceFn(async (status: boolean) => {
        await this.setUserOnlineStatus(userId, status);
      }, 3000);

      // 活动监控
      const monitor = new ActivityMonitor(
        async (status) => {
          await debouncedSetStatus(status);
        },
        {
          timeout: 180000, // 3分钟无活动则离线
        }
      );

      // 处理页面可见性
      if (useRuntimeConfig().app.client) {
        let visibilityTimeout: NodeJS.Timeout;

        const handleVisibilityChange = () => {
          clearTimeout(visibilityTimeout);

          if (document.visibilityState === "hidden") {
            visibilityTimeout = setTimeout(() => {
              debouncedSetStatus(false);
            }, 30000); // 30秒后标记为离线
          } else {
            debouncedSetStatus(true);
          }
        };

        // 处理页面关闭事件
        const handlePageHide = () => {
          const { $directus } = useNuxtApp();
          const endpoint = $directus.url + "/users/" + userId;

          navigator.sendBeacon(endpoint, JSON.stringify({ online: false }));
          this.usersOnlineStatus[userId] = false;
          this.activeUsers.delete(userId);
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", () => {
          this.setUserOnlineStatus(userId, false);
        });
        window.addEventListener("pagehide", handlePageHide);

        // 清理函数
        const cleanup = () => {
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          window.removeEventListener("pagehide", handlePageHide);
          window.removeEventListener("beforeunload", () => {
            this.setUserOnlineStatus(userId, false);
          });
          clearTimeout(visibilityTimeout);
        };

        this.activityCleanup = cleanup;
      }

      // 启动活动监控
      monitor.start();
    },

    stopMonitoring() {
      if (this.activityCleanup) {
        this.activityCleanup();
        this.activityCleanup = null;
      }
    },

    updateOnlineStatuses(statuses: Record<string, boolean>) {
      this.usersOnlineStatus = { ...this.usersOnlineStatus, ...statuses };
    },

    async initializeOnlineStatuses() {
      const { $directus, $user, $realtimeClient } = useNuxtApp();

      try {
        // 获取初始状态
        const users = await $directus.request(
          $user.readUsers({
            fields: ["id", "online"],
            filter: {
              status: { _eq: "active" },
            },
          })
        );

        const statuses = (users as User[]).reduce((acc: Record<string, boolean>, user: User) => {
          acc[user.id] = user.online ?? false;
          return acc;
        }, {});

        this.updateOnlineStatuses(statuses);

        // 订阅实时更新
        $realtimeClient
          .subscribe("directus_users", {
            query: {
              fields: ["id", "online"],
              filter: {
                status: { _eq: "active" },
              },
            },
          })
          .then(({ subscription }) => {
            (async () => {
              try {
                for await (const item of subscription) {
                  if ("data" in item && item.data) {
                    switch (item.event) {
                      case "create":
                      case "update":
                        if (!Array.isArray(item.data)) {
                          this.updateOnlineStatuses({
                            [(item.data as { id: string; online?: boolean }).id]:
                              (item.data as { id: string; online?: boolean }).online ?? false,
                          });
                        } else if (item.data.length > 0) {
                          const updates = item.data.reduce(
                            (acc: Record<string, boolean>, user: any) => {
                              acc[user.id] = user.online ?? false;
                              return acc;
                            },
                            {}
                          );
                          this.updateOnlineStatuses(updates);
                        }
                        break;
                      case "delete":
                        if (!Array.isArray(item.data)) {
                          this.updateOnlineStatuses({
                            [(item.data as { id: string }).id]: false,
                          });
                        }
                        break;
                    }
                  }
                }
              } catch (error) {
                console.error("Error in subscription stream:", error);
              }
            })();
          })
          .catch((error) => {
            console.error("Failed to subscribe to online status:", error);
          });
      } catch (error) {
        console.error("Failed to initialize online statuses:", error);
      }
    },

    async handleLogout(userId: string) {
      if (!userId) return;

      await this.setUserOnlineStatus(userId, false);
      this.stopMonitoring();
      this.usersOnlineStatus = {};
      this.activeUsers.clear();
    },
  },

  getters: {
    onlineUsersCount: (state) =>
      Object.values(state.usersOnlineStatus).filter((status) => status).length,
  },
});
