# Odontograma 3D

Aplicación web interactiva de odontograma tridimensional para gestión de la dentadura permanente (32 FDI), registro de condiciones y procedimientos clínicos, y visualización 3D de los tratamientos.

## Stack

- **React 18 + TypeScript + Vite**
- **Three.js / React Three Fiber / drei** para la escena 3D
- **Tailwind CSS** para la interfaz clínica
- **Zustand** para el estado global
- **Vitest** para pruebas unitarias

## Puesta en marcha

```bash
npm install
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`.

## Funcionalidades

### Visualización 3D

- Dentadura completa de 32 piezas (arcada superior e inferior) generadas con geometría paramétrica (lofts superelípticos, campos oclusales con cúspides/fosas/surcos, raíces con rama y curvatura).
- Coronas con cúspides anatómicas, fosa central, surcos de desarrollo, bordes incisales lobulados.
- Raíces visibles con forma de tronco/ramas, curvatura apical.
- Encías semitransparentes con perfil vestibular–lingual.
- Apertura de arcadas, rotación libre, zoom, controles de cámara.
- Vistas predefinidas: frontal, superior, inferior, lateral izquierdo, lateral derecho, restablecer.
- Mostrar/ocultar encías, raíces, conductos y etiquetas FDI.

### Clínico

- Número FDI (ISO 3950) con nombres anatómicos en español.
- Estado clínico derivado: sano, ausente, patología, planificado, tratado.
- Condiciones y procedimientos con superficies dentales (vestibular/lingual/mesial/distal/occlusal).
- Estados de registro: planificado, en proceso, realizado.
- Historial clínico con edición y eliminación.

### Tratamientos visuales

| Procedimiento | Representación 3D |
| --- | --- |
| Caries | Mancha localizada sobre la superficie |
| Fractura | Banda de fractura sobre la superficie |
| Endodoncia | Conducto visual + indicador clínico |
| Corona | Cubierta protésica (shell) sobre la corona |
| Resina / Obturación | Marca de restauración sobre la superficie |
| Sellante | Marca de sellante (fosa/surco) |
| Incrustación | Inlay con reducción de grosor |
| Desgaste | Marca de superficie |
| Implante | Fixture con rosca + abutment + corona protésica |
| Extracción / Ausente | Marcador de alvéolo |
| Movilidad | Indicador clínico |

### Persistencia

- Documento versionado (`odontograma:v1`) en `localStorage`.
- Exportación / importación JSON de la dentadura (descarga / carga de archivo).
- Capa de repositorio preparada para sustitución por API REST + PostgreSQL.

## Arquitectura

```
src/
  types/        → dominio (FDI, tratamientos, estados, vistas)
  data/         → catálogo FDI + catálogo clínico
  models/       → motores 3D (anatomía, coronas, raíces, encías, marcadores)
  components/   → escena R3F, paneles UI, toolbar de cámara
  hooks/        → store global (Zustand) y persistencia
  services/     → repositorio local / API + export-import JSON
  utils/        → derivación de estado clínico y validación
  pages/        → página principal
```

## Comandos

```bash
npm run dev        # servidor de desarrollo
npm run build      # build de producción (tsc + vite)
npm run typecheck  # verificación de tipos
npm test           # pruebas unitarias (Vitest)
```

## Estado actual

- FASE 1–7 en ejecución: escaffolding, dominio, motores 3D, escena, selección, tratamientos, persistencia, pruebas.
- Pendiente: refinamiento visual final (comparación con referencia anatómica), integración API REST.
