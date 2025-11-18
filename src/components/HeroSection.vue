<template>
  <div class="hero w-full h-[calc(50vh-80px)] md:h-[calc(100vh-80px)] relative">
    <div class="relative">
  <img src="/static_images/hero_dots.svg?url" class="absolute left-0 md:left-1/3 z-2 w-screen md:w-3/5 rotate-180 md:rotate-0" />
  <img src="/static_images/Sali_.svg?url" class="absolute left-1/2 -translate-x-1/2 -translate-y-1/3 z-5 w-screen md:w-[80%] pt-[100px]"/>
  <img src="/static_images/Sali-2.svg?url" class="absolute left-1/2 -translate-x-1/2 -translate-y-1/3 z-15 w-screen md:w-[80%] pt-[100px]"/>
    </div>
    <div class="relative w-[80%] mx-auto flex flex-col justify-end h-[60vh] md:h-full z-20 text-left pb-30 md:pb-[120px]">
      <p class="work-sans-regular text-gray-50 text-xl md:text-2xl hidden md:inline">Rendelj házhoz, vagy kérd elvitelre!</p>
      <div class="mt-5 flex flex-col gap-4 md:flex-row">
        <router-link
          to="/contact"
          class="text-gray-50 rounded-lg px-6 py-2 text-md md:text-xl work-sans-semibold shadow transition mr-5 border-1 border-gray-50 bg-gray-50 hover:bg-gray-200 text-orange-600 hover:border-orange-600 hover:text-orange-700 w-full md:w-auto h-[80px] flex items-center justify-center"
        >
          Asztalfoglalás >
        </router-link>
        <router-link
          to="/menu"
          class="text-gray-50 rounded-lg bg-orange-600 px-6 py-2 text-md md:text-xl border-1 border-orange-600 work-sans-semibold shadow hover:bg-orange-700 transition w-full md:w-auto h-[80px] flex items-center justify-center hover:border-gray-50"
        >
          Étlap megtekintése >
        </router-link>
      </div>
    </div>
  </div>
</template>
<style scoped>
.pacifico-regular {
  font-family: "Pacifico", cursive;
  font-weight: 400;
  font-style: normal;
}
.outlined {
  color: transparent;
  -webkit-text-stroke: 5px oklch(98.5% 0 0); /* Zinc-50 */
}
.work-sans-light {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 300;
  font-style: normal;
}
.work-sans-regular {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 400;
  font-style: normal;
}
.work-sans-medium {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 500;
  font-style: normal;
}
.work-sans-semibold {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 600;
  font-style: normal;
}
.work-sans-bold {
  font-family: "Work Sans", sans-serif;
  font-optical-sizing: auto;
  font-weight: 700;
  font-style: normal;
}
</style>
