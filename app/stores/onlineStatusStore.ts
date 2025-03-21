import type { UserUpdateFields } from "~/types";

export const useOnlineStatusStore = defineStore("onlineStatus", {
  state: () => ({
    onlineUsers: {} as Record<string, boolean>,
    isInitialized: false,
  }),

  actions: {
    setUserOnlineStatus(userId: string, isOnline: boolean) {
      this.onlineUsers[userId] = isOnline;
    },

    async updateUserStatus(userId: string, isOnline: boolean) {
      const { $authClient, $user } = useNuxtApp();
      try {
        const updateData: UserUpdateFields = {
          online: isOnline,
          last_active: new Date().toISOString(),
        };

        await $authClient.request($user.updateUser(userId, updateData));
        this.setUserOnlineStatus(userId, isOnline);
      } catch (error) {
        console.error("Failed to update user online status:", error);
      }
    },

    async handleLogin(userId: string) {
      await this.updateUserStatus(userId, true);
    },

    async handleLogout(userId: string) {
      await this.updateUserStatus(userId, false);
    },

    async initializeOnlineStatus() {
      if (this.isInitialized) return;

      const { $directus, $user } = useNuxtApp();
      try {
        const users = await $directus.request(
          $user.readUsers({
            fields: ["id", "online"],
            filter: { online: { _eq: true } },
          })
        );

        users.forEach((user: Record<string, any>) => {
          if (user.id) {
            this.onlineUsers[user.id] = true;
          }
        });

        this.isInitialized = true;
      } catch (error) {
        console.error("Failed to initialize online status:", error);
      }
    },
  },
});
