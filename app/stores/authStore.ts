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

      const onlineStatusStore = useOnlineStatusStore();
      onlineStatusStore.setUserOnlineStatus(user.id, true);
      onlineStatusStore.startMonitoring(user.id);
    },

    clearUserData() {
      if (this.user) {
        const onlineStatusStore = useOnlineStatusStore();
        onlineStatusStore.setUserOnlineStatus(this.user.id, false);
        onlineStatusStore.stopMonitoring();
      }
      this.user = null;
      this.isLoggedIn = false;
    },
  },
});
