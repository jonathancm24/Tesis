# Documentación: Carga Masiva de Usuarios

## Formato de Archivo Excel

Para realizar una carga masiva de usuarios, el archivo Excel debe contener las siguientes columnas **exactamente** con estos nombres:

### Columnas Requeridas

| Columna | Tipo | Descripción | Valores Permitidos | Ejemplo |
|---------|------|-------------|-------------------|---------|
| `nombre` | Texto | Nombre del usuario | Mínimo 2 caracteres | Juan |
| `apellido` | Texto | Apellido del usuario | Mínimo 2 caracteres | Pérez |
| `email` | Email | Email único del usuario | Formato email válido | juan.perez@ejemplo.com |
| `tipoDocumento` | Texto | Tipo de documento | CEDULA, PASAPORTE, RUC | CEDULA |
| `numeroDocumento` | Texto | Número de documento único | Según tipo de documento | 1234567890 |
| `fechaNacimiento` | Fecha | Fecha de nacimiento | Formato YYYY-MM-DD | 1990-01-15 |
| `role` | Texto | Rol del usuario | admin, profesor, estudiante, secretario, paciente | estudiante |

### Columnas Opcionales

| Columna | Tipo | Descripción | Valor por defecto |
|---------|------|-------------|-------------------|
| `parroquiaId` | Número | ID de la parroquia | 1 (parroquia por defecto) |

## Validaciones

### Validaciones por Tipo de Documento

- **CEDULA**: Debe tener 10 dígitos
- **PASAPORTE**: Alfanumérico, 6-20 caracteres
- **RUC**: Debe tener 13 dígitos

### Validaciones de Email

- Debe ser un email válido (contener @ y dominio)
- Debe ser único en el sistema

### Validaciones de Fecha

- Formato: YYYY-MM-DD (por ejemplo: 1990-01-15)
- También acepta fechas de Excel convertidas automáticamente

### Validaciones de Rol

Los roles permitidos son:
- `admin`: Administrador del sistema
- `profesor`: Profesor
- `estudiante`: Estudiante
- `secretario`: Secretario
- `paciente`: Paciente

## Comportamiento del Sistema

### Usuarios Nuevos
- Se crean con contraseña temporal generada automáticamente
- Se asignan a la parroquia por defecto si no se especifica
- Se activan automáticamente

### Usuarios Duplicados
- Si ya existe un usuario con el mismo email o documento:
  - Si está **inactivo**: Se reactiva automáticamente
  - Si está **activo**: Se reporta como duplicado sin cambios

### Errores Comunes

1. **Columnas faltantes**: Verificar que todas las columnas requeridas estén presentes
2. **Email duplicado**: El email ya existe en el sistema
3. **Documento duplicado**: El número de documento ya existe
4. **Formato de fecha inválido**: Usar formato YYYY-MM-DD
5. **Rol inválido**: Usar solo los roles permitidos
6. **Archivo muy grande**: Máximo 5MB

## Ejemplo de Archivo Excel

```
nombre    | apellido  | email                      | tipoDocumento | numeroDocumento | fechaNacimiento | role
----------|-----------|----------------------------|---------------|-----------------|-----------------|----------
Juan      | Pérez     | juan.perez@ejemplo.com     | CEDULA        | 1234567890      | 1990-01-15     | estudiante
María     | González  | maria.gonzalez@ejemplo.com | CEDULA        | 0987654321      | 1985-06-20     | profesor
Carlos    | López     | carlos.lopez@ejemplo.com   | PASAPORTE     | ABC123456       | 1992-03-10     | estudiante
Ana       | Martínez  | ana.martinez@ejemplo.com   | RUC           | 1234567890001   | 1988-12-05     | secretario
```

## Proceso de Carga

1. **Subir archivo**: Seleccionar archivo Excel (.xlsx o .xls)
2. **Validación**: El sistema valida formato y datos
3. **Revisión**: Ver usuarios válidos, duplicados y con errores
4. **Procesamiento**: Crear usuarios válidos y reactivar duplicados inactivos
5. **Resultados**: Ver resumen con contraseñas temporales generadas

## Recomendaciones

- **Backup**: Hacer copia de seguridad antes de cargas masivas
- **Prueba pequeña**: Probar con pocos usuarios primero
- **Contraseñas**: Informar a usuarios sobre sus contraseñas temporales
- **Activación**: Solicitar cambio de contraseña en primer acceso
- **Roles**: Verificar que los roles asignados sean correctos

## Límites

- **Tamaño de archivo**: Máximo 5MB
- **Formatos**: Solo .xlsx y .xls
- **Usuarios por carga**: Sin límite específico, pero recomendado < 1000

## Soporte

Si encuentras problemas durante la carga masiva:

1. Verificar que el formato del Excel sea correcto
2. Revisar los mensajes de error específicos
3. Contactar al administrador del sistema si persisten los problemas
