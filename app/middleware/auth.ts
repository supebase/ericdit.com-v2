export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore();

  if (!authStore.user) {
    await authStore.fetchUserData();
  }

  if (!authStore.isLoggedIn) {
    return navigateTo("/auth");
  }

  if (authStore.isLoggedIn && to.path === "/auth") {
    return navigateTo("/");
  }
});
