<template>
  <div v-if="userId">
    <form @submit.prevent="postComment">
      <div class="ring-2 ring-neutral-200 dark:ring-neutral-800 bg-neutral-50/60 dark:bg-neutral-950/60 rounded-lg p-3">
        <UTextarea
          ref="commentInput"
          color="neutral"
          variant="none"
          :placeholder="userId ? randomPlaceholder : '请先登录后再发表评论'"
          autoresize
          :rows="2"
          :padded="false"
          size="lg"
          v-model="comment"
          class="text-neutral-700 dark:text-neutral-300 w-full"
          :maxlength="500"
          :disabled="!userId"
          @input="validateInput" />
        <div class="flex justify-between items-center px-3">
          <div class="flex items-center space-x-4">
            <EmojiPicker
              @emoji="insertEmoji"
              :user="userId" />
            <UBadge
              label="禁止输入特殊字符"
              color="error"
              variant="soft"
              size="lg"
              class="transform duration-500 ease-in-out"
              :class="!isValid ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'" />
          </div>
          <div class="flex items-center space-x-4">
            <span
              class="text-sm select-none"
              :class="isExceedLimit ? 'text-red-600' : 'text-neutral-400 dark:text-neutral-600'">
              {{ comment.length }} / 500
            </span>
            <UButton
              type="submit"
              :color="canSubmit ? 'primary' : 'neutral'"
              size="lg"
              variant="ghost"
              class="hover:!bg-transparent cursor-pointer"
              :loading="loading"
              :icon="submitIcon"
              :disabled="!canSubmit" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const { $directus, $content } = useNuxtApp();
const toast = useToast();

const props = defineProps<{ postId: string; userId: string | null }>();
const comment = ref("");
const loading = ref(false);
const commentInput = ref<any>(null);

const isEmpty = computed(() => !comment.value.trim());
const isExceedLimit = computed(() => comment.value.length >= 500);
const isValid = computed(() => !/[<>\/]/.test(comment.value));
const canSubmit = computed(
  () => !isEmpty.value && !isExceedLimit.value && isValid.value && !loading.value
);
const submitIcon = computed(() =>
  canSubmit.value ? "hugeicons:comment-add-02" : "hugeicons:comment-block-02"
);

const validateInput = () => isValid.value;

const postComment = async () => {
  if (!canSubmit.value) return;
  try {
    loading.value = true;
    await $directus.request(
      $content.createItem("comments", {
        comment: comment.value,
        post_id: props.postId,
        user_created: props.userId,
      })
    );
    comment.value = "";
    toast.add({
      title: "评论成功",
      description: "您的评论已发表成功，非常感谢。",
      icon: "hugeicons:checkmark-circle-02",
      color: "success",
    });
  } catch (error) {
    toast.add({
      title: "评论信息",
      description: "发生错误，请稍后再试。",
      icon: "hugeicons:alert-02",
      color: "error",
    });
  } finally {
    loading.value = false;
  }
};

const randomPlaceholder = ref("");

const placeholders = ref([
  "灵感来袭？快写下您的独特见解！",
  "分享您的故事或经验，让大家听听吧！",
  "欢迎加入讨论，畅所欲言~",
]);

const generateRandomPlaceholder = () => {
  randomPlaceholder.value =
    placeholders.value[Math.floor(Math.random() * placeholders.value.length)] || "";
};

const insertEmoji = (emoji: string) => {
  const textarea = commentInput.value?.$el.querySelector("textarea");
  if (!textarea) return;
  const { selectionStart, selectionEnd } = textarea;
  comment.value =
    comment.value.slice(0, selectionStart) + emoji + comment.value.slice(selectionEnd);
  nextTick(() => {
    textarea.setSelectionRange(selectionStart + emoji.length, selectionStart + emoji.length);
    textarea.focus();
  });
};

onMounted(() => {
  generateRandomPlaceholder();
});

onActivated(() => {
  generateRandomPlaceholder();
});

onDeactivated(() => (comment.value = ""));
</script>
