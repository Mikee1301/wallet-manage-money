import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    console.log(user);
    if (!user || !user.role) throw new UnauthorizedException('Unauthorized'); // missing token/user}

    if (!requiredRoles.includes(user.role)) throw new ForbiddenException('You do not have permission to access this resource'); 
  
    return requiredRoles.some((role) => user.role === role);
  }
}
