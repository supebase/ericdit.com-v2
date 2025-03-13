<template>
  <div class="flex justify-center items-center max-w-xl mx-auto px-6 h-screen">
    <UAlert
      color="error"
      :title="error.statusCode ? `${error.statusCode}` : 'Error'"
      :description="error.message || '发生错误'"
      icon="hugeicons:alert-02"
      :actions="[
        {
          label: '返回首页',
          color: 'neutral',
          variant: 'soft',
          to: '/',
        },
      ]" />
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from "#app";

defineProps<{ error: NuxtError }>();
</script>
