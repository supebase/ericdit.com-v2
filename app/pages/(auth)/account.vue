<template>
  <UCard
    variant="soft"
    class="mt-24 sm:mt-11 mb-14 max-w-md mx-auto">
    <div class="space-y-6">
      <div class="flex justify-center">
        <UserAvatar />
      </div>

      <div class="flex justify-center items-center gap-4">
        <div class="grid gap-2">
          <div class="flex flex-col items-center space-y-1 select-none">
            <div class="text-2xl font-bold">{{ user?.first_name }}</div>
            <div class="text-sm text-neutral-500">{{ user?.email }}</div>
            <div class="text-sm text-neutral-500 mt-5 flex items-center space-x-2">
              <UIcon
                name="hugeicons:location-04"
                class="size-5" />
              <div>最近在{{ user?.location }}登录</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-center">
        <UButton
          type="button"
          size="lg"
          color="neutral"
          label="退出登录"
          class="cursor-pointer"
          @click="handleLogout"
          :loading="loading"
          :disabled="loading" />
      </div>
    </template>
  </UCard>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ["auth"] });

const { $authClient } = useNuxtApp();
const authStore = useAuthStore();
const onlineStatusStore = useOnlineStatusStore();

const user = computed(() => authStore.user);
const loading = ref(false);

const handleLogout = async () => {
  loading.value = true;
  try {
    const userId = authStore.user?.id;
    if (userId) {
      await onlineStatusStore.handleLogout(userId);
    }
    await $authClient.logout();
    authStore.clearUserData();
    navigateTo("/");
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    loading.value = false;
  }
};

useSeoMeta({ title: "用户信息" });
</script>
