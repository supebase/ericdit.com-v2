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
        const { location } = await useLocationIP();
        const userLocation = location;

        const user = (await $authClient.request(
          $user.readMe({
            fields: ["id", "email", "first_name", "avatar", "location", "online", "last_active"],
          })
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
        description: errorMessages[error.errors?.[0]?.message] || "登录失败，请稍后重试。",
        icon: "hugeicons:alert-02",
        color: "error",
      });
      loading.value = false;
    }
  };

  const validateUsername = (name: string) => {
    const isChinese = /[\u4e00-\u9fa5]/.test(name);
    const maxLength = isChinese ? 8 : 20;
    const minLength = isChinese ? 2 : 3;
    const specialCharPattern = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
    const isPureNumber = /^[0-9]+$/.test(name);

    if (!name) return { valid: false, message: "请输入你的名字。" };
    if (isChinese && name.length < minLength)
      return { valid: false, message: "中文名字至少需要 2 个字。" };
    if (!isChinese && name.length < minLength)
      return { valid: false, message: "英文名字至少需要 3 个字母。" };
    if (name.length > maxLength)
      return {
        valid: false,
        message: isChinese ? "中文名字最多 8 个字。" : "英文名字最多 20 个字母",
      };
    if (!specialCharPattern.test(name))
      return { valid: false, message: "名字不能包含特殊字符，请检查并修改。" };
    if (isPureNumber) return { valid: false, message: "名字至少含一个字母或汉字，不能纯数字。" };

    return { valid: true, message: "" };
  };

  const handleRegister = async (
    name: string,
    newEmail: string,
    newPassword: string,
    confirmPassword: string,
    clearInputs: () => void
  ) => {
    // 基本验证
    if (!name || !newEmail || !newPassword || !confirmPassword) {
      toast.add({
        title: "注册提示",
        description: "请完整填写所有必填字段信息。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    // 验证邮箱
    if (!validateEmail(newEmail)) {
      toast.add({
        title: "注册提示",
        description: "电子邮件地址格式不正确，请检查。",
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    // 验证用户名
    const nameValidation = validateUsername(name);
    if (!nameValidation.valid) {
      toast.add({
        title: "注册提示",
        description: nameValidation.message,
        icon: "hugeicons:alert-02",
        color: "warning",
      });
      return;
    }

    // 验证密码
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

      // 合并查询用户邮箱和用户名
      const existingUsers = await $authClient.request(
        $user.readUsers({
          filter: {
            _or: [{ email: { _eq: newEmail } }, { first_name: { _eq: name.toLowerCase() } }],
          },
        })
      );

      const emailExists = existingUsers.some((user) => user.email === newEmail);
      const nameExists = existingUsers.some(
        (user) => user.first_name.toLowerCase() === name.toLowerCase()
      );

      if (emailExists) {
        toast.add({
          title: "注册提示",
          description: "该电子邮件已被注册，请使用其他电子邮件。",
          icon: "hugeicons:alert-02",
          color: "warning",
        });
        loading.value = false;
        return;
      }

      if (nameExists) {
        toast.add({
          title: "注册提示",
          description: "该名字已被使用，请选择其他名字。",
          icon: "hugeicons:alert-02",
          color: "warning",
        });
        loading.value = false;
        return;
      }

      // 注册用户
      await $authClient.request(
        $user.registerUser(newEmail, confirmPassword, {
          first_name: name,
        })
      );

      clearInputs();
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
    } finally {
      loading.value = false;
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const errorMessages: Record<string, string> = {
    "Invalid user credentials.": "错误的用户名或密码",
  };

  return { handleLogin, handleRegister, loading, tabsKey };
}
