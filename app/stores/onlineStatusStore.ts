import type { User } from "~/types";

export const useOnlineStatusStore = defineStore("onlineStatus", {
  state: () => ({
    usersOnlineStatus: {} as Record<string, boolean>,
    activityCleanup: null as (() => void) | null,
    statusRefreshInterval: null as ReturnType<typeof setInterval> | null,
    retryCount: 0,
    maxRetries: 3,
    activeUsers: new Set<string>(),
  }),

  actions: {
    async setUserOnlineStatus(userId: string, status: boolean) {
      const { $authClient, $user } = useNuxtApp();

      try {
        const currentUser = (await $authClient.request(
          $user.readMe({
            fields: ["id"],
          })
        )) as User;

        if (!currentUser || currentUser.id !== userId) return;

        if (status) {
          this.activeUsers.add(userId);
        } else {
          this.activeUsers.delete(userId);
        }

        this.usersOnlineStatus[userId] = status;
        await this.syncOnlineStatus(userId);
      } catch (error) {
        console.error("Failed to set user online status:", error);
      }
    },

    getUserOnlineStatus(userId: string) {
      return this.usersOnlineStatus[userId] || false;
    },

    startMonitoring(userId: string) {
      if (this.activeUsers.has(userId)) return;

      if (this.activityCleanup) {
        this.activityCleanup();
      }

      const debouncedSetStatus = useDebounceFn(async (status: boolean) => {
        await this.setUserOnlineStatus(userId, status);
      }, 5000);

      const monitor = new ActivityMonitor(
        async (status) => {
          await debouncedSetStatus(status);
        },
        {
          timeout: 180000,
        }
      );

      this.activityCleanup = monitor.start();

      if (useRuntimeConfig().app.client) {
        let visibilityTimeout: NodeJS.Timeout;

        const handleVisibilityChange = () => {
          clearTimeout(visibilityTimeout);

          if (document.visibilityState === "hidden") {
            visibilityTimeout = setTimeout(() => {
              this.setUserOnlineStatus(userId, false);
            }, 30000);
          } else {
            this.setUserOnlineStatus(userId, true);
          }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        window.addEventListener("beforeunload", () => {
          this.setUserOnlineStatus(userId, false);
        });

        const originalCleanup = this.activityCleanup;
        this.activityCleanup = () => {
          originalCleanup?.();
          document.removeEventListener("visibilitychange", handleVisibilityChange);
          clearTimeout(visibilityTimeout);
        };
      }
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

    startStatusRefresh() {
      if (this.statusRefreshInterval) {
        clearInterval(this.statusRefreshInterval);
      }

      this.statusRefreshInterval = setInterval(() => {
        this.initializeOnlineStatuses();
      }, 30000);
    },

    stopStatusRefresh() {
      if (this.statusRefreshInterval) {
        clearInterval(this.statusRefreshInterval);
        this.statusRefreshInterval = null;
      }
    },

    async initializeOnlineStatuses() {
      try {
        const { $directus, $user } = useNuxtApp();
        const users = await $directus.request(
          $user.readUsers({
            fields: ["id", "online"],
            filter: {
              status: "active",
            },
          })
        );

        const statuses = (users as User[]).reduce((acc: Record<string, boolean>, user: User) => {
          acc[user.id] = user.online ?? false;
          return acc;
        }, {});

        this.updateOnlineStatuses(statuses);
      } catch (error) {
        console.error("Failed to initialize online statuses:", error);
      }
    },

    async syncOnlineStatus(userId: string) {
      if (!userId) return;

      try {
        const { $directus, $user } = useNuxtApp();
        const isOnline = this.usersOnlineStatus[userId] ?? false;

        await $directus.request($user.updateUser(userId, { online: isOnline } as User));

        this.retryCount = 0;
        await this.initializeOnlineStatuses();
      } catch (error) {
        console.error("Failed to sync online status:", error);

        if (this.retryCount < this.maxRetries) {
          this.retryCount++;
          setTimeout(() => {
            this.syncOnlineStatus(userId);
          }, 1000 * this.retryCount);
        }
      }
    },

    async handleLogout(userId: string) {
      if (!userId) return;

      await this.setUserOnlineStatus(userId, false);
      this.stopMonitoring();
      this.stopStatusRefresh();
      this.usersOnlineStatus = {};
      this.activeUsers.clear();
    },
  },

  getters: {
    onlineUsersCount: (state) =>
      Object.values(state.usersOnlineStatus).filter((status) => status).length,
  },
});
