<!-- src/views/student/MessagesView.vue -->
<template>
  <div class="container-fluid p-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="h3 mb-1">Mensajes</h2>
        <p class="text-muted">Comunicación con profesores y administración</p>
      </div>
      <button 
        class="btn btn-primary" 
        data-bs-toggle="modal" 
        data-bs-target="#modalNuevoMensaje"
        @click="nuevoMensaje"
      >
        <i class="fas fa-plus me-2"></i>Nuevo Mensaje
      </button>
    </div>

    <div class="row">
      <!-- Sidebar de conversaciones -->
      <div class="col-lg-4 col-xl-3 mb-4">
        <div class="card h-100">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="card-title mb-0">Conversaciones</h6>
            <div class="dropdown">
              <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                <i class="fas fa-filter"></i>
              </button>
              <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" @click="filtroConversacion = ''">
                  <i class="fas fa-inbox me-2"></i>Todas
                </a></li>
                <li><a class="dropdown-item" href="#" @click="filtroConversacion = 'no_leido'">
                  <i class="fas fa-envelope me-2"></i>No leídos
                </a></li>
                <li><a class="dropdown-item" href="#" @click="filtroConversacion = 'importante'">
                  <i class="fas fa-star me-2"></i>Importantes
                </a></li>
                <li><a class="dropdown-item" href="#" @click="filtroConversacion = 'archivado'">
                  <i class="fas fa-archive me-2"></i>Archivados
                </a></li>
              </ul>
            </div>
          </div>
          
          <div class="card-body p-0">
            <div class="input-group p-3 border-bottom">
              <input 
                v-model="busquedaConversacion" 
                type="text" 
                class="form-control" 
                placeholder="Buscar conversaciones..."
              >
              <button class="btn btn-outline-secondary" type="button">
                <i class="fas fa-search"></i>
              </button>
            </div>

            <div class="conversations-list">
              <div 
                v-for="conversacion in conversacionesFiltradas" 
                :key="conversacion.id"
                class="conversation-item"
                :class="{ 
                  'active': conversacionSeleccionada?.id === conversacion.id,
                  'unread': !conversacion.leido 
                }"
                @click="seleccionarConversacion(conversacion)"
              >
                <div class="d-flex align-items-start p-3">
                  <div class="avatar-container me-3">
                    <div class="avatar">
                      <i class="fas fa-user"></i>
                    </div>
                    <div v-if="!conversacion.leido" class="unread-indicator"></div>
                  </div>
                  
                  <div class="conversation-content flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start">
                      <h6 class="conversation-name mb-1">{{ conversacion.participante }}</h6>
                      <small class="text-muted">{{ formatearHora(conversacion.ultimoMensaje.fecha) }}</small>
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                      <p class="conversation-preview mb-0 text-muted">
                        {{ conversacion.ultimoMensaje.contenido }}
                      </p>
                      <div class="conversation-badges">
                        <i v-if="conversacion.importante" class="fas fa-star text-warning"></i>
                        <span v-if="conversacion.mensajesNoLeidos > 0" class="badge bg-primary rounded-pill">
                          {{ conversacion.mensajesNoLeidos }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="conversacionesFiltradas.length === 0" class="text-center p-4">
                <i class="fas fa-comments fa-2x text-muted mb-2"></i>
                <p class="text-muted">No hay conversaciones</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Área de mensajes -->
      <div class="col-lg-8 col-xl-9">
        <div class="card h-100">
          <!-- Header de conversación -->
          <div v-if="conversacionSeleccionada" class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center">
              <div class="avatar me-3">
                <i class="fas fa-user"></i>
              </div>
              <div>
                <h6 class="mb-0">{{ conversacionSeleccionada.participante }}</h6>
                <small class="text-muted">{{ conversacionSeleccionada.rol }}</small>
              </div>
            </div>
            
            <div class="conversation-actions">
              <div class="btn-group" role="group">
                <button 
                  class="btn btn-outline-secondary btn-sm"
                  @click="marcarImportante(conversacionSeleccionada)"
                  :class="{ active: conversacionSeleccionada.importante }"
                >
                  <i class="fas fa-star"></i>
                </button>
                <button 
                  class="btn btn-outline-secondary btn-sm"
                  @click="archivarConversacion(conversacionSeleccionada)"
                >
                  <i class="fas fa-archive"></i>
                </button>
                <div class="dropdown">
                  <button class="btn btn-outline-secondary btn-sm" data-bs-toggle="dropdown">
                    <i class="fas fa-ellipsis-v"></i>
                  </button>
                  <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#" @click="marcarComoLeido(conversacionSeleccionada)">
                      <i class="fas fa-check me-2"></i>Marcar como leído
                    </a></li>
                    <li><a class="dropdown-item" href="#" @click="silenciarConversacion(conversacionSeleccionada)">
                      <i class="fas fa-bell-slash me-2"></i>Silenciar
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item text-danger" href="#" @click="eliminarConversacion(conversacionSeleccionada)">
                      <i class="fas fa-trash me-2"></i>Eliminar
                    </a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Área de mensajes -->
          <div class="card-body messages-container">
            <div v-if="!conversacionSeleccionada" class="d-flex flex-column align-items-center justify-content-center h-100 text-center">
              <i class="fas fa-comments fa-4x text-muted mb-3"></i>
              <h5 class="text-muted">Selecciona una conversación</h5>
              <p class="text-muted">Elige una conversación del panel izquierdo para ver los mensajes</p>
            </div>

            <div v-else class="messages-list">
              <div class="messages-date-group" v-for="grupo in mensajesAgrupados" :key="grupo.fecha">
                <div class="date-divider">
                  <span class="date-label">{{ grupo.fecha }}</span>
                </div>
                
                <div 
                  v-for="mensaje in grupo.mensajes" 
                  :key="mensaje.id"
                  class="message"
                  :class="{ 'message-sent': mensaje.esPropio, 'message-received': !mensaje.esPropio }"
                >
                  <div class="message-bubble">
                    <div class="message-content">
                      {{ mensaje.contenido }}
                    </div>
                    <div v-if="mensaje.archivos && mensaje.archivos.length > 0" class="message-attachments">
                      <div 
                        v-for="archivo in mensaje.archivos" 
                        :key="archivo"
                        class="attachment-item"
                      >
                        <i class="fas fa-paperclip me-1"></i>{{ archivo }}
                      </div>
                    </div>
                    <div class="message-meta">
                      <small class="text-muted">
                        {{ formatearHoraCompleta(mensaje.fecha) }}
                        <i v-if="mensaje.esPropio && mensaje.leido" class="fas fa-check-double text-primary ms-1"></i>
                        <i v-else-if="mensaje.esPropio" class="fas fa-check text-muted ms-1"></i>
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input para nuevo mensaje -->
          <div v-if="conversacionSeleccionada" class="card-footer">
            <form @submit.prevent="enviarMensaje" class="message-input-form">
              <div class="input-group">
                <button 
                  type="button" 
                  class="btn btn-outline-secondary"
                  @click="adjuntarArchivo"
                >
                  <i class="fas fa-paperclip"></i>
                </button>
                <textarea 
                  v-model="nuevoMensajeTexto"
                  class="form-control message-input"
                  placeholder="Escribe tu mensaje..."
                  rows="1"
                  @keydown.enter.prevent="enviarMensaje"
                  @input="ajustarAlturaTextarea"
                ></textarea>
                <button 
                  type="submit" 
                  class="btn btn-primary"
                  :disabled="!nuevoMensajeTexto.trim()"
                >
                  <i class="fas fa-paper-plane"></i>
                </button>
              </div>
              
              <div v-if="archivosAdjuntos.length > 0" class="attached-files mt-2">
                <div class="d-flex flex-wrap gap-2">
                  <span 
                    v-for="(archivo, index) in archivosAdjuntos" 
                    :key="index"
                    class="badge bg-light text-dark d-flex align-items-center"
                  >
                    <i class="fas fa-paperclip me-1"></i>{{ archivo }}
                    <button 
                      type="button" 
                      class="btn-close btn-close-sm ms-2"
                      @click="removerArchivoAdjunto(index)"
                    ></button>
                  </span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Modal Nuevo Mensaje -->
  <div class="modal fade" id="modalNuevoMensaje" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Nuevo Mensaje</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="enviarNuevoMensaje">
            <div class="mb-3">
              <label class="form-label">Para *</label>
              <select v-model="formNuevoMensaje.destinatario" class="form-select" required>
                <option value="">Seleccionar destinatario</option>
                <option value="Dr. Juan Pérez">Dr. Juan Pérez - Operatoria</option>
                <option value="Dr. María García">Dr. María García - Endodoncia</option>
                <option value="Dr. Carlos López">Dr. Carlos López - Periodoncia</option>
                <option value="Dr. Ana Rodríguez">Dr. Ana Rodríguez - Cirugía</option>
                <option value="Coordinación Académica">Coordinación Académica</option>
                <option value="Secretaría">Secretaría</option>
              </select>
            </div>

            <div class="mb-3">
              <label class="form-label">Asunto *</label>
              <input 
                v-model="formNuevoMensaje.asunto" 
                type="text" 
                class="form-control" 
                placeholder="Asunto del mensaje"
                required
              >
            </div>

            <div class="mb-3">
              <label class="form-label">Mensaje *</label>
              <textarea 
                v-model="formNuevoMensaje.contenido" 
                class="form-control" 
                rows="4"
                placeholder="Escribe tu mensaje aquí..."
                required
              ></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">Archivos adjuntos</label>
              <input 
                type="file" 
                class="form-control" 
                multiple
                @change="handleFileUploadNuevoMensaje"
              >
            </div>

            <div v-if="formNuevoMensaje.archivos.length > 0" class="mb-3">
              <label class="form-label">Archivos seleccionados:</label>
              <div class="d-flex flex-wrap gap-2">
                <span 
                  v-for="(archivo, index) in formNuevoMensaje.archivos" 
                  :key="index"
                  class="badge bg-light text-dark d-flex align-items-center"
                >
                  <i class="fas fa-paperclip me-1"></i>{{ archivo }}
                  <button 
                    type="button" 
                    class="btn-close btn-close-sm ms-2"
                    @click="removerArchivoNuevoMensaje(index)"
                  ></button>
                </span>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="button" class="btn btn-primary" @click="enviarNuevoMensaje">
            <i class="fas fa-paper-plane me-2"></i>Enviar
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';

interface Mensaje {
  id: number;
  contenido: string;
  fecha: Date;
  esPropio: boolean;
  leido: boolean;
  archivos?: string[];
}

interface Conversacion {
  id: number;
  participante: string;
  rol: string;
  ultimoMensaje: {
    contenido: string;
    fecha: Date;
  };
  mensajes: Mensaje[];
  leido: boolean;
  importante: boolean;
  mensajesNoLeidos: number;
  archivado: boolean;
}

interface FormNuevoMensaje {
  destinatario: string;
  asunto: string;
  contenido: string;
  archivos: string[];
}

// Estados reactivos
const busquedaConversacion = ref('');
const filtroConversacion = ref('');
const conversacionSeleccionada = ref<Conversacion | null>(null);
const nuevoMensajeTexto = ref('');
const archivosAdjuntos = ref<string[]>([]);

const formNuevoMensaje = ref<FormNuevoMensaje>({
  destinatario: '',
  asunto: '',
  contenido: '',
  archivos: []
});

// Datos de ejemplo
const conversaciones = ref<Conversacion[]>([
  {
    id: 1,
    participante: 'Dr. Juan Pérez',
    rol: 'Profesor de Operatoria',
    ultimoMensaje: {
      contenido: 'Perfecto, nos vemos el viernes para la práctica.',
      fecha: new Date('2025-02-05T14:30:00')
    },
    leido: true,
    importante: false,
    mensajesNoLeidos: 0,
    archivado: false,
    mensajes: [
      {
        id: 1,
        contenido: 'Buenos días Dr. Pérez, ¿podríamos programar una práctica adicional de operatoria?',
        fecha: new Date('2025-02-05T09:15:00'),
        esPropio: true,
        leido: true
      },
      {
        id: 2,
        contenido: 'Hola! Claro que sí, podemos hacerlo el viernes por la tarde. ¿Te parece bien a las 3:00 PM?',
        fecha: new Date('2025-02-05T10:20:00'),
        esPropio: false,
        leido: true
      },
      {
        id: 3,
        contenido: 'Perfecto, nos vemos el viernes para la práctica.',
        fecha: new Date('2025-02-05T14:30:00'),
        esPropio: true,
        leido: true
      }
    ]
  },
  {
    id: 2,
    participante: 'Dr. María García',
    rol: 'Profesora de Endodoncia',
    ultimoMensaje: {
      contenido: 'He revisado tu caso clínico, tienes algunos puntos que mejorar...',
      fecha: new Date('2025-02-04T16:45:00')
    },
    leido: false,
    importante: true,
    mensajesNoLeidos: 2,
    archivado: false,
    mensajes: [
      {
        id: 4,
        contenido: 'Doctora, le envío mi caso clínico de endodoncia para revisión.',
        fecha: new Date('2025-02-04T14:00:00'),
        esPropio: true,
        leido: true,
        archivos: ['caso_endodoncia.pdf']
      },
      {
        id: 5,
        contenido: 'He revisado tu caso clínico, tienes algunos puntos que mejorar...',
        fecha: new Date('2025-02-04T16:45:00'),
        esPropio: false,
        leido: false,
        archivos: ['retroalimentacion.pdf']
      },
      {
        id: 6,
        contenido: 'Por favor, revisa mis comentarios y programa una cita para discutir los hallazgos.',
        fecha: new Date('2025-02-04T16:46:00'),
        esPropio: false,
        leido: false
      }
    ]
  },
  {
    id: 3,
    participante: 'Coordinación Académica',
    rol: 'Administración',
    ultimoMensaje: {
      contenido: 'Tu solicitud ha sido aprobada. Puedes proceder con el cambio.',
      fecha: new Date('2025-02-03T11:20:00')
    },
    leido: true,
    importante: false,
    mensajesNoLeidos: 0,
    archivado: false,
    mensajes: [
      {
        id: 7,
        contenido: 'Solicito cambio de horario para las prácticas clínicas por motivos laborales.',
        fecha: new Date('2025-02-02T08:30:00'),
        esPropio: true,
        leido: true
      },
      {
        id: 8,
        contenido: 'Hemos recibido tu solicitud. La revisaremos y te daremos una respuesta pronto.',
        fecha: new Date('2025-02-02T10:15:00'),
        esPropio: false,
        leido: true
      },
      {
        id: 9,
        contenido: 'Tu solicitud ha sido aprobada. Puedes proceder con el cambio.',
        fecha: new Date('2025-02-03T11:20:00'),
        esPropio: false,
        leido: true
      }
    ]
  }
]);

// Computed
const conversacionesFiltradas = computed(() => {
  let filtradas = conversaciones.value;

  // Aplicar filtros
  switch (filtroConversacion.value) {
    case 'no_leido':
      filtradas = filtradas.filter(c => !c.leido);
      break;
    case 'importante':
      filtradas = filtradas.filter(c => c.importante);
      break;
    case 'archivado':
      filtradas = filtradas.filter(c => c.archivado);
      break;
    default:
      filtradas = filtradas.filter(c => !c.archivado);
  }

  // Aplicar búsqueda
  if (busquedaConversacion.value) {
    const termino = busquedaConversacion.value.toLowerCase();
    filtradas = filtradas.filter(c =>
      c.participante.toLowerCase().includes(termino) ||
      c.ultimoMensaje.contenido.toLowerCase().includes(termino)
    );
  }

  // Ordenar por fecha del último mensaje
  return filtradas.sort((a, b) => 
    b.ultimoMensaje.fecha.getTime() - a.ultimoMensaje.fecha.getTime()
  );
});

const mensajesAgrupados = computed(() => {
  if (!conversacionSeleccionada.value) return [];

  const grupos: { fecha: string; mensajes: Mensaje[] }[] = [];
  const mensajes = conversacionSeleccionada.value.mensajes;

  mensajes.forEach(mensaje => {
    const fechaStr = formatearFecha(mensaje.fecha);
    let grupo = grupos.find(g => g.fecha === fechaStr);
    
    if (!grupo) {
      grupo = { fecha: fechaStr, mensajes: [] };
      grupos.push(grupo);
    }
    
    grupo.mensajes.push(mensaje);
  });

  return grupos;
});

// Métodos
const formatearHora = (fecha: Date) => {
  const ahora = new Date();
  const diferencia = ahora.getTime() - fecha.getTime();
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  
  if (dias === 0) {
    return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  } else if (dias === 1) {
    return 'Ayer';
  } else if (dias < 7) {
    return fecha.toLocaleDateString('es-ES', { weekday: 'short' });
  } else {
    return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  }
};

const formatearHoraCompleta = (fecha: Date) => {
  return fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

const formatearFecha = (fecha: Date) => {
  const hoy = new Date();
  const ayer = new Date(hoy);
  ayer.setDate(ayer.getDate() - 1);
  
  if (fecha.toDateString() === hoy.toDateString()) {
    return 'Hoy';
  } else if (fecha.toDateString() === ayer.toDateString()) {
    return 'Ayer';
  } else {
    return fecha.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }
};

const seleccionarConversacion = (conversacion: Conversacion) => {
  conversacionSeleccionada.value = conversacion;
  
  // Marcar como leído
  if (!conversacion.leido) {
    conversacion.leido = true;
    conversacion.mensajesNoLeidos = 0;
    
    // Marcar mensajes individuales como leídos
    conversacion.mensajes.forEach(mensaje => {
      if (!mensaje.esPropio) {
        mensaje.leido = true;
      }
    });
  }
  
  // Scroll al final de los mensajes
  nextTick(() => {
    const messagesContainer = document.querySelector('.messages-list');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
};

const enviarMensaje = () => {
  if (!nuevoMensajeTexto.value.trim() || !conversacionSeleccionada.value) return;
  
  const nuevoMensaje: Mensaje = {
    id: Date.now(),
    contenido: nuevoMensajeTexto.value.trim(),
    fecha: new Date(),
    esPropio: true,
    leido: false,
    archivos: archivosAdjuntos.value.length > 0 ? [...archivosAdjuntos.value] : undefined
  };
  
  conversacionSeleccionada.value.mensajes.push(nuevoMensaje);
  conversacionSeleccionada.value.ultimoMensaje = {
    contenido: nuevoMensaje.contenido,
    fecha: nuevoMensaje.fecha
  };
  
  nuevoMensajeTexto.value = '';
  archivosAdjuntos.value = [];
  
  // Scroll al final
  nextTick(() => {
    const messagesContainer = document.querySelector('.messages-list');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  });
};

const ajustarAlturaTextarea = (event: Event) => {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
};

const adjuntarArchivo = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
  
  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files) {
      const newFiles = Array.from(files).map(file => file.name);
      archivosAdjuntos.value.push(...newFiles);
    }
  };
  
  input.click();
};

const removerArchivoAdjunto = (index: number) => {
  archivosAdjuntos.value.splice(index, 1);
};

const nuevoMensaje = () => {
  formNuevoMensaje.value = {
    destinatario: '',
    asunto: '',
    contenido: '',
    archivos: []
  };
};

const enviarNuevoMensaje = () => {
  // Crear nueva conversación o buscar existente
  let conversacion = conversaciones.value.find(c => 
    c.participante === formNuevoMensaje.value.destinatario
  );
  
  if (!conversacion) {
    conversacion = {
      id: Date.now(),
      participante: formNuevoMensaje.value.destinatario,
      rol: 'Contacto',
      ultimoMensaje: {
        contenido: formNuevoMensaje.value.contenido,
        fecha: new Date()
      },
      mensajes: [],
      leido: true,
      importante: false,
      mensajesNoLeidos: 0,
      archivado: false
    };
    conversaciones.value.push(conversacion);
  }
  
  const nuevoMensaje: Mensaje = {
    id: Date.now(),
    contenido: `${formNuevoMensaje.value.asunto}\n\n${formNuevoMensaje.value.contenido}`,
    fecha: new Date(),
    esPropio: true,
    leido: false,
    archivos: formNuevoMensaje.value.archivos.length > 0 ? [...formNuevoMensaje.value.archivos] : undefined
  };
  
  conversacion.mensajes.push(nuevoMensaje);
  conversacion.ultimoMensaje = {
    contenido: formNuevoMensaje.value.contenido,
    fecha: nuevoMensaje.fecha
  };
  
  console.log('Nuevo mensaje enviado');
};

const handleFileUploadNuevoMensaje = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files) {
    const newFiles = Array.from(target.files).map(file => file.name);
    formNuevoMensaje.value.archivos.push(...newFiles);
  }
};

const removerArchivoNuevoMensaje = (index: number) => {
  formNuevoMensaje.value.archivos.splice(index, 1);
};

const marcarImportante = (conversacion: Conversacion) => {
  conversacion.importante = !conversacion.importante;
  console.log(`Conversación ${conversacion.importante ? 'marcada como' : 'removida de'} importante`);
};

const marcarComoLeido = (conversacion: Conversacion) => {
  conversacion.leido = true;
  conversacion.mensajesNoLeidos = 0;
  conversacion.mensajes.forEach(mensaje => {
    if (!mensaje.esPropio) {
      mensaje.leido = true;
    }
  });
  console.log('Conversación marcada como leída');
};

const archivarConversacion = (conversacion: Conversacion) => {
  conversacion.archivado = true;
  console.log('Conversación archivada');
  
  // Si la conversación archivada está seleccionada, deseleccionar
  if (conversacionSeleccionada.value?.id === conversacion.id) {
    conversacionSeleccionada.value = null;
  }
};

const silenciarConversacion = (conversacion: Conversacion) => {
  console.log(`Conversación con ${conversacion.participante} silenciada`);
};

const eliminarConversacion = (conversacion: Conversacion) => {
  if (confirm('¿Estás seguro de que quieres eliminar esta conversación?')) {
    const index = conversaciones.value.findIndex(c => c.id === conversacion.id);
    if (index !== -1) {
      conversaciones.value.splice(index, 1);
      
      // Si la conversación eliminada está seleccionada, deseleccionar
      if (conversacionSeleccionada.value?.id === conversacion.id) {
        conversacionSeleccionada.value = null;
      }
      
      console.log('Conversación eliminada');
    }
  }
};

onMounted(() => {
  console.log('Vista de mensajes cargada');
});
</script>

<style scoped>
.conversations-list {
  max-height: 500px;
  overflow-y: auto;
}

.conversation-item {
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  border-bottom: 1px solid #f1f3f4;
}

.conversation-item:hover {
  background-color: #f8f9fa;
}

.conversation-item.active {
  background-color: #e3f2fd;
  border-left: 4px solid #1976d2;
}

.conversation-item.unread {
  background-color: #f8f9fa;
  font-weight: 600;
}

.avatar-container {
  position: relative;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.unread-indicator {
  position: absolute;
  top: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  background-color: #dc3545;
  border-radius: 50%;
  border: 2px solid white;
}

.conversation-name {
  font-size: 0.95rem;
  font-weight: 600;
}

.conversation-preview {
  font-size: 0.85rem;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-badges {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.messages-container {
  height: 500px;
  display: flex;
  flex-direction: column;
}

.messages-list {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.messages-date-group {
  margin-bottom: 1.5rem;
}

.date-divider {
  text-align: center;
  margin-bottom: 1rem;
}

.date-label {
  background-color: #f8f9fa;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.8rem;
  color: #6c757d;
}

.message {
  margin-bottom: 1rem;
  display: flex;
}

.message-sent {
  justify-content: flex-end;
}

.message-received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  position: relative;
}

.message-sent .message-bubble {
  background-color: #007bff;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message-received .message-bubble {
  background-color: #f8f9fa;
  color: #212529;
  border-bottom-left-radius: 0.25rem;
}

.message-content {
  margin-bottom: 0.25rem;
}

.message-attachments {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.2);
}

.message-sent .message-attachments {
  border-top-color: rgba(255,255,255,0.2);
}

.message-received .message-attachments {
  border-top-color: #dee2e6;
}

.attachment-item {
  font-size: 0.85rem;
  margin-bottom: 0.25rem;
}

.message-meta {
  text-align: right;
  margin-top: 0.25rem;
}

.message-received .message-meta {
  text-align: left;
}

.message-input-form {
  position: relative;
}

.message-input {
  min-height: 38px;
  max-height: 120px;
  resize: none;
  border-radius: 1.5rem;
  padding: 0.75rem 1rem;
}

.attached-files {
  padding-left: 0.75rem;
}

.btn-close-sm {
  font-size: 0.7rem;
  width: 0.8rem;
  height: 0.8rem;
}

.conversation-actions .btn-group .btn.active {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}
</style>
