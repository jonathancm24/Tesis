// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './store';

// Bootstrap 5 CSS & JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// Global CSS resets and variables
import '@/assets/css/globals/reset.css';
import '@/assets/css/globals/variables.css';

// Optional: global component CSS (if you want to bundle them here)
// import '@/assets/css/components/Header.css';
// import '@/assets/css/components/Sidebar.css';
// import '@/assets/css/components/Footer.css';

const app = createApp(App);

// Install router
app.use(router);

// Mount the app
app.mount('#app');
app.use(pinia);

