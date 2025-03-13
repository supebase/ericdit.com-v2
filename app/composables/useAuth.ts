import type { User } from "~/types";

export function useAuth() {
  const { $authClient, $user } = useNuxtApp();
  const authStore = useAuthStore();
  const toast = useToast();
  const loading = ref(false);
  const tabsKey = ref(0);

  const handleLogin = async (email: string, password: string, clearInputs: () => void) => {
    if (!email || !password) {
      toast.add({
        title: "登录提示",
        description: "请输入有效的电子邮件及登录密码。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast.add({
        title: "登录提示",
        description: "电子邮件地址格式不正确，请检查。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    try {
      loading.value = true;
      const response = await $authClient.login(email, password);
      if (response) {
        const locationData = await useLocationIP();
        const userLocation = locationData.ipdata.info1;

        const user = (await $authClient.request(
          $user.readMe({ fields: ["id", "email", "first_name", "avatar", "location"] })
        )) as User;

        user.location = userLocation;
        await $authClient.request($user.updateUser(user.id, { location: userLocation }));

        authStore.setUserData(user);
        loading.value = false;

        // 清空输入框
        clearInputs();

        toast.add({
          title: "登录提示",
          description: "您已成功登录。",
          icon: "hugeicons:checkmark-circle-02",
          color: "success",
        });

        navigateTo("/");
      }
    } catch (error: any) {
      toast.add({
        title: "登录提示",
        description: error.errors?.[0]?.message || "登录失败，请稍后重试。",
        icon: "hugeicons:alert-02",
        color: "error",
      });
      loading.value = false;
    }
  };

  const handleRegister = async (
    name: string,
    newEmail: string,
    newPassword: string,
    confirmPassword: string,
    clearInputs: () => void
  ) => {
    if (!name || !newEmail || !newPassword || !confirmPassword) {
      toast.add({
        title: "注册提示",
        description: "请完整填写所有必填字段信息。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    const isChinese = /[\u4e00-\u9fa5]/.test(name);
    const maxLength = isChinese ? 8 : 20;
    if (isChinese && name.length < 2) {
      toast.add({
        title: "注册提示",
        description: "中文名字至少需要 2 个字。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    } else if (!isChinese && name.length < 3) {
      toast.add({
        title: "注册提示",
        description: "英文名字至少需要 3 个字母。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }
    if (name.length > maxLength) {
      toast.add({
        title: "注册提示",
        description: isChinese ? "中文名字最多 8 个字。" : "英文名字最多 20 个字母",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    if (!validateEmail(newEmail)) {
      toast.add({
        title: "注册提示",
        description: "电子邮件地址格式不正确，请检查。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast.add({
        title: "注册提示",
        description: "密码长度不能少于 8 个字符。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.add({
        title: "注册提示",
        description: "两次输入的密码不匹配。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    try {
      loading.value = true;
      await $authClient.request(
        $user.registerUser(newEmail, confirmPassword, {
          first_name: name,
        })
      );
      loading.value = false;

      // 清空输入框
      clearInputs();

      // 注册成功后，切换回登录 tab
      tabsKey.value++;

      toast.add({
        title: "注册提示",
        description: "注册成功，立即登录。",
        icon: "hugeicons:checkmark-circle-02",
        color: "success",
      });
    } catch (error: any) {
      toast.add({
        title: "注册提示",
        description: error.errors?.[0]?.message || "注册失败，请稍后重试。",
        icon: "hugeicons:alert-02",
        color: "error",
      });
      loading.value = false;
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return { handleLogin, handleRegister, loading, tabsKey };
}
