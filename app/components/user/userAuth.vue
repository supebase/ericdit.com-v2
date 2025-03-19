<template>
  <ULink
    to="/account"
    v-if="authStore.isLoggedIn">
    <UAvatar
      :src="avatarLoaded ? userAvatar : undefined"
      :alt="authStore.user?.first_name"
      class="relative ring-2 ring-neutral-200 dark:ring-neutral-800"
      size="lg">
      <template #default>
        <div
          v-if="!avatarLoaded"
          class="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-800 rounded-full">
          <UIcon
            name="svg-spinners:90-ring-with-bg"
            class="size-6 text-neutral-500" />
        </div>
      </template>
    </UAvatar>
  </ULink>

  <UTooltip
    arrow
    text="登录或注册"
    v-else>
    <ULink to="/auth">
      <UAvatar
        icon="hugeicons:lock-key"
        size="lg" />
    </ULink>
  </UTooltip>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const avatarLoaded = ref(false);
const userAvatar = ref("");

watchEffect(() => {
  if (authStore.isLoggedIn && authStore.user?.avatar) {
    avatarLoaded.value = false;
    const img = new Image();
    img.src = useAssets(authStore.user.avatar) || "";
    img.onload = () => {
      userAvatar.value = img.src;
      avatarLoaded.value = true;
    };
  }
});
</script>
