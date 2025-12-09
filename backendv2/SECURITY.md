# Estado de Seguridad - backendv2

## Vulnerabilidades Conocidas

### CVE-2025-56200 (GHSA-9965-vmph-33xx)
- **Paquete afectado**: validator.js
- **Versión instalada**: 13.15.15 (la más reciente disponible)
- **Estado**: Sin parche disponible
- **Severidad**: Moderada (6.1/10 CVSS)
- **Descripción**: Vulnerabilidad de bypass en validación de URL en la función isURL()
- **Mitigación**: 
  - Tenemos la versión más reciente de validator.js
  - Se han configurado overrides para asegurar versiones seguras
  - Se monitoriza regularmente para actualizaciones de seguridad

### Acciones Implementadas

1. **Actualización de dependencias NestJS**: Actualizadas a las versiones más recientes (11.0.8)
2. **Overrides configurados**: Forzamos el uso de validator >= 13.12.0 
3. **Resolutions agregadas**: Backup de la configuración de overrides
4. **Monitoreo configurado**: audit-level establecido en high para futuras vulnerabilidades críticas

### Próximos Pasos

1. Monitorear regularmente `npm audit` para nuevas vulnerabilidades
2. Actualizar validator.js cuando se publique un parche para CVE-2025-56200
3. Revisar uso de funciones isURL() en el código si las hay

### Verificación

```bash
npm list validator  # Debería mostrar 13.15.15
npm audit --audit-level high  # No debería mostrar vulnerabilidades high/critical
```

**Fecha de última revisión**: 21 de octubre de 2025