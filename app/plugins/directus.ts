import {
  registerUser,
  updateUser,
  readMe,
  readUsers,
  readItem,
  readItems,
  createItem,
  deleteItem,
  readFile,
  uploadFiles,
  deleteFile,
} from "@directus/sdk";

export default defineNuxtPlugin(() => {
  const { directus, authClient, realtimeClient } = useDirectus();

  // 提供插件中需要的 Directus API
  return {
    provide: {
      directus, // 基础客户端
      authClient, // 带认证的客户端
      realtimeClient, // 带 WebSocket 的客户端

      // 用户相关 API
      user: {
        registerUser,
        updateUser,
        readMe,
        readUsers,
      },

      // 内容管理 API
      content: {
        readItem,
        readItems,
        createItem,
        deleteItem,
      },

      // 文件管理 API
      file: {
        readFile,
        uploadFiles,
        deleteFile,
      },
    },
  };
});
