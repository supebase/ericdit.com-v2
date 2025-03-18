<template>
  <div class="flex flex-col items-center space-y-5">
    <div class="w-16 h-16 rounded-full">
      <UAvatar
        :src="avatarUrl || ''"
        :alt="authStore.user?.first_name"
        class="ring-2 ring-neutral-300 dark:ring-neutral-700 w-16 h-16" />
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

// 定义上传配置
const UPLOAD_CONFIG = {
  maxSize: 1024 * 1024, // 1MB
  allowedTypes: ["image/jpeg", "image/png", "image/gif"] as const,
} as const;

// 验证文件
const validateFile = (file: File): boolean => {
  if (
    !UPLOAD_CONFIG.allowedTypes.includes(file.type as (typeof UPLOAD_CONFIG.allowedTypes)[number])
  ) {
    toast.add({
      title: "上传通知",
      description: "只支持 JPG、PNG 和 GIF 格式的图片",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return false;
  }

  if (file.size > UPLOAD_CONFIG.maxSize) {
    toast.add({
      title: "上传通知",
      description: "文件大小不能超过 1MB",
      icon: "hugeicons:alert-02",
      color: "warning",
    });
    return false;
  }

  return true;
};

const openFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (!file) return;

  if (validateFile(file)) {
    uploadAvatar(file);
  }

  // 清理 input 值，允许上传相同文件
  target.value = "";
};
</script>
