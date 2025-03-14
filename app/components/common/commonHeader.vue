<template>
  <div class="fixed top-10 left-10">
    <Transition
      name="fade"
      mode="out-in">
      <div
        v-if="$route.path === '/'"
        key="logo">
        <CommonLogo />
      </div>
      <div
        v-else
        key="icon"
        @click="$router.push('/')"
        class="cursor-pointer">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="36"
          height="36"
          viewBox="0 0 24 24">
          <g
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.2">
            <path
              class="circle"
              stroke-dasharray="64"
              stroke-dashoffset="64"
              d="M21 12c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9c4.97 0 9 4.03 9 9Z" />
            <path
              class="check"
              stroke-dasharray="6"
              stroke-dashoffset="6"
              d="M10 12l3 -3M10 12l3 3" />
          </g>
        </svg>
      </div>
    </Transition>
  </div>

  <div class="fixed top-10 right-10">
    <UserAuth />
  </div>
</template>
