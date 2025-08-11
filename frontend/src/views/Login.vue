<!-- src/views/Login.vue -->
<template>
  <div class="login-page" :data-theme="theme">
    <div class="login-container">
      <!-- PANEL IZQUIERDO -->
      <div class="panel left-panel">
        <img src="@/assets/img/descarga.png" alt="Logo ULEAM" class="logo" />
        <h2>Facultad de Odontología ULEAM</h2>
        <p>Bienvenido a la plataforma de gestión clínica.</p>
      </div>

      <!-- PANEL DERECHO -->
      <div class="panel right-panel">
        <!-- Selector de tema -->
        <div class="theme-switcher">
          <label for="sel-theme">Tema:</label>
          <select id="sel-theme" v-model="theme" aria-label="Seleccionar tema">
            <option value="sage-ink">Sage & Ink (sobrio)</option>
            <option value="sunset-eggplant">Sunset & Eggplant (cálido)</option>
            <option value="ocean-gold">Ocean & Gold (elegante)</option>
            <option value="indigo-blush">Indigo & Blush (moderno)</option>
          </select>
        </div>

        <form @submit.prevent="onSubmit" class="login-form" novalidate>
          <h3>Iniciar Sesión</h3>

          <!-- Mostrar errores -->
          <div v-if="authStore.error" class="error-message" role="alert">
            <i class="fas fa-exclamation-triangle" aria-hidden="true"></i>
            {{ authStore.error }}
          </div>

          <div class="input-group">
            <i class="fas fa-envelope" aria-hidden="true"></i>
            <input
              v-model="email"
              type="email"
              placeholder="Correo electrónico"
              required
              :disabled="authStore.loading"
              aria-label="Correo electrónico"
              autocomplete="username"
              inputmode="email"
            />
          </div>

          <div class="input-group">
            <i class="fas fa-lock" aria-hidden="true"></i>
            <input
              v-model="password"
              type="password"
              placeholder="Contraseña"
              required
              :disabled="authStore.loading"
              aria-label="Contraseña"
              autocomplete="current-password"
            />
          </div>

          <button type="submit" class="btn-login" :disabled="authStore.loading">
            <span v-if="!authStore.loading">Entrar</span>
            <span v-else><i class="fas fa-spinner fa-spin"></i> Cargando...</span>
          </button>

          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const email = ref('')
const password = ref('')
const router = useRouter()
const authStore = useAuthStore()

// Cambia el valor por defecto si quieres otro tema inicial
const theme = ref<'sage-ink' | 'sunset-eggplant' | 'ocean-gold' | 'indigo-blush'>('sage-ink')

async function onSubmit() {
  if (authStore.loading) return
  try {
    const user = await authStore.login(email.value.trim(), password.value)
    switch (user.role) {
      case 'admin': router.push({ name: 'HomeAdmin' }); break
      case 'profesor': router.push({ name: 'ProfessorDashboard' }); break
      case 'secretario': router.push({ name: 'PatientManagement' }); break
      case 'estudiante': router.push({ name: 'StudentDashboard' }); break
      default: router.push({ name: 'Login' })
    }
  } catch (error) {
    console.error('Error de login:', error)
  }
}
</script>

<style scoped>
/* ========== BASE (no depende de la paleta) ========== */
.login-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.75rem;
  /* degradé y texturas usan variables del tema */
  background:
    radial-gradient(1200px 600px at 100% -10%, var(--bg-spot-1) 0%, transparent 60%),
    radial-gradient(800px 500px at -10% 110%, var(--bg-spot-2) 0%, transparent 60%),
    linear-gradient(135deg, var(--bg-1) 0%, var(--bg-2) 100%);
}

.login-container {
  display: flex;
  width: 100%;
  max-width: 980px;
  background: var(--surface);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--surface-border);
  box-shadow:
    0 20px 45px rgba(0,0,0,0.18),
    0 4px 12px rgba(0,0,0,0.08);
}

.panel {
  flex: 1;
  padding: 3rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* Branding */
.left-panel {
  position: relative;
  color: var(--on-primary);
  background: linear-gradient(160deg, var(--primary-700) 0%, var(--primary-600) 55%, var(--ink-700) 100%);
  text-align: center;
  isolation: isolate;
}
.left-panel::after{
  content:"";
  position:absolute; inset:0;
  background:
    radial-gradient(600px 220px at 10% 10%, var(--brand-spot-1) 0%, transparent 60%),
    radial-gradient(600px 220px at 90% 90%, var(--brand-spot-2) 0%, transparent 60%);
  pointer-events:none;
}
.left-panel h2 { font-weight: 700; letter-spacing: .2px; margin: .75rem 0 .25rem; }
.left-panel p { color: var(--on-primary-muted); margin: 0; }

/* Logo */
.logo {
  width: 120px; height: auto; margin: 0 auto 1.25rem;
  background: #fff; padding: .6rem; border-radius: 50%;
  border: 3px solid var(--highlight);
  box-shadow: 0 8px 18px rgba(0,0,0,0.25);
}

/* Formulario */
.right-panel { background: linear-gradient(180deg, var(--panel-1) 0%, var(--panel-2) 100%); position: relative; }

.theme-switcher {
  position: absolute; top: 1rem; right: 1rem;
  display: inline-flex; gap: .5rem; align-items: center;
  background: var(--surface); border: 1px solid var(--surface-border);
  padding: .35rem .5rem; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,.04);
  font-size: .85rem; color: var(--ink-700);
}
.theme-switcher select {
  border: 1px solid var(--surface-border);
  border-radius: 8px; padding: .25rem .4rem; background: var(--surface);
  color: var(--ink-700);
}

.login-form {
  width: 100%; max-width: 380px; margin: 0 auto;
  background: var(--form-bg);
  backdrop-filter: saturate(120%) blur(3px);
  padding: 1.25rem 0;
}
.login-form h3 {
  color: var(--primary-600); margin-bottom: 1.25rem; font-weight: 700; position: relative;
}
.login-form h3::after{
  content:""; display:block; width: 64px; height: 4px; margin-top: .35rem;
  border-radius: 999px; background: linear-gradient(90deg, var(--highlight), var(--primary-300));
}

/* Inputs */
.input-group { position: relative; margin-bottom: 1rem; }
.input-group i { position: absolute; top: 50%; left: .9rem; transform: translateY(-50%); color: var(--icon-muted); }
.input-group input {
  width: 100%;
  padding: .8rem .9rem .8rem 2.6rem;
  border: 1.5px solid var(--field-border);
  border-radius: 10px; background: var(--field-bg); color: var(--ink-700);
  transition: border-color .2s ease, box-shadow .2s ease, background .2s ease;
}
.input-group input::placeholder { color: var(--placeholder); }
.input-group input:focus {
  border-color: var(--accent);
  box-shadow:
    0 0 0 .25rem var(--focus-ring),
    0 6px 18px var(--focus-shadow);
  outline: none; background: var(--field-bg-focus);
}

/* Botón */
.btn-login {
  width: 100%; padding: .85rem 1rem;
  background: linear-gradient(135deg, var(--primary-700) 0%, var(--primary-600) 100%);
  color: #fff; border: 0; border-radius: 12px;
  font-size: 1rem; font-weight: 700; letter-spacing: .2px;
  transition: transform .08s ease, box-shadow .2s ease, filter .2s ease, background .2s ease;
  box-shadow: 0 10px 20px var(--btn-shadow);
}
.btn-login:hover:not(:disabled) {
  filter: brightness(.98); transform: translateY(-1px);
  box-shadow: 0 14px 26px var(--btn-shadow-strong), 0 3px 8px rgba(0,0,0,0.08);
}
.btn-login:focus-visible {
  outline: none; box-shadow: 0 0 0 .28rem var(--focus-ring-strong), 0 10px 22px var(--btn-shadow);
}
.btn-login:active { transform: translateY(0); }
.btn-login:disabled {
  background: linear-gradient(135deg, var(--disabled-1), var(--disabled-2));
  color: var(--disabled-on); cursor: not-allowed; box-shadow: none;
}

/* Enlace */
.forgot-link {
  display: inline-block; margin-top: .9rem; font-size: .92rem;
  color: var(--accent); text-decoration: none; font-weight: 600;
}
.forgot-link:hover { text-decoration: underline; }

/* Error */
.error-message {
  background: var(--error-bg);
  border: 1.5px solid var(--danger);
  color: var(--error-text);
  padding: .75rem .9rem; border-radius: 10px; margin-bottom: 1rem;
  font-size: .95rem; display: flex; align-items: center; gap: .55rem;
}
.error-message i { color: var(--danger); }

/* Responsive */
@media (max-width: 992px) {
  .panel { padding: 2.5rem 2rem; }
  .login-form { max-width: 420px; }
}
@media (max-width: 768px) {
  .login-container { flex-direction: column; }
  .left-panel { order: 2; text-align: center; padding: 2rem 1.5rem; }
  .right-panel { order: 1; padding: 2.5rem 1.25rem; }
  .logo { width: 90px; margin-bottom: 1rem; }
  .login-form { width: 100%; max-width: 100%; padding: 0; }
}

/* ========== TEMAS (paletas) ========== */
/* 1) SAGE & INK — sobrio (deriva de tus referencias) */
.login-page[data-theme="sage-ink"]{
  /* fondo */
  --bg-1:#374b4a; --bg-2:#3d2c2e;
  --bg-spot-1:rgba(205,237,158,0.18); --bg-spot-2:rgba(97,63,117,0.12);

  /* superficies */
  --surface:#ffffff; --surface-border:rgba(205,205,205,0.5);
  --panel-1:#fcfcfc; --panel-2:#f7f7f7; --form-bg:#ffffffcc;

  /* primarios */
  --primary-700:#526760; --primary-600:#507255; --primary-300:#79996b;

  /* tinta */
  --ink-900:#3d2c2e; --ink-700:#374b4a; --on-primary:#ffffff; --on-primary-muted:rgba(255,255,255,.85);

  /* acentos */
  --accent:#613f75; --highlight:#cded9e;

  /* campos */
  --field-bg:#fff; --field-bg-focus:#fff; --field-border:#cdcdcd; --placeholder:#9a9a9a; --icon-muted:#7b7b7b;

  /* focus y sombras */
  --focus-ring:rgba(97,63,117,0.18); --focus-shadow:rgba(97,63,117,0.08);
  --focus-ring-strong:rgba(205,237,158,0.45);
  --btn-shadow:rgba(80,114,85,0.25); --btn-shadow-strong:rgba(80,114,85,0.3);

  /* estados */
  --danger:#ef476f; --error-bg:#fff0f4; --error-text:#8b1e3a;
  --disabled-1:#cfcfcf; --disabled-2:#bbbbbb; --disabled-on:#f7f7f7;

  /* decor branding */
  --brand-spot-1:rgba(255,255,255,0.08); --brand-spot-2:rgba(205,237,158,0.1);
}

/* 2) SUNSET & EGGPLANT — cálido */
.login-page[data-theme="sunset-eggplant"]{
  --bg-1:#3a3042; --bg-2:#2b2133;
  --bg-spot-1:rgba(255,209,102,0.18); --bg-spot-2:rgba(239,71,111,0.12);

  --surface:#ffffff; --surface-border:rgba(210,210,210,0.5);
  --panel-1:#fffefe; --panel-2:#f8f6fb; --form-bg:#ffffffcc;

  --primary-700:#613f75; --primary-600:#7a4f8e; --primary-300:#c8b6e2;

  --ink-900:#2b2d42; --ink-700:#3a3f52; --on-primary:#ffffff; --on-primary-muted:rgba(255,255,255,.88);

  --accent:#ef476f; --highlight:#ffd166;

  --field-bg:#ffffff; --field-bg-focus:#ffffff; --field-border:#d0d0d0; --placeholder:#9e9e9e; --icon-muted:#7e7e88;

  --focus-ring:rgba(239,71,111,0.18); --focus-shadow:rgba(239,71,111,0.08);
  --focus-ring-strong:rgba(255,209,102,0.45);
  --btn-shadow:rgba(97,63,117,0.25); --btn-shadow-strong:rgba(97,63,117,0.32);

  --danger:#ef476f; --error-bg:#fff0f4; --error-text:#7b2437;

  --disabled-1:#d8d8d8; --disabled-2:#c6c6c6; --disabled-on:#f4f4f4;

  --brand-spot-1:rgba(255,255,255,0.06); --brand-spot-2:rgba(255,209,102,0.12);
}

/* 3) OCEAN & GOLD — elegante */
.login-page[data-theme="ocean-gold"]{
  --bg-1:#0d3b66; --bg-2:#1b4965;
  --bg-spot-1:rgba(224,180,0,0.16); --bg-spot-2:rgba(95,168,211,0.12);

  --surface:#ffffff; --surface-border:rgba(210,216,222,0.6);
  --panel-1:#fbfdff; --panel-2:#f3f7fa; --form-bg:#ffffffcc;

  --primary-700:#0d3b66; --primary-600:#145da0; --primary-300:#5fa8d3;

  --ink-900:#101418; --ink-700:#1f2937; --on-primary:#ffffff; --on-primary-muted:rgba(255,255,255,.9);

  --accent:#e0b400; --highlight:#e9f5db;

  --field-bg:#ffffff; --field-bg-focus:#ffffff; --field-border:#d1d5db; --placeholder:#98a2b3; --icon-muted:#7b8794;

  --focus-ring:rgba(224,180,0,0.25); --focus-shadow:rgba(20,93,160,0.10);
  --focus-ring-strong:rgba(20,93,160,0.28);
  --btn-shadow:rgba(13,59,102,0.25); --btn-shadow-strong:rgba(13,59,102,0.32);

  --danger:#e63946; --error-bg:#fff2f2; --error-text:#7c1d22;

  --disabled-1:#d9dee3; --disabled-2:#c7cdd3; --disabled-on:#f7f9fb;

  --brand-spot-1:rgba(224,180,0,0.1); --brand-spot-2:rgba(95,168,211,0.1);
}

/* 4) INDIGO & BLUSH — moderno */
.login-page[data-theme="indigo-blush"]{
  --bg-1:#1b1b1e; --bg-2:#0f0f12;
  --bg-spot-1:rgba(255,214,224,0.18); --bg-spot-2:rgba(38,64,139,0.14);

  --surface:#ffffff; --surface-border:rgba(215,215,220,0.55);
  --panel-1:#fdfdff; --panel-2:#f6f7fb; --form-bg:#ffffffcc;

  --primary-700:#26408b; --primary-600:#415a77; --primary-300:#778da9;

  --ink-900:#1b1b1e; --ink-700:#343a40; --on-primary:#ffffff; --on-primary-muted:rgba(255,255,255,.9);

  --accent:#ef476f; --highlight:#ffd6e0;

  --field-bg:#ffffff; --field-bg-focus:#ffffff; --field-border:#d6d6d6; --placeholder:#a0a0a0; --icon-muted:#7d8590;

  --focus-ring:rgba(38,64,139,0.22); --focus-shadow:rgba(38,64,139,0.10);
  --focus-ring-strong:rgba(255,214,224,0.5);
  --btn-shadow:rgba(38,64,139,0.25); --btn-shadow-strong:rgba(38,64,139,0.33);

  --danger:#ef476f; --error-bg:#fff0f4; --error-text:#7a2436;

  --disabled-1:#d7d7dc; --disabled-2:#c4c4ca; --disabled-on:#f6f7fb;

  --brand-spot-1:rgba(38,64,139,0.08); --brand-spot-2:rgba(255,214,224,0.12);
}

/* Modo oscuro del SO (opcional, mantiene esquema del tema) */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: #1e1e1f;
    border-color: rgba(255,255,255,0.06);
  }
  .right-panel {
    background: linear-gradient(180deg, #1f2021 0%, #1b1c1d 100%);
  }
  .login-form { background: #232425cc; }
  .login-form h3 { color: var(--highlight); }
  .input-group input {
    background: #202122; color: #eaeaea;
    border-color: rgba(255,255,255,0.12);
  }
  .input-group input::placeholder { color: #bdbdbd; }
  .forgot-link { color: var(--highlight); }
}
</style>
