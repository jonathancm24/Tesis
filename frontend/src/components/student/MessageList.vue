<!-- src/components/student/MessageList.vue -->
<template>
  <div class="message-list">
    <h6>Contactos</h6>
    <ul class="list-group mb-3">
      <li
        v-for="m in uniqueContacts"
        :key="m"
        class="list-group-item list-group-item-action"
        :class="{ active: m === currentUser }"
        @click="select(m)"
      >
        {{ m }}
      </li>
    </ul>
    <h6>Mensajes</h6>
    <div class="messages-container">
      <div
        v-for="msg in messages"
        :key="msg.id"
        :class="['message', { 'from-me': msg.from === currentUser }]"
      >
        <div class="small text-muted">{{ msg.from }}</div>
        <div>{{ msg.content }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '../../mocks/student/messaging';

const props = defineProps<{
  messages: Message[];
  currentUser: string;
}>();

const emit = defineEmits<{
  (e: 'select', user: string): void;
}>();

const uniqueContacts = computed(() =>
  Array.from(
    new Set(
      props.messages
        .flatMap(m => [m.from, m.to])
        .filter(u => u !== props.currentUser)
    )
  )
);

function select(user: string) {
  emit('select', user);
}
</script>

<style scoped>
.messages-container {
  max-height: 300px;
  overflow-y: auto;
}
.message {
  padding: 0.5rem;
  border-radius: var(--radius);
  margin-bottom: 0.5rem;
  background: var(--color-gray-100);
}
.from-me {
  background: var(--color-primary-light);
  align-self: flex-end;
}
</style>
