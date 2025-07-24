<!-- src/components/student/CommunicationView.vue -->

<template>
  <section class="communication container py-4">
    <!-- Sprint 4 – 2025-07-20 – Mensajería -->
    <div class="row">
      <div class="col-md-4">
        <MessageList
          :messages="studentStore.messages"
          :current-user="studentStore.currentUserName"
          @select="onSelect"
        />
      </div>
      <div class="col-md-8">
        <MessageForm
          :to="selectedContact"
          @send="onSend"
        />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useStudentStore } from '../../store/student';
import MessageList from '../../components/student/MessageList.vue';
import MessageForm from '../../components/student/MessageForm.vue';

const studentStore     = useStudentStore();
const selectedContact  = ref<string>('');

onMounted(() => {
  studentStore.loadMessages(selectedContact.value);
});

function onSelect(user: string) {
  selectedContact.value = user;
  studentStore.loadMessages(user);
}

async function onSend(content: string) {
  await studentStore.sendMessage(selectedContact.value, content);
}
</script>

<style src="../../assets/css/pages/student/CommunicationView.css" scoped></style>
