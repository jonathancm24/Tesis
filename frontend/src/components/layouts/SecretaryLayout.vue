<!--src/components/layouts/SecretaryLayout.vue-->
<template>
  <div class="secretary-layout d-flex">
    <!-- Sidebar con props -->
    <Sidebar
      :title="'Secretaría'"
      :subtitle="'Gestión Clínica'"
      :logoSrc="'/logo-uleam.png'"
      :items="menuItems"
    />

    <!-- Contenido principal -->
    <div class="main flex-grow-1 d-flex flex-column">
      <Header role="secretario" />
      <main class="content flex-grow-1 p-4">
        <router-view />
      </main>
      <Footer />
    </div>
  </div>
</template>

<script setup lang="ts">
import Sidebar from '@/components/common/Sidebar.vue'
import Header from '@/components/common/Header.vue'
import Footer from '@/components/common/Footer.vue'

// Definimos las páginas del sidebar del secretario
const menuItems = [
  {
    name: 'SecretaryDashboard',
    label: 'Dashboard',
    icon: 'fas fa-home',
    to: '/secretary'
  },
  {
    name: 'PatientManagement',
    label: 'Gestión de Pacientes',
    icon: 'fas fa-user-injured',
    to: '/secretary/management'
  },
  {
    name: 'PatientAssignmentView',
    label: 'Asignaciones',
    icon: 'fas fa-user-check',
    to: '/secretary/patients'
  },
  {
    name: 'WeeklySchedule',
    label: 'Agenda Semanal',
    icon: 'fas fa-calendar-alt',
    to: '/secretary/schedule'
  },
  {
    name: 'MedicalScreening',
    label: 'Cuestionario Médico',
    icon: 'fas fa-notes-medical',
    to: '/secretary/screening'
  },
   { name: 'Affiliation',          label: 'Afiliación',       icon: 'fas fa-id-card',      to: { name: 'Affiliation' } }
]
</script>

<style scoped>
.secretary-layout {
  height: 100vh;
  overflow: hidden;
  display: flex;
}

.main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
}

.content {
  background-color: var(--color-light);
  overflow-y: auto;
}

.secretary-layout ::v-deep .navbar {
  background-color: var(--color-info);
}

.secretary-layout ::v-deep .footer {
  background-color: var(--color-secondary);
}
</style>
