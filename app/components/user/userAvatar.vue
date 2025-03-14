<template>
  <div class="flex flex-col items-center space-y-5">
    <div class="w-16 h-16 rounded-full">
      <UAvatar
        :src="avatarUrl || ''"
        :alt="authStore.user?.first_name"
        class="ring-2 ring-neutral-700 w-16 h-16" />
    </div>

    <div class="flex items-center space-x-5">
      <input
        type="file"
        ref="fileInput"
        @change="handleFileUpload"
        accept="image/*"
        class="hidden" />
      <div
        v-if="!isLoading"
        class="cursor-pointer"
        @click="openFileInput">
        <UButton
          type="button"
          variant="soft"
          icon="hugeicons:image-upload"
          label="上传头像"
          class="cursor-pointer" />
      </div>

      <div
        v-if="avatarUrl && !isLoading"
        class="cursor-pointer"
        @click="deleteAvatar">
        <UButton
          type="button"
          variant="soft"
          color="error"
          icon="hugeicons:cancel-circle-half-dot"
          label="删除头像"
          class="cursor-pointer" />
      </div>
    </div>
  </div>

  <div
    v-if="isLoading"
    class="flex items-center justify-center bg-black/80 rounded-full absolute w-16 h-16 ring-2 ring-neutral-800">
    <UIcon
      name="svg-spinners:ring-resize"
      class="size-8 text-primary-500" />
  </div>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const { avatarUrl, isLoading, uploadAvatar, deleteAvatar } = useAvatar();
const toast = useToast();

const fileInput = ref<HTMLInputElement | null>(null);

const openFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const uploadedFile = target.files[0];
    if (
      ["image/jpeg", "image/png", "image/gif"].includes(uploadedFile.type) &&
      uploadedFile.size <= 2 * 1024 * 1024
    ) {
      uploadAvatar(target.files[0]);
    } else {
      toast.add({
        title: "上传通知",
        description: "文件格式不支持或文件大小超过 2MB",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }
  }
};
</script>
