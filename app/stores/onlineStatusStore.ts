export const useOnlineStatusStore = defineStore("onlineStatus", {
  state: () => ({
    usersOnlineStatus: {} as Record<string, boolean>,
    activityCleanup: null as (() => void) | null,
  }),

  actions: {
    setUserOnlineStatus(userId: string, status: boolean) {
      this.usersOnlineStatus[userId] = status;
    },

    getUserOnlineStatus(userId: string) {
      return this.usersOnlineStatus[userId] || false;
    },

    startMonitoring(userId: string) {
      if (this.activityCleanup) {
        this.activityCleanup();
      }

      const monitor = new ActivityMonitor((status) => this.setUserOnlineStatus(userId, status), {
        timeout: 180000, // 3 minutes
      });
      this.activityCleanup = monitor.start();
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
  },
});
