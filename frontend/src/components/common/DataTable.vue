<!-- src/components/common/DataTable.vue -->

<template>
  <div class="table-responsive">
    <table class="table table-hover align-middle">
      <thead class="table-light">
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in pagedRows" :key="row.id">
          <td v-for="col in columns" :key="col.key">{{ row[col.key] }}</td>
          <td class="text-end">
            <button class="btn btn-sm btn-outline-primary me-2" @click="emit('edit', row)">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" @click="emit('delete', row.id)">
              <i class="fas fa-trash-alt"></i>
            </button>
          </td>
        </tr>
        <tr v-if="rows.length === 0">
          <td :colspan="columns.length + 1" class="text-center text-muted py-3">
            No hay datos para mostrar.
          </td>
        </tr>
      </tbody>
    </table>

    <nav v-if="totalPages > 1" aria-label="Paginación">
      <ul class="pagination justify-content-center mb-0">
        <li :class="['page-item', { disabled: page <= 1 }]">
          <a class="page-link" href="#" @click.prevent="changePage(page - 1)">‹</a>
        </li>
        <li
          v-for="p in totalPages"
          :key="p"
          :class="['page-item', { active: p === page }]"
        >
          <a class="page-link" href="#" @click.prevent="changePage(p)">{{ p }}</a>
        </li>
        <li :class="['page-item', { disabled: page >= totalPages }]">
          <a class="page-link" href="#" @click.prevent="changePage(page + 1)">›</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  columns: { key: string; label: string }[];
  rows: Record<string, any>[];
  page: number;
  perPage: number;
}>();

const emit = defineEmits<{
  (e: 'edit', row: Record<string, any>): void;
  (e: 'delete', id: number): void;
  (e: 'update:page', page: number): void;
}>();

const totalPages = computed(() => Math.ceil(props.rows.length / props.perPage));
const pagedRows   = computed(() =>
  props.rows.slice((props.page - 1) * props.perPage, props.page * props.perPage)
);

function changePage(p: number) {
  if (p < 1 || p > totalPages.value) return;
  emit('update:page', p);
}
</script>

<style scoped>
.table-responsive {
  max-height: calc(100vh - var(--header-height) - var(--footer-height) - 200px);
  overflow-y: auto;
}
</style>
