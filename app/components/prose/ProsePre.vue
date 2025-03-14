<template>
  <pre
    :class="$props.class"
    class="overflow-x-hidden whitespace-pre-wrap"><div class="flex justify-between items-center mb-2"><div class="text-xs text-neutral-700 uppercase">{{ $props.language }}</div><div @click="copy(source)" class="text-xs text-neutral-500"><span v-if="!copied" class="cursor-pointer">复制</span><span v-else>搞定</span></div></div><slot /></pre>
</template>

<script setup lang="ts">
const props = defineProps({
  code: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array as () => number[],
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
});

const source = ref(props.code);
const { text, copy, copied, isSupported } = useClipboard({ source });
</script>

<style>
pre code .line {
  display: block;
}
</style>
