<template>
  <div class="foglalos-container">
    <div class="foglalos">
      <p>Foglalos component</p>
    </div>
    <div class="foglalos">
      <p>Foglalos component</p>
    </div>
  </div>
</template>
<style scoped>
.foglalos-container{
  display:flex;
  justify-content:center;
  align-items:center;
  gap:24px;
  margin:4rem auto;
  width:90%;
  max-width:1100px;
}

.foglalos {
  /* each box sizing when side-by-side */
  width:48%;
  min-width:260px;
  min-height:180px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:0.5rem;
  border:2px dashed #cfcfcf;
  background:#fafafa;
  color:#333;
  border-radius:8px;
  box-shadow:0 4px 12px rgba(0,0,0,0.04);
  font-weight:600;
  font-size:1.125rem;
  text-align:center;
  padding:1rem;
}

@media (min-width: 1024px) {
  .foglalos { min-height:240px }
}

@media (max-width: 820px){
  .foglalos-container{ flex-direction:column; gap:16px }
  .foglalos{ width:100% }
}
</style>
