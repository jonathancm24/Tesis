<template>
  <section class="cie10-page usuarios-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Administración</p>
        <h1>Gestión CIE10 y Procedimientos</h1>
        <p class="subtitle">
          Administra códigos manualmente o carga tu archivo Excel para poblar la tabla.
        </p>
      </div>
      <div class="header-actions">
        <button class="btn btn-secondary" type="button" @click="downloadTemplate" :disabled="isLoading">
          Descargar plantilla
        </button>
        <button class="btn btn-secondary" type="button" @click="triggerImportFile" :disabled="isLoading">
          Cargar Excel
        </button>
        <input
          ref="importInputRef"
          type="file"
          accept=".xlsx,.xls"
          style="display: none"
          @change="handleImportExcel"
        />
      </div>
    </header>

    <div class="layout-single">
      <div class="card">
        <div class="card-header">
          <div class="toolbar">
            <input
              v-model="searchTerm"
              type="search"
              placeholder="Buscar por código o descripción"
              aria-label="Buscar código CIE10"
              @input="fetchData"
            />
            <select v-model="tipoFilter" @change="fetchData" aria-label="Filtrar por tipo">
              <option value="">Todos los tipos</option>
              <option value="CIE10">CIE10</option>
              <option value="PROCEDIMIENTO">PROCEDIMIENTO</option>
            </select>
          </div>
          <div class="summary">{{ total }} registros</div>
        </div>

        <div class="table-wrapper">
          <table class="cie10-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th class="actions-col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading && items.length === 0">
                <td colspan="4" class="empty-state">Cargando datos...</td>
              </tr>
              <tr v-for="item in items" :key="item.codigo">
                <td class="cie10-codigo">{{ item.codigo }}</td>
                <td>{{ item.tipo }}</td>
                <td class="cie10-desc">{{ item.descripcion }}</td>
                <td class="actions-col">
                  <button class="btn btn-link" type="button" @click="editItem(item)">Editar</button>
                  <button class="btn btn-link" type="button" @click="removeItem(item.codigo)">Eliminar</button>
                </td>
              </tr>
              <tr v-if="!isLoading && items.length === 0">
                <td colspan="4" class="empty-state">No hay registros para mostrar.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="importSummary" class="import-summary">
          Excel procesado: {{ importSummary.creados }} creados, {{ importSummary.actualizados }} actualizados,
          {{ importSummary.omitidos }} omitidos.
          <ul v-if="importSummary.errores.length" class="import-errors">
            <li v-for="(err, index) in importSummary.errores.slice(0, 5)" :key="index">
              Fila {{ err.fila }}: {{ err.mensaje }}
            </li>
          </ul>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div>
            <h2>{{ isEditing ? 'Editar código' : 'Nuevo código' }}</h2>
            <p class="subtitle">CRUD básico para mantenimiento manual.</p>
          </div>
        </div>

        <form class="cie10-form" @submit.prevent="handleSubmit">
          <div class="cie10-form-grid">
            <label>
              Código
              <input v-model.trim="form.codigo" :disabled="isEditing" required />
            </label>
            <label>
              Tipo
              <input v-model.trim="form.tipo" placeholder="CIE10 o PROCEDIMIENTO" required />
            </label>
            <label class="form-row-full">
              Descripción
              <textarea v-model.trim="form.descripcion" required></textarea>
            </label>
          </div>

          <div class="form-actions">
            <button class="btn btn-secondary" type="button" @click="resetForm" :disabled="isLoading">
              Limpiar
            </button>
            <button class="btn btn-primary" type="submit" :disabled="isLoading">
              {{ isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useToast } from '@/composables/useToast'
import { getErrorMessage } from '@/utils/errorHandler'
import { cie10Service } from '@/services/Admin/cie10.service'
import type { Cie10ImportResult, Cie10Item } from '@/types/cie10.types'
import '@/assets/styles/admin/usuarios.css'
import '@/assets/styles/admin/cie10.css'

const toast = useToast()

const items = ref<Cie10Item[]>([])
const total = ref(0)
const isLoading = ref(false)
const isEditing = ref(false)
const searchTerm = ref('')
const tipoFilter = ref('')
const importInputRef = ref<HTMLInputElement | null>(null)
const importSummary = ref<Cie10ImportResult | null>(null)

const form = reactive({
  codigo: '',
  tipo: 'CIE10',
  descripcion: ''
})

const fetchData = async () => {
  try {
    isLoading.value = true
    const response = await cie10Service.getAll({
      search: searchTerm.value || undefined,
      tipo: tipoFilter.value || undefined,
      page: 1,
      limit: 200
    })

    items.value = response.data
    total.value = response.meta.total
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true

    if (isEditing.value) {
      await cie10Service.update(form.codigo, {
        tipo: form.tipo,
        descripcion: form.descripcion
      })
      toast.success('Código actualizado correctamente')
    } else {
      await cie10Service.create({
        codigo: form.codigo,
        tipo: form.tipo,
        descripcion: form.descripcion
      })
      toast.success('Código creado correctamente')
    }

    resetForm()
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const editItem = (item: Cie10Item) => {
  isEditing.value = true
  form.codigo = item.codigo
  form.tipo = item.tipo
  form.descripcion = item.descripcion
}

const removeItem = async (codigo: string) => {
  if (!confirm(`¿Eliminar código ${codigo}?`)) return

  try {
    isLoading.value = true
    await cie10Service.delete(codigo)
    toast.success('Código eliminado correctamente')
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const resetForm = () => {
  isEditing.value = false
  form.codigo = ''
  form.tipo = 'CIE10'
  form.descripcion = ''
}

const triggerImportFile = () => {
  importInputRef.value?.click()
}

const downloadTemplate = async () => {
  try {
    isLoading.value = true
    const blob = await cie10Service.downloadTemplate()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'plantilla_cie10.xlsx'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
  }
}

const handleImportExcel = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) return

  try {
    isLoading.value = true
    importSummary.value = await cie10Service.importExcel(file)
    toast.success('Excel importado correctamente')
    await fetchData()
  } catch (error) {
    toast.error(getErrorMessage(error))
  } finally {
    isLoading.value = false
    input.value = ''
  }
}

onMounted(fetchData)
</script>
