import { Post, Get, Body, Controller  } from "@nestjs/common";
import { RolService } from "./rol.service";
import { NuevoRoleDto } from "./DTO/nuevo.dto";

@Controller("roles")
export class RolController {
  constructor(private readonly rolService: RolService) {}
    @Post("")
    async agregarRol(@Body() dto: NuevoRoleDto) {
        return this.rolService.agregarRol(dto);
    }
    @Get("")
    async obtenerTodosLosRoles() {
        return this.rolService.obtenerTodosLosRoles();
    }
}

