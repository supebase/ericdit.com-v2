<template>
  <div
    class="max-w-xl mx-auto"
    v-if="width > 1080">
    <CommonHeader />
    <slot />
    <CommonFooter />
  </div>

  <div
    class="flex justify-center items-center max-w-xl mx-auto px-6 h-screen"
    v-else>
    <UAlert
      title="提示信息"
      description="本网站暂不支持移动设备，建议您使用桌面端浏览器进行访问。"
      icon="hugeicons:alert-02"
      color="error" />
  </div>
</template>

<script setup lang="ts">
const { width } = useWindowSize();
</script>
