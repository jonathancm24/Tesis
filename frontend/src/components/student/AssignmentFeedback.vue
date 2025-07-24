<!-- src/components/student/AssignmentFeedback.vue -->
 <template>
  <div class="assignment-feedback card shadow-sm p-3">
    <h5 class="card-title mb-3">Retroalimentación: {{ feedback.title }}</h5>
    <div v-if="!feedback.comments.length" class="text-muted">
      Aún no hay comentarios.
    </div>
    <ul v-else class="list-unstyled">
      <li v-for="(c, idx) in feedback.comments" :key="idx" class="mb-2">
        <strong>{{ c.author }}:</strong> {{ c.text }}
      </li>
    </ul>
    <div v-if="feedback.attachments.length" class="mt-3">
      <h6>Archivos adjuntos:</h6>
      <ul>
        <li v-for="(url, i) in feedback.attachments" :key="i">
          <a :href="url" target="_blank" rel="noopener">{{ filename(url) }}</a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FeedbackComment { author: string; text: string; }
interface Feedback {
  title: string;
  comments: FeedbackComment[];
  attachments: string[];
}

// Desestructuramos la única prop
const { feedback } = defineProps<{ feedback: Feedback }>();

function filename(url: string) {
  return url.split('/').pop() || url;
}
</script>

<style scoped>
.assignment-feedback ul {
  padding-left: var(--spacer-lg);
}
</style>
