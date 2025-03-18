import type { ImageLoaderReturn } from "~/types";

export function useImageLoader(src: string | undefined, timeout = 15000): ImageLoaderReturn {
  const loaded = ref(false);
  const error = ref(false);
  const imageSrc = ref("");

  let timeoutId: NodeJS.Timeout;
  let img: HTMLImageElement | null = null;

  watchEffect((onCleanup) => {
    if (!src) return;

    // 重置状态
    loaded.value = false;
    error.value = false;
    imageSrc.value = "";

    img = new Image();

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (img) {
        img.onload = null;
        img.onerror = null;
        img = null;
      }
    };

    timeoutId = setTimeout(() => {
      error.value = true;
      cleanup();
    }, timeout);

    img.onload = () => {
      imageSrc.value = src;
      loaded.value = true;
      cleanup();
    };

    img.onerror = () => {
      error.value = true;
      cleanup();
    };

    img.src = src;

    onCleanup(cleanup);
  });

  return { loaded, error, imageSrc };
}
