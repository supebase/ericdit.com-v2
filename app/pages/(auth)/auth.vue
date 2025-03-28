<template>
  <UCard
    variant="soft"
    class="mt-24 sm:mt-11 mb-14 max-w-md mx-auto">
    <UTabs
      :items="items"
      :key="tabsKey"
      variant="link"
      class="gap-4 w-full"
      :ui="{ trigger: 'flex-1 cursor-pointer' }">
      <template #content="{ item, index }">
        <form @submit.prevent="() => handleAuth(index)">
          <p class="text-sm text-neutral-500 mb-4 py-3">{{ item.description }}</p>
          <div
            v-if="index === 0"
            class="flex flex-col gap-4">
            <UInput
              v-model="email"
              variant="outline"
              color="neutral"
              size="xl"
              icon="hugeicons:at"
              class="w-full"
              @blur="handleFocus"
              placeholder="电子邮件" />
            <UInput
              v-model="password"
              variant="outline"
              color="neutral"
              size="xl"
              icon="hugeicons:lock-key"
              class="w-full"
              :type="show.login ? 'text' : 'password'"
              @blur="handleFocus"
              placeholder="登录密码">
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="md"
                  tabindex="-1"
                  :icon="show.login ? 'hugeicons:view-off' : 'hugeicons:view'"
                  @click="show.login = !show.login" />
              </template>
            </UInput>
          </div>

          <div
            v-else
            class="flex flex-col gap-4">
            <UInput
              v-model="newEmail"
              variant="outline"
              color="neutral"
              size="xl"
              icon="hugeicons:at"
              @blur="handleFocus"
              placeholder="电子邮件"
              class="w-full" />
            <UInput
              v-model="name"
              variant="outline"
              color="neutral"
              size="xl"
              icon="hugeicons:user-square"
              @blur="handleFocus"
              placeholder="你的名字"
              class="w-full" />
            <UInput
              v-model="newPassword"
              variant="outline"
              color="neutral"
              size="xl"
              icon="hugeicons:square-lock-add-02"
              :type="show.register ? 'text' : 'password'"
              @blur="handleFocus"
              placeholder="输入密码"
              class="w-full">
              <template #trailing>
                <UChip
                  standalone
                  inset
                  :color="strengthColor"
                  :show="!!newPassword"
                  class="mr-2" />
                <UButton
                  color="neutral"
                  variant="link"
                  size="md"
                  tabindex="-1"
                  :icon="show.register ? 'hugeicons:view-off' : 'hugeicons:view'"
                  @click="show.register = !show.register" />
              </template>
            </UInput>
            <UInput
              v-model="confirmPassword"
              variant="outline"
              color="neutral"
              size="xl"
              icon="hugeicons:square-lock-check-02"
              :type="show.confirm ? 'text' : 'password'"
              @blur="handleFocus"
              placeholder="确认密码"
              class="w-full">
              <template #trailing>
                <UButton
                  color="neutral"
                  variant="link"
                  size="md"
                  tabindex="-1"
                  :icon="show.confirm ? 'hugeicons:view-off' : 'hugeicons:view'"
                  @click="show.confirm = !show.confirm" />
              </template>
            </UInput>
          </div>

          <div class="flex justify-center mt-6">
            <UButton
              :label="item.label"
              type="submit"
              size="lg"
              variant="solid"
              color="neutral"
              class="cursor-pointer"
              :loading="loading"
              :disabled="loading" />
          </div>
        </form>
      </template>
    </UTabs>
  </UCard>
</template>

<script setup lang="ts">
const authStore = useAuthStore();
const { handleLogin, handleRegister, loading, tabsKey } = useAuth();
const items = computed(() => [
  {
    label: "登录",
    description:
      "请使用您的注册信息进行登录，确保您输入的登录信息准确无误，并注意保护您的账号安全。",
    icon: "hugeicons:lock-key",
  },
  {
    label: "注册",
    description:
      "只需简单几步就可以创建一个账户，请确保您提供的信息真实有效，并妥善保管您的登录凭证。",
    icon: "hugeicons:passport",
  },
]);

const email = ref("");
const password = ref("");
const name = ref("");
const newEmail = ref("");
const newPassword = ref("");
const confirmPassword = ref("");

const show = reactive({
  login: false,
  register: false,
  confirm: false,
});

// 清空输入框
const clearInputs = () => {
  email.value = "";
  password.value = "";
  name.value = "";
  newEmail.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
};

const handleAuth = (formType: number) => {
  if (formType === 0) {
    handleLogin(email.value, password.value, clearInputs);
  } else {
    handleRegister(
      name.value,
      newEmail.value,
      newPassword.value,
      confirmPassword.value,
      clearInputs
    );
  }
};

onMounted(async () => {
  if (!authStore.user) {
    await authStore.fetchUserData();
  }

  if (authStore.isLoggedIn) {
    navigateTo("/");
  }
});

onDeactivated(() => {
  clearInputs();
});

const handleFocus = (event: FocusEvent) => {
  (event.target as HTMLElement).scrollIntoView({ behavior: "smooth", block: "start" });
};

const requirements = [{ regex: /.{8,}/ }, { regex: /\d/ }, { regex: /[a-z]/ }, { regex: /[A-Z]/ }];

const strength = computed(() =>
  requirements.map((req) => ({ ...req, met: req.regex.test(newPassword.value) }))
);

const score = computed(() => strength.value.filter((req) => req.met).length);

const strengthColor = computed(() => {
  return ["neutral", "error", "warning", "warning", "success"][score.value] as
    | "neutral"
    | "error"
    | "warning"
    | "success"
    | undefined;
});

useSeoMeta({ title: "登录或注册" });
</script>
