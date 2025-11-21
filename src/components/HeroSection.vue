<template>
  <div class="hero w-full h-auto md:h-[calc(100vh-80px)] relative flex flex-col">
    <div class="relative w-full h-[50vh] md:h-3/4">
      <div class="absolute inset-0 flex justify-center items-center overflow-hidden">
        <img src="/static_images/hero_dots.svg?url" class="z-2 w-full h-full rotate-180 md:rotate-0 object-contain absolute" />
        <img src="/static_images/Sali_.svg?url" class="z-5 w-full h-full object-contain absolute"/>
        <img src="/static_images/Sali-2.svg?url" class="z-15 w-full h-full object-contain absolute"/>
      </div>
    </div>
    <div class="flex-1 w-[80%] mx-auto flex flex-col z-20 text-left justify-end pb-10">
      <p class="work-sans-regular text-gray-50 text-xl md:text-2xl text-center md:text-left ">Rendelj házhoz, vagy kérd elvitelre!</p>
      <div class="mt-5 flex flex-col gap-4 md:flex-row">
        <router-link
          to="/contact"
          class="text-gray-50 rounded-lg px-6 py-2 text-md md:text-xl work-sans-semibold shadow transition mr-5 border-1 border-gray-50 bg-gray-50 hover:bg-gray-200 text-orange-600 hover:border-orange-600 hover:text-orange-700 w-full md:w-auto h-[80px] md:h-auto flex items-center justify-center"
        >
          Asztalfoglalás >
        </router-link>
        <router-link
          to="/menu"
          class="text-gray-50 rounded-lg bg-orange-600 px-6 py-2 text-md md:text-xl border-1 border-orange-600 work-sans-semibold shadow hover:bg-orange-700 transition w-full md:w-auto h-[80px] md:h-auto flex items-center justify-center hover:border-gray-50"
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
