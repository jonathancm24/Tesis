# Política de Seguridad – backendv2

## Descripción General

Este proyecto es una aplicación backend académica desarrollada con **NestJS**, diseñada para ejecutarse en entornos controlados.  
La gestión de seguridad se realiza siguiendo **buenas prácticas del ecosistema Node.js**, priorizando la **estabilidad en tiempo de ejecución, la compatibilidad y la reproducibilidad** del entorno sobre actualizaciones forzadas que introduzcan cambios incompatibles.

---

## Gestión de Vulnerabilidades en Dependencias

El proyecto utiliza `npm audit` como herramienta de monitoreo de vulnerabilidades en dependencias directas y transitivas.  
Algunas vulnerabilidades reportadas **no se corrigen automáticamente** debido a que su impacto real es bajo o nulo en el contexto del proyecto, o porque su corrección implicaría **breaking changes** que afectarían la estabilidad del sistema.

---

## Vulnerabilidades Conocidas y Evaluación de Riesgo

### 1. ESLint (Severidad moderada – Dependencia de desarrollo)

- **Paquete afectado**: `eslint < 9.x`
- **Alcance**: Solo entorno de desarrollo
- **Contexto**:
  - ESLint se utiliza únicamente para análisis estático del código.
  - No se ejecuta en producción ni procesa datos del usuario.
- **Evaluación de riesgo**: Bajo
- **Mitigación**:
  - ESLint está correctamente aislado como `devDependency`.
  - No existe impacto en el entorno de ejecución del backend.

---

### 2. Lodash (Severidad moderada – Dependencia transitiva)

- **Paquete afectado**: `lodash`
- **Introducido por**: `@nestjs/config`
- **Contexto**:
  - Lodash no es utilizado directamente por el código de la aplicación.
  - La vulnerabilidad reportada afecta funciones específicas (`_.unset`, `_.omit`) bajo escenarios de uso inseguro.
- **Evaluación de riesgo**: Bajo
- **Mitigación**:
  - Se aplican `overrides` y `resolutions` para asegurar versiones seguras cuando es posible.
  - Forzar una corrección automática implicaría degradar o romper dependencias clave de NestJS, lo cual no es aceptable para este proyecto.

---

### 3. tar / bcrypt (Severidad alta – Dependencias de instalación)

- **Paquetes afectados**: `tar`, `@mapbox/node-pre-gyp`
- **Contexto**:
  - Estas dependencias se utilizan durante la instalación o compilación de binarios.
  - No se ejecutan en tiempo de ejecución ni exponen operaciones al usuario final.
- **Evaluación de riesgo**: Bajo en contexto de ejecución
- **Mitigación**:
  - El backend no expone operaciones de sistema de archivos relacionadas con estas dependencias.
  - Forzar actualizaciones implicaría migrar a versiones mayores de `bcrypt`, introduciendo cambios incompatibles sin beneficio práctico.

---

## Motivo por el cual no se utiliza `npm audit fix --force`

El uso de `npm audit fix --force` se evita deliberadamente porque:

- Introduce **breaking changes** en dependencias críticas (NestJS, ESLint, bcrypt).
- Reduce la estabilidad y reproducibilidad del proyecto.
- No aporta mejoras reales de seguridad en vulnerabilidades que no afectan el entorno de ejecución.

El proyecto adopta un enfoque de **gestión de riesgos controlada**, en lugar de correcciones automáticas agresivas.

---

## Endurecimiento del Entorno

- **Versión de Node.js**: 20 LTS (fijada explícitamente)
- **Bloqueo de dependencias**: `package-lock.json`
- Uso de `overrides` y `resolutions` cuando aplica
- Auditorías periódicas con `npm audit`

---

## Monitoreo

- Se ejecuta `npm audit` de forma regular.
- Se priorizan vulnerabilidades **críticas o explotables en runtime**.
- Este documento se actualiza conforme aparezca información relevante.

---

**Última revisión**: Febrero 2026
