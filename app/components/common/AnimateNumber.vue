<template>
  <div
    ref="counter"
    class="counter select-none"
    :class="type === 'post' ? 'text-center !text-xl' : ''">
    <div class="number">
      {{ props.count }}
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  count: number;
  type: string;
}>();

const emit = defineEmits(["update:count"]);

const counter = ref<HTMLElement | null>(null);
const isDisabled = ref(false);

const increment = async () => {
  if (!counter.value || isDisabled.value) return;

  isDisabled.value = true; // 启用防抖
  setTimeout(() => {
    isDisabled.value = false;
  }, 5000);

  const oldNumber = counter.value.querySelector(".number");
  const newNumber = document.createElement("div");
  newNumber.className = "number";
  newNumber.textContent = String(props.count + 1); // 先显示新数字
  newNumber.style.transform = "translateY(100%)";
  counter.value.appendChild(newNumber);

  await nextTick(); // 确保 DOM 更新

  setTimeout(() => {
    if (oldNumber) (oldNumber as HTMLElement).style.transform = "translateY(-100%)"; // 旧数字上移
    newNumber.style.transform = "translateY(0%)"; // 新数字滑入
  }, 10);

  setTimeout(() => {
    if (oldNumber) counter.value?.removeChild(oldNumber);
    emit("update:count", props.count + 1); // 动画结束后才更新 count
  }, 500);
};
defineExpose({
  increment,
});
</script>

<style>
.counter {
  position: relative;
  display: inline-block;
  overflow: hidden;
  height: 32px;
  font-size: 16px;
  line-height: 32px;
  width: 100%;
}
.number {
  font-family: "Inter";
  display: block;
  position: absolute;
  width: 100%;
  transition: transform 0.4s ease-in-out;
}
</style>
