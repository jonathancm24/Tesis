<!-- src/views/student/TopografiaMucosaOralView.vue -->
<template>
  <div class="mucosa-checklist-view">
    <h1 class="titulo">Topografía de la mucosa oral</h1>

    <!-- Tabs para alternar entre vista superior e inferior -->
    <div class="tabs">
      <button :class="{ active: vista === 'superior' }" @click="vista = 'superior'">Vista Superior</button>
      <button :class="{ active: vista === 'inferior' }" @click="vista = 'inferior'">Vista Inferior</button>
    </div>

    <div class="mucosa-grid">
      <!-- LISTA CON CHECKS -->
      <div class="tabla-lista">
        <div class="localizacion-header">
          <span>Localización</span>
          <button class="btn-guardar" @click="guardarSeleccion">
            <span v-if="!guardando">Guardar selección</span>
            <span v-else class="guardando-texto">Guardando...</span>
          </button>
        </div>
        <div v-for="item in localizacionesVista" :key="item.numero" class="localizacion-row">
          <label>
            <input type="checkbox" v-model="item.marcado" @change="cambioSeleccion" />
            <span class="num">{{ item.numero }}.</span>
            <span>{{ item.nombre }}</span>
          </label>
        </div>
      </div>

      <!-- IMAGEN -->
      <div class="mucosa-img-container">
        <img
          v-if="vista === 'superior'"
          src="@/assets/img/mucosa-superior.png"
          alt="Mucosa oral superior"
        />
        <img
          v-else
          src="@/assets/img/mucosa-inferior.png"
          alt="Mucosa oral inferior"
        />
        <div class="leyenda">{{ vista === 'superior' ? 'Vista superior' : 'Vista inferior' }}</div>
      </div>
    </div>

    <!-- Notificación de guardado -->
    <div v-if="mostrarNotificacion" class="notificacion-guardado">
      Selección guardada correctamente
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const vista = ref('superior')
const guardando = ref(false)
const mostrarNotificacion = ref(false)
const cambiosSinGuardar = ref(false)

// Cargar datos guardados del localStorage al iniciar
const cargarDatosGuardados = () => {
  const datosGuardados = localStorage.getItem('mucosaOralSeleccion')
  if (datosGuardados) {
    const parsedData = JSON.parse(datosGuardados)
    localizacionesSuperiores.value.forEach(item => {
      const itemGuardado = parsedData.superior.find(i => i.numero === item.numero)
      if (itemGuardado) item.marcado = itemGuardado.marcado
    })
    localizacionesInferiores.value.forEach(item => {
      const itemGuardado = parsedData.inferior.find(i => i.numero === item.numero)
      if (itemGuardado) item.marcado = itemGuardado.marcado
    })
  }
}

const localizacionesSuperiores = ref([
  { numero: 13, nombre: 'borde bermellón', marcado: false },
  { numero: 15, nombre: 'comisura labial der.', marcado: false },
  { numero: 16, nombre: 'comisura labial izq.', marcado: false },
  { numero: 17, nombre: 'mucosa labial', marcado: false },
  { numero: 19, nombre: 'mucosa mejilla bucal der.', marcado: false },
  { numero: 20, nombre: 'mucosa mejilla bucal izq.', marcado: false },
  { numero: 21, nombre: 'surco labial', marcado: false },
  { numero: 23, nombre: 'surco bucal der.', marcado: false },
  { numero: 25, nombre: 'surco bucal izq.', marcado: false },
  { numero: 27, nombre: 'encía o reborde residual bucal der.', marcado: false },
  { numero: 28, nombre: 'encía o reborde residual bucal izq.', marcado: false },
  { numero: 31, nombre: 'encía o reborde residual labial', marcado: false },
  { numero: 33, nombre: 'encía o reborde residual palatina post. der.', marcado: false },
  { numero: 34, nombre: 'encía o reborde residual palatina post. izq.', marcado: false },
  { numero: 37, nombre: 'encía o reborde residual palatina ant.', marcado: false },
  { numero: 39, nombre: 'dorso de la lengua der.', marcado: false },
  { numero: 40, nombre: 'dorso de la lengua izq.', marcado: false },
  { numero: 41, nombre: 'base de la lengua der.', marcado: false },
  { numero: 42, nombre: 'base de la lengua izq.', marcado: false },
  { numero: 51, nombre: 'paladar duro der.', marcado: false },
  { numero: 52, nombre: 'paladar duro izq.', marcado: false },
  { numero: 53, nombre: 'paladar blando der.', marcado: false },
  { numero: 54, nombre: 'paladar blando izq.', marcado: false },
  { numero: 55, nombre: 'pilar amigdalino ant. Der.', marcado: false },
  { numero: 56, nombre: 'pilar amigdalino ant. Izq.', marcado: false }
])

const localizacionesInferiores = ref([
  { numero: 14, nombre: 'borde bermellón', marcado: false },
  { numero: 18, nombre: 'mucosa labial', marcado: false },
  { numero: 22, nombre: 'surco labial', marcado: false },
  { numero: 24, nombre: 'surco bucal der.', marcado: false },
  { numero: 26, nombre: 'surco bucal izq.', marcado: false },
  { numero: 29, nombre: 'encía o reborde residual bucal der.', marcado: false },
  { numero: 30, nombre: 'encía o reborde residual bucal izq.', marcado: false },
  { numero: 32, nombre: 'encía o reborde residual labial', marcado: false },
  { numero: 35, nombre: 'encía o reborde residual lingual posterior der.', marcado: false },
  { numero: 36, nombre: 'encía o reborde residual lingual posterior izq.', marcado: false },
  { numero: 38, nombre: 'encía o reborde residual lingual anterior', marcado: false },
  { numero: 43, nombre: 'punta de la lengua', marcado: false },
  { numero: 44, nombre: 'margen de la lengua der.', marcado: false },
  { numero: 45, nombre: 'margen de la lengua izq.', marcado: false },
  { numero: 46, nombre: 'vientre lengua der.', marcado: false },
  { numero: 47, nombre: 'vientre lengua izq.', marcado: false },
  { numero: 48, nombre: 'piso de la boca frontal', marcado: false },
  { numero: 49, nombre: 'piso de la boca lateral der.', marcado: false },
  { numero: 50, nombre: 'piso de la boca lateral izq.', marcado: false }
])

const localizacionesVista = computed(() =>
  vista.value === 'superior'
    ? localizacionesSuperiores.value
    : localizacionesInferiores.value
)

const cambioSeleccion = () => {
  cambiosSinGuardar.value = true
}

const guardarSeleccion = () => {
  guardando.value = true
  cambiosSinGuardar.value = false
  
  const datosAGuardar = {
    superior: localizacionesSuperiores.value,
    inferior: localizacionesInferiores.value
  }
  
  localStorage.setItem('mucosaOralSeleccion', JSON.stringify(datosAGuardar))
  
  // Mostrar notificación
  mostrarNotificacion.value = true
  setTimeout(() => {
    mostrarNotificacion.value = false
    guardando.value = false
  }, 3000)
}

// Cargar datos al montar el componente
onMounted(() => {
  cargarDatosGuardados()
  
  // Advertencia al salir si hay cambios sin guardar
  window.addEventListener('beforeunload', (e) => {
    if (cambiosSinGuardar.value) {
      e.preventDefault()
      e.returnValue = 'Tienes cambios sin guardar. ¿Seguro que quieres salir?'
    }
  })
})
</script>

<style scoped>
.mucosa-checklist-view {
  max-width: 1000px;
  margin: 36px auto;
  padding: 32px 12px 32px 12px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 4px 18px 0 #a5b4fc30;
  font-family: 'Segoe UI', Arial, sans-serif;
  position: relative;
}
.titulo {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #22223b;
  margin-bottom: 0.8em;
  letter-spacing: .5px;
}
.tabs {
  display: flex;
  justify-content: center;
  gap: 18px;
  margin-bottom: 18px;
}
.tabs button {
  padding: 8px 22px;
  font-size: 1rem;
  border: none;
  border-radius: 8px 8px 0 0;
  background: #e0e7ff;
  color: #3730a3;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.tabs button.active {
  background: #6366f1;
  color: #fff;
  box-shadow: 0 2px 8px #c7d2fe;
}
.mucosa-grid {
  display: grid;
  grid-template-columns: 2.2fr 2.2fr;
  gap: 38px;
}
.tabla-lista {
  background: #f8fafc;
  border-radius: 12px;
  padding: 22px 12px 18px 24px;
  box-shadow: 0 1px 10px 0 #cbd5e170;
  max-height: 600px;
  overflow-y: auto;
  min-width: 250px;
}
.localizacion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
  color: #6366f1;
  font-size: 1.08rem;
  margin-bottom: 7px;
  padding-left: 2px;
  padding-right: 10px;
}
.btn-guardar {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 5px;
}
.btn-guardar:hover {
  background: #4338ca;
}
.guardando-texto {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.localizacion-row {
  margin-bottom: 7px;
  font-size: 1rem;
}
.localizacion-row label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 7px;
  user-select: none;
  transition: color 0.2s;
}
.localizacion-row label:hover {
  color: #4f46e5;
}
input[type="checkbox"] {
  accent-color: #6366f1;
  width: 16px;
  height: 16px;
  margin-right: 5px;
  cursor: pointer;
}
.num {
  font-weight: 700;
  color: #6366f1;
  margin-right: 5px;
  min-width: 27px;
  display: inline-block;
}
.mucosa-img-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.mucosa-img-container img {
  max-width: 360px;
  width: 100%;
  background: #fff;
  border: 2px solid #c7d2fe;
  border-radius: 12px;
  box-shadow: 0 1px 10px #cbd5e170;
  margin-bottom: 9px;
}
.leyenda {
  color: #6366f1;
  font-weight: 600;
  font-size: 1rem;
  margin-top: 1px;
  letter-spacing: 1px;
}

/* Notificación de guardado */
.notificacion-guardado {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: #10b981;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  animation: fadeInOut 3s ease-in-out;
  z-index: 1000;
}

@keyframes fadeInOut {
  0% { opacity: 0; transform: translateX(-50%) translateY(20px); }
  10% { opacity: 1; transform: translateX(-50%) translateY(0); }
  90% { opacity: 1; transform: translateX(-50%) translateY(0); }
  100% { opacity: 0; transform: translateX(-50%) translateY(20px); }
}

@media (max-width: 950px) {
  .mucosa-grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .mucosa-img-container img {
    max-width: 230px;
  }
  .tabla-lista {
    max-height: 210px;
  }
  .localizacion-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .btn-guardar {
    align-self: flex-end;
  }
}
@media (max-width: 600px) {
  .mucosa-checklist-view {
    padding: 8px 2px 12px 2px;
  }
  .tabla-lista {
    padding: 9px 2px 7px 6px;
  }
  .titulo {
    font-size: 1.08rem;
  }
  .mucosa-img-container img {
    max-width: 110px;
  }
}
</style>