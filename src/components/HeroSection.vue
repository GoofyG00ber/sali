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
          class="hero-btn-outline"
        >
          Asztalfoglalás >
        </router-link>
        <router-link
          to="/menu"
          class="hero-btn-primary"
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

.hero-btn-outline {
  background: #f5f5f5;
  color: #ff6106;
  border: 1px solid #f5f5f5;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Work Sans", sans-serif;
  cursor: pointer;
  text-decoration: none;
  width: 100%;
  height: 80px;
  margin-right: 20px;
}

@media (min-width: 768px) {
  .hero-btn-outline {
    width: auto;
    height: auto;
    margin-right: 20px;
  }
}

.hero-btn-outline:hover {
  background: #fff;
  border-color: #ff6106;
}

.hero-btn-primary {
  background: #ff6106;
  color: #fff;
  border: 1px solid #ff6106;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Work Sans", sans-serif;
  cursor: pointer;
  text-decoration: none;
  width: 100%;
  height: 80px;
}

@media (min-width: 768px) {
  .hero-btn-primary {
    width: auto;
    height: auto;
  }
}

.hero-btn-primary:hover {
  background: #e55a00;
  border-color: #e55a00;
}
</style>
