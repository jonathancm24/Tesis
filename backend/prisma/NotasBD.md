# 📋 Notas de Base de Datos - Sistema Médico

## 🔄 Historial de Cambios

### 📅 **Migración: Tipo de Documento de Identificación**
**Fecha:** 9 de agosto de 2025  
**Migración:** `agregar-tipo-documento-identificacion`

#### 🎯 **Objetivo del Cambio**
Flexibilizar el sistema de identificación para soportar documentos internacionales y mejorar la experiencia de usuarios extranjeros en el sistema médico.

#### 📊 **Tablas Modificadas**

##### **1. Tabla `Usuario`**
```sql
-- ❌ ANTES
cedula String @unique

-- ✅ DESPUÉS
tipoDocumento    TipoDocumento
numeroDocumento  String @unique
```

##### **2. Tabla `Paciente`**
```sql
-- ❌ ANTES  
cedula String @unique

-- ✅ DESPUÉS
tipoDocumento   TipoDocumento
numeroDocumento String @unique
```

##### **3. Nuevo Enum `TipoDocumento`**
```prisma
enum TipoDocumento {
  CEDULA      // Cédula ecuatoriana (10 dígitos)
  PASAPORTE   // Pasaporte internacional (alfanumérico)
  RUC         // RUC ecuatoriano (13 dígitos)
  OTRO        // Otros tipos de identificación
}
```

#### 🌍 **Justificación del Cambio**

##### **Problema Anterior:**
- ❌ Solo aceptaba cédulas ecuatorianas (10 dígitos)
- ❌ Excluía pacientes extranjeros
- ❌ No contemplaba otros documentos (RUC, pasaportes)
- ❌ Limitaba el crecimiento internacional del sistema

##### **Solución Implementada:**
- ✅ **Flexibilidad Internacional**: Acepta pasaportes y documentos extranjeros
- ✅ **Validación Específica**: Cada tipo tiene sus propias reglas de validación
- ✅ **Mejor UX**: Mensajes de error más claros según el tipo de documento
- ✅ **Escalabilidad**: Preparado para expansión internacional

#### 🔍 **Ejemplos de Documentos Soportados**

| Tipo | País | Formato | Ejemplo |
|------|------|---------|---------|
| CEDULA | Ecuador | 10 dígitos | `1234567890` |
| RUC | Ecuador | 13 dígitos | `1234567890001` |
| PASAPORTE | USA | 1 letra + 8 números | `A12345678` |
| PASAPORTE | España | Alfanumérico | `AB123456` |
| OTRO | Variado | 5-20 caracteres | `ID-123456` |

#### 💻 **Impacto en el Código**

##### **DTOs Actualizados:**
```typescript
// Validación flexible según tipo de documento
@IsEnum(TipoDocumento)
tipoDocumento: TipoDocumento;

@ValidateIf(o => o.tipoDocumento === 'CEDULA')
@Matches(/^\d{10}$/, { message: 'Cédula debe tener 10 dígitos' })
numeroDocumento: string;
```

##### **Servicios Impactados:**
- `usuarios.service.ts` - Búsqueda por documento
- `auth.service.ts` - Login con nuevo campo
- `pacientes.service.ts` - Identificación de pacientes
- `global-validation.pipe.ts` - Validaciones actualizadas

#### 🛠️ **Comandos de Migración Ejecutados**
```bash
# Generar migración
npx prisma migrate dev --name "agregar-tipo-documento-identificacion"

# Regenerar cliente Prisma
npx prisma generate

# Verificar estado
npx prisma migrate status
```

## ✅ **Migración Ejecutada: agregar-tipo-documento**

**Fecha:** 9 de agosto de 2025  
**Archivo:** `20250809214920_agregar_tipo_documento/migration.sql`
**Estado:** ✅ Completada exitosamente

### **Datos Migrados:**
- ✅ 5 usuarios: `cedula` → `numeroDocumento` + `tipoDocumento: 'CEDULA'`
- ✅ 1 paciente: `cedula` → `numeroDocumento` + `tipoDocumento: 'CEDULA'`
- ✅ Sin pérdida de datos
- ✅ Integridad preservada

### **Código Actualizado:**
- ✅ DTOs actualizados (`registro.dto.ts` en usuarios y pacientes)
- ✅ Services actualizados (validaciones y mappings)
- ✅ Interfaces actualizadas manteniendo compatibilidad con frontend
- ✅ Todos los errores de compilación resueltos
- ✅ Campo `cedulaRep` → `numeroDocumentoRep` migrado
- ✅ Tipos de frontend actualizados (`types/user.ts`, `types/patient.ts`)
- ✅ Ejemplo de formulario actualizado (`UserForm.vue`)

### **Migración Adicional Ejecutada:**
- ✅ `20250809221353_cambiar_cedula_rep_a_numero_documento`
- ✅ Campo del representante actualizado sin pérdida de datos

### **Mapeo para Compatibilidad:**
```typescript
// En respuestas, se mapea numeroDocumento → cedula para el frontend
const response = {
  ...data,
  cedula: data.numeroDocumento
};
```

### **Verificación Post-Migración:**
```sql
-- Todos los registros tienen datos completos
SELECT 'Usuarios' as tabla, COUNT(*) as total FROM "Usuarios"
UNION ALL
SELECT 'Pacientes' as tabla, COUNT(*) as total FROM "Pacientes";
```

#### 📈 **Beneficios Obtenidos**

1. **🌍 Internacionalización**
   - Acepta pacientes de cualquier nacionalidad
   - Facilita turismo médico
   - Permite profesionales extranjeros

2. **🔒 Seguridad Mejorada**
   - Validación específica por tipo de documento
   - Menos errores de formato
   - Mejor integridad de datos

3. **📊 Analítica Avanzada**
   - Estadísticas por tipo de documento
   - Demografía de usuarios
   - Reportes de origen de pacientes

4. **🚀 Escalabilidad**
   - Fácil agregar nuevos tipos de documento
   - Preparado para normativas internacionales
   - Adaptable a diferentes países

#### ⚠️ **Consideraciones de Migración**

##### **Datos Existentes:**
- Cédulas existentes se migraron automáticamente a `tipoDocumento: 'CEDULA'`
- Campo `cedula` renombrado a `numeroDocumento`
- Sin pérdida de datos en la migración

##### **Validaciones Frontend:**
- Actualizar formularios para incluir selector de tipo de documento
- Implementar validaciones condicionales según tipo seleccionado
- Mejorar mensajes de error para usuarios

#### 🔮 **Próximos Pasos**
- [ ] Implementar validaciones avanzadas para cada tipo de documento
- [ ] Agregar soporte para documentos de más países
- [ ] Crear reportes analíticos por tipo de documento
- [ ] Implementar verificación automática de documentos (API externa)

---

## 📝 **Notas Adicionales**

### **Patrones de Validación por Tipo:**
```regex
CEDULA:    ^\d{10}$                    # 10 dígitos exactos
RUC:       ^\d{13}$                    # 13 dígitos exactos  
PASAPORTE: ^[A-Z0-9]{6,12}$           # 6-12 caracteres alfanuméricos
OTRO:      ^[A-Z0-9\-\s]{5,20}$       # 5-20 caracteres flexibles
```

### **Índices de BD Recomendados:**
```sql
-- Índice compuesto para búsquedas eficientes
CREATE INDEX idx_usuario_documento ON Usuario(tipoDocumento, numeroDocumento);
CREATE INDEX idx_paciente_documento ON Paciente(tipoDocumento, numeroDocumento);
```

---

**Autor:** Jonathan Alexander Cedeño Morán  
**Versión:** 1.2.0  
**Última actualización:** 9 de agosto de 2025