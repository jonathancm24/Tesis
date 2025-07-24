<!-- src/components/student/MessageForm.vue -->
<template>
  <div class="message-form">
    <div class="mb-2"><strong>Enviar a:</strong> {{ to }}</div>
    <textarea
      v-model="content"
      class="form-control mb-2"
      rows="3"
      placeholder="Escribe tu mensaje..."
    ></textarea>
    <button class="btn btn-primary w-100" @click="onSend" :disabled="!content">
      <i class="fas fa-paper-plane me-1"></i> Enviar
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  to: string;
}>();

const emit = defineEmits<{
  (e: 'send', content: string): void;
}>();

const content = ref<string>('');

watch(() => props.to, () => {
  content.value = '';
});

function onSend() {
  emit('send', content.value);
  content.value = '';
}
</script>

<style scoped>
.message-form button {
  width: 100%;
}
</style>
