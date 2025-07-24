-- CreateTable
CREATE TABLE "Permisos" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT NOT NULL,

    CONSTRAINT "Permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolesPermisos" (
    "id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,

    CONSTRAINT "RolesPermisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuariosPermisos" (
    "id" SERIAL NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "permiso_id" INTEGER NOT NULL,
    "otorgado_por" INTEGER,
    "fecha_otorgamiento" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_expiracion" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "justificacion" TEXT,

    CONSTRAINT "UsuariosPermisos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permisos_nombre_key" ON "Permisos"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "RolesPermisos_role_id_permiso_id_key" ON "RolesPermisos"("role_id", "permiso_id");

-- CreateIndex
CREATE UNIQUE INDEX "UsuariosPermisos_usuario_id_permiso_id_key" ON "UsuariosPermisos"("usuario_id", "permiso_id");

-- AddForeignKey
ALTER TABLE "RolesPermisos" ADD CONSTRAINT "RolesPermisos_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "Roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolesPermisos" ADD CONSTRAINT "RolesPermisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "Permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosPermisos" ADD CONSTRAINT "UsuariosPermisos_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "Usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosPermisos" ADD CONSTRAINT "UsuariosPermisos_permiso_id_fkey" FOREIGN KEY ("permiso_id") REFERENCES "Permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuariosPermisos" ADD CONSTRAINT "UsuariosPermisos_otorgado_por_fkey" FOREIGN KEY ("otorgado_por") REFERENCES "Usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
