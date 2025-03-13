import type { User } from "~/types";

export const useAvatar = () => {
  const { $authClient, $file, $user } = useNuxtApp();
  const authStore = useAuthStore();
  const isLoading = ref(false);

  // 头像 URL
  const avatarUrl = computed(() => {
    const avatarId = authStore.user?.avatar;
    return avatarId
      ? `${useAssets(avatarId)}?fit=outside&quality=80&withoutEnlargement&width=64&height=64`
      : null;
  });

  // 获取用户头像
  const fetchAvatar = async () => {
    try {
      const user = await $authClient.request<User>(
        $user.readMe({ fields: ["id", "email", "first_name", "avatar", "location"] })
      );
      authStore.setUserData(user);
    } catch (err) {
      console.error("Failed to fetch avatar:", err);
    }
  };

  // 上传头像
  const uploadAvatar = async (file: File) => {
    if (!file) return;
    isLoading.value = true;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 如果已有头像，先删除旧头像
      if (authStore.user?.avatar) {
        await $authClient.request($file.deleteFile(authStore.user.avatar));
      }

      // 上传新头像
      const uploadResponse = await $authClient.request($file.uploadFiles(formData));
      if (uploadResponse && uploadResponse.id) {
        await $authClient.request(
          $user.updateUser(authStore.user?.id || "", { avatar: uploadResponse.id })
        );
        await fetchAvatar();
      }
    } catch (err) {
      console.error("Failed to upload avatar:", err);
    } finally {
      isLoading.value = false;
    }
  };

  // 删除头像
  const deleteAvatar = async () => {
    if (!authStore.user?.avatar) return;
    isLoading.value = true;

    try {
      await $authClient.request($file.deleteFile(authStore.user.avatar));
      await $authClient.request($user.updateUser(authStore.user.id, { avatar: null }));
      await fetchAvatar();
    } catch (err) {
      console.error("Failed to delete avatar:", err);
    } finally {
      isLoading.value = false;
    }
  };

  return { avatarUrl, isLoading, fetchAvatar, uploadAvatar, deleteAvatar };
};
