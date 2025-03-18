export function useImageLoader(src: string | undefined) {
  const loaded = ref(false);
  const imageSrc = ref("");

  watchEffect(() => {
    if (!src) return;
    loaded.value = false;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageSrc.value = img.src;
      loaded.value = true;
    };
    img.onerror = () => {
      loaded.value = false;
      imageSrc.value = "";
    };
  });

  return { loaded, imageSrc };
}
