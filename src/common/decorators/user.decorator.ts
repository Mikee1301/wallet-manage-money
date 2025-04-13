// user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

interface UserPayload {
  id: string;
  guid: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

export const User = createParamDecorator(
  (data: keyof UserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
