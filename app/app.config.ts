export default defineAppConfig({
  ui: {
    colors: {
      primary: "emerald",
      neutral: "zinc",
    },
    icons: {
      loading: "svg-spinners:ring-resize",
    },
    button: {
      compoundVariants: [
        {
          class: {
            leadingIcon: "animate-none",
          },
        },
      ],
    },
  },
  toaster: {
    expand: false,
    duration: 4000,
  },
  tooltip: {
    delayDuration: 0,
  },
});
