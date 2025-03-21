import type { User } from "~/types";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as User | null,
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
            fields: ["id", "email", "first_name", "avatar", "location", "online", "last_active"],
          })
        )) as User;
        this.setUserData(user);
      } catch (error) {
        this.clearUserData();
      } finally {
        this.isLoading = false;
      }
    },

    async setUserData(user: User) {
      this.user = user;
      this.isLoggedIn = true;

      const onlineStatusStore = useOnlineStatusStore();
      await onlineStatusStore.handleLogin(user.id);
    },

    async clearUserData() {
      if (this.user) {
        const onlineStatusStore = useOnlineStatusStore();
        await onlineStatusStore.handleLogout(this.user.id);
      }
      this.user = null;
      this.isLoggedIn = false;
    },
  },
});
